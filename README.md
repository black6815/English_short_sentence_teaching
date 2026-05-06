# Daily English Funk Video Pipeline

This project generates daily English phrase teaching videos.

Core concept:
- 20 short English phrases per episode
- Each phrase repeats 3 times
- First pass: no subtitles
- Second pass: English subtitles
- Third pass: English and Chinese subtitles
- Visual style: retro funk rhythm, exaggerated comic feel, minimal design
- Pipeline target: local-first generation, reviewable outputs, optional YouTube upload

## Project Goals

1. Generate daily phrase content in English and Chinese.
2. Generate or assign visuals for each phrase.
3. Generate clear spoken audio for phrase teaching.
4. Render a complete video with burned-in subtitles.
5. Generate YouTube title, description, tags, and thumbnail.
6. Support manual review before upload.
7. Sync project state across computers.

## Local-First Tools

Planned local tools:
- Ollama for local LLM phrase and metadata generation
- ComfyUI for local image generation
- Local TTS, to be tested for pronunciation quality
- Remotion and ffmpeg for video rendering

Cloud tools may still be used where quality, stability, or account authorization matters.

## Continuity

Read these files before continuing work on another computer:
- `docs/PROJECT_MEMORY.md`
- `docs/ROADMAP.md`
- `docs/SYNC_GUIDE.md`

