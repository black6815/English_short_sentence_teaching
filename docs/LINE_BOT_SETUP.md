# LINE Bot Setup

This document describes the first LINE Bot MVP for this project.

## What This MVP Does

- Starts a local webhook server.
- Verifies LINE webhook signatures with `x-line-signature`.
- Replies to simple text commands.
- Provides a health check at `/health`.

The server is intentionally dependency-free and uses Node.js 20 built-in APIs.

## Commands

```powershell
npm run line:check
npm run line:dev
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
npm run line:dev
```

In LINE Developers Console:

- Enable webhook usage.
- Set the webhook URL to your public HTTPS tunnel plus `/line/webhook`.
- Use the Verify button to test delivery.
- Add the LINE Official Account as a friend and send `help`.

## Current Commands

```text
help
說明
幫助
狀態
記憶: <note>
生成測試
```

## Next Steps

1. Add durable note writing to `docs/session-notes/`.
2. Add a task queue for local worker jobs.
3. Add commands for generating daily phrase drafts.
4. Add authentication so only approved LINE user IDs can control the bot.

