# LINE Bot Setup

This document describes the first LINE Bot MVP for this project.

## What This MVP Does

- Starts a local webhook server.
- Verifies LINE webhook signatures with `x-line-signature`.
- Replies to simple text commands.
- Provides a health check at `/health`.
- Optionally restricts control to approved LINE user IDs.
- Writes `記憶: ...` notes to `docs/session-notes/YYYY-MM-DD.md`.

The server is intentionally dependency-free and uses Node.js 20 built-in APIs.

## Commands

```powershell
npm run line:check
npm run line:dev
npm run line:simulate -- 狀態
```

Local URLs:

```text
http://127.0.0.1:3000/health
http://127.0.0.1:3000/line/webhook
```

LINE cannot call `127.0.0.1` directly. For real webhook testing, expose the local server with an HTTPS tunnel such as ngrok, Cloudflare Tunnel, or another public HTTPS endpoint.

Example webhook URL after tunneling:

```text
https://your-tunnel-domain.example/line/webhook
```

## Required LINE Settings

Create a LINE Developers Messaging API channel, then set local environment variables:

```powershell
$env:LINE_CHANNEL_SECRET="..."
$env:LINE_CHANNEL_ACCESS_TOKEN="..."
$env:LINE_BOT_PORT="3000"
$env:LINE_REPLY_MODE="send"
npm run line:dev
```

Optional local-only reply logging:

```powershell
$env:LINE_REPLY_MODE="log"
npm run line:dev
```

Optional command allowlist:

```powershell
$env:LINE_ALLOWED_USER_IDS="Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

In LINE Developers Console:

- Enable webhook usage.
- Set the webhook URL to your public HTTPS tunnel plus `/line/webhook`.
- Use the Verify button to test delivery.
- Add the LINE Official Account as a friend and send `help`.
- Send `我的ID` to get your LINE user ID, then add it to `LINE_ALLOWED_USER_IDS` if you want command protection.

## Local Webhook Simulation

With the server running, set the same local secret and send a signed fake webhook:

```powershell
$env:LINE_CHANNEL_SECRET="..."
npm run line:simulate -- 狀態
```

This checks local signature verification and webhook routing. The simulated event does not include a `replyToken`, so it will not call LINE's reply API.

## Current Commands

```text
help
說明
幫助
狀態
記憶: <note>
生成測試
生成短句
我的ID
```

## Next Steps

1. Test with a real HTTPS tunnel and LINE Developers Verify button.
2. Add a task queue for local worker jobs.
3. Expand daily phrase draft commands with date selection and review summaries.
4. Keep `LINE_ALLOWED_USER_IDS` enabled after the first real user ID is known.

