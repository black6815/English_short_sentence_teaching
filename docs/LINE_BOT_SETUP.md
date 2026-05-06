# LINE Bot Setup

This document describes the LINE Bot MVP for this project.

## What This MVP Does

- Starts a local webhook server.
- Verifies LINE webhook signatures with `x-line-signature`.
- Replies to simple text commands.
- Optionally restricts control to approved LINE user IDs.
- Writes `記憶: ...` notes to `docs/session-notes/YYYY-MM-DD.md`.
- Generates a daily `outputs/YYYY-MM-DD/phrases.json` draft.
- Provides a health check at `/health`.

The server is dependency-free and uses Node.js 20 built-in APIs.

## Required Local Runtime

Install Node.js LTS, then confirm:

```powershell
node --version
npm --version
```

If Windows still resolves `node` to a blocked WindowsApps shim right after installation, restart the terminal or Codex. As a temporary workaround on Windows, use:

```powershell
& 'C:\Program Files\nodejs\node.exe' --version
& 'C:\Program Files\nodejs\npm.cmd' --version
```

## Local Config

Create `.env` from `.env.example`:

```powershell
Copy-Item .env.example .env
```

Set these values:

```text
LINE_CHANNEL_SECRET=...
LINE_CHANNEL_ACCESS_TOKEN=...
LINE_BOT_PORT=3000
LINE_REPLY_MODE=send
LINE_ALLOWED_USER_IDS=
```

Use `LINE_REPLY_MODE=log` for local webhook simulation if you do not want the server to call LINE's reply API.

## Commands

```powershell
npm run line:check
npm run line:dev
npm run line:simulate -- 狀態
npm run line:simulate -- "記憶: 測試 LINE 筆記"
npm run line:simulate -- 生成短句
```

Local URLs:

```text
http://127.0.0.1:3000/health
http://127.0.0.1:3000/line/webhook
```

## Public HTTPS Webhook

LINE cannot call `127.0.0.1` directly. For real testing, expose the local server with a public HTTPS tunnel such as ngrok or Cloudflare Tunnel.

Example webhook URL:

```text
https://your-tunnel-domain.example/line/webhook
```

During initial setup, Cloudflare Tunnel quick tunnel was used:

```powershell
tools\cloudflared.exe tunnel --url http://127.0.0.1:3000 --no-autoupdate
```

Quick tunnel URLs are temporary. If cloudflared is restarted, update the LINE webhook URL again.

## LINE Developers Console

Use the official setup checklist in `docs/LINE_OFFICIAL_CHECKLIST.md`.

After setup:

- Enable webhook usage.
- Set the webhook URL to your public HTTPS tunnel plus `/line/webhook`.
- Use the Verify button to test delivery.
- Add the LINE Official Account as a friend.
- Send `help`.
- Send `我的ID` to get your LINE user ID.
- Add that ID to `LINE_ALLOWED_USER_IDS` after the first test, so only approved users can control the bot.

## Current Commands

```text
help
說明
幫助
狀態
status
我的ID
my id
記憶: <note>
生成短句
生成測試
```

## Next Steps

1. Keep the bot server and tunnel running while testing.
2. Test real LINE commands: `help`, `狀態`, `我的ID`, `生成短句`.
3. Add AI fallback for natural language conversation.
4. Add a task queue for project modification requests from LINE.
5. Connect safe low-risk tasks to the local worker.
