#!/usr/bin/env node
import crypto from "node:crypto";

const channelSecret = process.env.LINE_CHANNEL_SECRET;
const port = Number(process.env.LINE_BOT_PORT || 3000);
const text = process.argv.slice(2).join(" ") || "狀態";

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
