#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";

loadDotEnv();

const channelSecret = process.env.LINE_CHANNEL_SECRET;
const port = Number(process.env.LINE_BOT_PORT || 3000);
const text = process.argv.slice(2).join(" ") || "狀態";

function loadDotEnv(filePath = ".env") {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

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

if (!channelSecret) {
  console.error("LINE_CHANNEL_SECRET is required to sign the simulated webhook.");
  process.exit(1);
}

const body = JSON.stringify({
  destination: "local-simulator",
  events: [
    {
      type: "message",
      mode: "active",
      timestamp: Date.now(),
      source: {
        type: "user",
        userId: "local-simulator-user"
      },
      replyToken: `local-reply-${Date.now()}`,
      webhookEventId: `local-${Date.now()}`,
      deliveryContext: {
        isRedelivery: false
      },
      message: {
        id: `local-message-${Date.now()}`,
        type: "text",
        text
      }
    }
  ]
});

const signature = crypto
  .createHmac("sha256", channelSecret)
  .update(body)
  .digest("base64");

const response = await fetch(`http://127.0.0.1:${port}/line/webhook`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-line-signature": signature
  },
  body
});

console.log(`POST /line/webhook ${response.status}`);
console.log(await response.text());
