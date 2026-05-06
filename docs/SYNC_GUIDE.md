# Sync Guide

## Recommended Sync Strategy

Use Git for the project source and durable memory files.

Recommended setup:
- Private GitHub repository, GitLab repository, or another private Git remote
- Same repository cloned on every computer
- Commit project memory and planning docs
- Do not commit generated videos, model files, credentials, or large local outputs

## What Should Sync

Commit these:
- Source code
- Pipeline templates
- Prompt templates
- Documentation
- `docs/PROJECT_MEMORY.md`
- Small sample JSON files
- Configuration examples

Do not commit these:
- `.env`
- API keys
- OAuth tokens
- YouTube credentials
- ComfyUI model files
- Generated `.mp4` files
- Large image/audio output folders

## Conversation Continuity

Codex conversation history may not automatically follow every computer unless the same app account, workspace, and thread are available there.

To make continuity reliable, keep durable memory inside the repository:
- Update `docs/PROJECT_MEMORY.md` when decisions change.
- Update `docs/ROADMAP.md` when milestones change.
- Add dated notes in `docs/session-notes/` when a work session has important conclusions.

When continuing on another computer, tell Codex:

```text
請先讀 README.md、docs/PROJECT_MEMORY.md、docs/ROADMAP.md、docs/SYNC_GUIDE.md，然後接續這個專案。
```

## Large Assets

For large generated assets, use one of these:
- Local-only `outputs/` folder
- External drive
- Cloud storage such as Google Drive, OneDrive, or NAS
- Git LFS only if you intentionally want versioned assets

## Machine-Specific Setup

Each computer may need its own local setup:
- GPU driver
- CUDA/PyTorch environment
- ComfyUI installation
- Ollama model downloads
- TTS model downloads
- YouTube OAuth login

These should be documented, but not committed as secret-bearing local files.

