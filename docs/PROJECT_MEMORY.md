# Project Memory

This file is the durable memory for Codex and the user across computers.

## User Intent

The user wants to build an automated video generation project for English short phrase teaching.

The final system should generate daily videos and eventually upload them to YouTube automatically.

The user has an NVIDIA RTX 4080 SUPER machine and wants as much of the generation pipeline as practical to run locally.

The user also wants the project and working memory to sync across computers, because they may continue the work and conversation from another machine.

## Video Format

Each episode contains 20 English short phrases.

Each phrase repeats 3 times:
1. Audio only, no subtitles.
2. Audio plus English subtitle.
3. Audio plus English and Chinese subtitles.

Subtitles should be burned into the video frame, not only exported as external `.srt` files.

## Style

Desired style:
- Retro funk rhythm
- Exaggerated comic feeling
- Minimal design
- Clear, readable subtitles
- Strong visual identity suitable for recurring YouTube content

Visual suggestions:
- Bold color blocks
- Coarse black outlines
- Halftone texture
- Comic pop-in effects
- Limited but distinctive palette

## Preferred Architecture

Use a reviewable pipeline with intermediate artifacts.

Suggested output structure:

```text
outputs/YYYY-MM-DD/
  phrases.json
  audio/
  images/
  subtitles/
  thumbnail.png
  video.mp4
  youtube_metadata.json
```

## Tool Direction

Potential local tools:
- Ollama: phrase generation, translation drafts, metadata drafts
- ComfyUI: generated images and possibly video-like visual assets
- Local TTS: pronunciation quality must be tested before committing
- Remotion: video template, subtitle timing, animation
- ffmpeg: encoding and final processing

YouTube upload:
- YouTube Data API, after OAuth setup
- Start with manual review before fully automatic upload

Remote control:
- The user wants to test LINE as an external conversation/control surface.
- LINE Bot is not the same as Codex. It will be a project service that receives LINE webhook events and can later trigger local worker tasks.
- Initial implementation should keep LINE Bot lightweight and use repository memory for continuity.

## Important Notes

ComfyUI has not been installed yet.

`http://127.0.0.1:8188` is only the expected local UI address after ComfyUI is installed and running.

`http://127.0.0.1:8188/prompt` is the ComfyUI API endpoint for programmatic workflow submission, not a human-facing preview page.

The first LINE Bot MVP is implemented as a dependency-free Node.js 20 webhook server in `src/line-bot/server.mjs`.

Current LINE Bot MVP capabilities:
- `GET /health`
- `POST /line/webhook`
- LINE signature verification
- Simple text replies for `help`, `狀態`, `記憶: ...`, and `生成測試`

LINE real-world testing requires a public HTTPS webhook URL, usually through a tunnel such as ngrok or Cloudflare Tunnel.
