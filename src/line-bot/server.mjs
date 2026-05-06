import crypto from "node:crypto";
import http from "node:http";

const port = Number(process.env.LINE_BOT_PORT || 3000);
const channelSecret = process.env.LINE_CHANNEL_SECRET;
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;

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

  const payload = JSON.parse(rawBody.toString("utf8"));
  const events = Array.isArray(payload.events) ? payload.events : [];

  await Promise.all(events.map(handleLineEvent));

  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ ok: true }));
}

async function handleLineEvent(event) {
  if (event.type !== "message" || event.message?.type !== "text") return;

  const text = event.message.text.trim();
  const reply = buildReply(text);

  if (event.replyToken && reply) {
    await replyText(event.replyToken, reply);
  }
}

function buildReply(text) {
  if (["help", "說明", "幫助"].includes(text.toLowerCase())) {
    return [
      "English short sentence teaching bot is connected.",
      "Try:",
      "記憶: 今天決定先測 LINE Bot",
      "狀態",
      "生成測試"
    ].join("\n");
  }

  if (text === "狀態") {
    return "目前是 LINE Bot MVP：已能接 webhook、驗證簽章、回覆文字。下一步會接專案記憶與任務佇列。";
  }

  if (text.startsWith("記憶:") || text.startsWith("記憶：")) {
    const note = text.replace(/^記憶[:：]\s*/, "");
    return `收到，我先記成待整理筆記：${note}`;
  }

  if (text === "生成測試") {
    return "收到生成測試指令。現在還沒接影片 pipeline，之後會改成建立本機 worker 任務。";
  }

  return `收到：${text}`;
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "GET" && request.url === "/health") {
      response.writeHead(200, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ ok: true, service: "line-bot" }));
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

server.listen(port, () => {
  console.log(`LINE bot server listening on http://127.0.0.1:${port}`);
  console.log(`Webhook path: /line/webhook`);
});
