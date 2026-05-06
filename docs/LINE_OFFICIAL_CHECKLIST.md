# LINE Official Setup Checklist

Use this checklist when setting up the real LINE Messaging API channel.

## Official Links

- LINE Messaging API get started: https://developers.line.biz/en/docs/messaging-api/getting-started/
- Build a bot: https://developers.line.biz/en/docs/messaging-api/building-bot/
- Verify webhook signature: https://developers.line.biz/en/docs/messaging-api/verify-webhook-signature/
- Channel access token: https://developers.line.biz/en/docs/basics/channel-access-token/
- LINE Developers Console: https://developers.line.biz/console/
- LINE Official Account Manager: https://manager.line.biz/

## Important Official Notes

Messaging API channels are no longer created directly from LINE Developers Console.

Current official flow:
1. Create a LINE Official Account.
2. Enable Messaging API for that LINE Official Account.
3. LINE creates the Messaging API channel.
4. Configure the channel in LINE Developers Console.

The webhook URL must be HTTPS and use a trusted SSL/TLS certificate. `127.0.0.1` and plain HTTP cannot be used directly by LINE.

## Values We Need

Create a local `.env` file and fill:

```text
LINE_CHANNEL_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_BOT_PORT=3000
LINE_REPLY_MODE=send
LINE_ALLOWED_USER_IDS=
```

Do not commit `.env`.

## Where To Find Each Value

### LINE_CHANNEL_SECRET

In LINE Developers Console:
1. Open the provider.
2. Open the Messaging API channel.
3. Go to `Basic settings`.
4. Copy `Channel secret`.

LINE uses this for webhook signature verification. Keep it private.

### LINE_CHANNEL_ACCESS_TOKEN

In LINE Developers Console:
1. Open the provider.
2. Open the Messaging API channel.
3. Go to `Messaging API`.
4. Issue or copy a channel access token.

For this MVP, a long-lived token is the simplest local test option.

### Webhook URL

After starting the local server and HTTPS tunnel, set:

```text
https://YOUR_PUBLIC_TUNNEL_DOMAIN/line/webhook
```

In LINE Developers Console:
1. Open the Messaging API channel.
2. Go to `Messaging API`.
3. Edit `Webhook URL`.
4. Click `Verify`.
5. Enable `Use webhook`.

### LINE_ALLOWED_USER_IDS

After the bot is connected:
1. Add the LINE Official Account as a friend.
2. Send `我的ID`.
3. Copy the returned user ID into `.env`:

```text
LINE_ALLOWED_USER_IDS=Uxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Restart the LINE bot server after changing `.env`.

## Recommended LINE Official Account Settings

For the first bot test, disable automatic greeting and auto-reply messages in LINE Official Account Manager, or they may be confused with webhook replies from this project.

## Next Local Step

After `.env` is filled:

```powershell
npm run line:dev
```

If PATH is not refreshed yet:

```powershell
& 'C:\Program Files\nodejs\npm.cmd' run line:dev
```

## Setup Notes From 2026-05-06

- Do not put the access token into `LINE_CHANNEL_SECRET`.
- `LINE_CHANNEL_SECRET` should be much shorter than the access token.
- In this setup, secret length was 32 and token length was 172.
- After changing `.env`, restart the local LINE bot server.
- After changing Cloudflare quick tunnel URL, update the LINE webhook URL.
- Add `LINE_ALLOWED_USER_IDS` after using `我的ID`.
