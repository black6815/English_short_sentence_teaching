import crypto from "node:crypto";
import fs from "node:fs/promises";
import fsSync from "node:fs";
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { writeDailyPhraseDraft } from "../content/phrases.mjs";

loadDotEnv();

const port = Number(process.env.LINE_BOT_PORT || 3000);
const channelSecret = process.env.LINE_CHANNEL_SECRET;
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const allowedUserIds = parseCsvEnv(process.env.LINE_ALLOWED_USER_IDS);
const replyMode = process.env.LINE_REPLY_MODE || "send";

function loadDotEnv(filePath = ".env") {
  if (!fsSync.existsSync(filePath)) return;

  const lines = fsSync.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseCsvEnv(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getConfigStatus() {
  return {
    port,
    hasChannelSecret: Boolean(channelSecret),
    hasChannelAccessToken: Boolean(channelAccessToken),
    allowedUserCount: allowedUserIds.length,
    replyMode
  };
}

function verifyLineSignature(rawBody, signature) {
  if (!channelSecret || !signature) return false;

  const digest = crypto
    .createHmac("sha256", channelSecret)
    .update(rawBody)
    .digest("base64");

  const expected = Buffer.from(digest);
  const actual = Buffer.from(signature);

  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

async function replyText(replyToken, text) {
  if (replyMode === "log") {
    console.log(`[LINE reply log mode]\n${text}`);
    return;
  }

  if (!channelAccessToken) {
    console.warn("LINE_CHANNEL_ACCESS_TOKEN is not set; skipping reply.");
    return;
  }

  const response = await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${channelAccessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      replyToken,
      messages: [{ type: "text", text }]
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`LINE reply failed: ${response.status} ${body}`);
  }
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

async function handleWebhook(request, response) {
  const rawBody = await collectRequestBody(request);
  const signature = request.headers["x-line-signature"];

  if (!verifyLineSignature(rawBody, signature)) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "Invalid LINE signature" }));
    return;
  }

  let payload;

  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    response.writeHead(400, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "Invalid JSON body" }));
    return;
  }

  const events = Array.isArray(payload.events) ? payload.events : [];

  await Promise.all(events.map(handleLineEvent));

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ ok: true }));
}

async function handleLineEvent(event) {
  if (event.type !== "message" || event.message?.type !== "text") return;

  if (!isAllowedLineSource(event.source)) {
    console.warn(`Blocked LINE event from unauthorized source: ${event.source?.userId || "unknown"}`);
    return;
  }

  const text = event.message.text.trim();
  const reply = await buildReply(text, event);

  if (event.replyToken && reply) {
    await replyText(event.replyToken, reply);
  }
}

function isAllowedLineSource(source) {
  if (allowedUserIds.length === 0) return true;
  return Boolean(source?.userId && allowedUserIds.includes(source.userId));
}

function formatLocalDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function appendSessionNote(note, source = {}) {
  const dateText = formatLocalDate();
  const notesDir = path.join("docs", "session-notes");
  const notesFile = path.join(notesDir, `${dateText}.md`);
  const timestamp = new Date().toISOString();
  const sourceLabel = source.userId ? `LINE user ${source.userId}` : "LINE";
  const entry = `\n## ${timestamp}\n\nSource: ${sourceLabel}\n\n${note}\n`;

  await fs.mkdir(notesDir, { recursive: true });

  try {
    await fs.access(notesFile);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    await fs.writeFile(notesFile, `# Session Notes - ${dateText}\n`, "utf8");
  }

  await fs.appendFile(notesFile, entry, "utf8");

  return notesFile;
}

async function buildReply(text, event = {}) {
  const normalized = text.toLowerCase();

  if (["help", "說明", "幫助"].includes(normalized)) {
    return [
      "English short sentence teaching bot is connected.",
      "可用指令：",
      "狀態",
      "我的ID",
      "記憶: 今天的專案筆記",
      "生成短句",
      "生成測試"
    ].join("\n");
  }

  if (["我的id", "我的ID".toLowerCase(), "my id"].includes(normalized)) {
    return event.source?.userId
      ? `你的 LINE userId：${event.source.userId}`
      : "這個事件沒有提供 LINE userId。";
  }

  if (text === "狀態" || normalized === "status") {
    const status = getConfigStatus();
    return [
      "LINE Bot 狀態",
      `webhook：本機 port ${status.port}`,
      `channel secret：${status.hasChannelSecret ? "已設定" : "未設定"}`,
      `access token：${status.hasChannelAccessToken ? "已設定" : "未設定"}`,
      `允許使用者：${status.allowedUserCount > 0 ? `${status.allowedUserCount} 位` : "未限制"}`,
      `回覆模式：${status.replyMode}`
    ].join("\n");
  }

  if (text.startsWith("記憶:") || text.startsWith("記憶：")) {
    const note = text.replace(/^記憶[:：]\s*/, "");
    if (!note) return "請在「記憶:」後面加上要保存的筆記。";

    try {
      const notesFile = await appendSessionNote(note, event.source);
      return `已寫入專案筆記：${notesFile}`;
    } catch (error) {
      return `寫入筆記失敗：${error.message}`;
    }
  }

  if (text === "生成短句" || text === "生成測試") {
    try {
      const result = await writeDailyPhraseDraft({ force: true });
      return [
        "已產生今日短句草稿。",
        `檔案：${result.outputFile}`,
        `句數：${result.draft.phrases.length}`,
        "下一步可以接 TTS、圖片與影片渲染。"
      ].join("\n");
    } catch (error) {
      return `產生短句草稿失敗：${error.message}`;
    }
  }

  return `收到：${text}`;
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true, service: "line-bot", config: getConfigStatus() }));
      return;
    }

    if (request.method === "POST" && request.url === "/line/webhook") {
      await handleWebhook(request, response);
      return;
    }

    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "Not found" }));
  } catch (error) {
    console.error(error);
    response.writeHead(500, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "Internal server error" }));
  }
});

function logStartupStatus() {
  const status = getConfigStatus();

  console.log(`LINE bot server listening on http://127.0.0.1:${port}`);
  console.log("Webhook path: /line/webhook");
  console.log(`LINE_CHANNEL_SECRET: ${status.hasChannelSecret ? "set" : "missing"}`);
  console.log(`LINE_CHANNEL_ACCESS_TOKEN: ${status.hasChannelAccessToken ? "set" : "missing"}`);
  console.log(`LINE_ALLOWED_USER_IDS: ${status.allowedUserCount > 0 ? `${status.allowedUserCount} configured` : "not restricted"}`);
  console.log(`LINE_REPLY_MODE: ${replyMode}`);
}

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  server.listen(port, logStartupStatus);
}

export {
  appendSessionNote,
  buildReply,
  getConfigStatus,
  handleWebhook,
  isAllowedLineSource,
  server,
  verifyLineSignature
};
