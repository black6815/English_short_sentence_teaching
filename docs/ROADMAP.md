# Roadmap

## Phase 0: Project Sync And Memory

- Create a Git repository.
- Push it to a private remote repository.
- Keep project memory in `docs/PROJECT_MEMORY.md`.
- Keep setup notes and machine-specific differences out of code when possible.

## Phase 1: Content MVP

- Generate 20 phrase pairs in English and Chinese. Done for deterministic local draft generator.
- Store output in a daily `phrases.json`. Done: `outputs/YYYY-MM-DD/phrases.json`.
- Add validation rules for phrase length, duplicate detection, and translation quality. Basic validation done; translation quality review still needs human or LLM scoring.
- Later replace or augment the local phrase bank with Ollama-generated drafts.

## Phase 1A: LINE Bot MVP

- Create a local webhook server.
- Verify LINE signatures.
- Reply to basic text commands.
- Expose the local server through an HTTPS tunnel for real LINE testing.
- Connect LINE commands to project memory and local worker tasks. Started: `生成測試` / `生成短句` creates a local phrase draft.

## Phase 2: Audio MVP

- Test local TTS quality.
- Generate one audio file per phrase.
- Decide whether to use local TTS, cloud TTS, or a hybrid.

## Phase 3: Video MVP

- Build a Remotion template.
- Implement the 3-pass phrase timing.
- Burn subtitles into the video.
- Render a complete local `.mp4`.

## Phase 4: Visual Generation

- Install ComfyUI.
- Select base image model and style workflow.
- Generate one visual per phrase.
- Add prompt templates for consistent visual identity.

## Phase 5: Review Flow

- Generate thumbnail and YouTube metadata.
- Create a local review checklist.
- Keep upload manual until output quality is stable.

## Phase 6: YouTube Automation

- Configure YouTube Data API.
- Add OAuth credentials locally.
- Upload videos as private or scheduled.
- Move toward full automation only after repeated successful runs.
