# AGENTS.md

## Project context
- This is Gym Progress Tracker, an offline-first Android-first Expo React Native app.
- v1 uses Expo, React Native, TypeScript, SQLite, JSON export/import backup, and EAS development builds.
- v1 must not add backend, login, cloud sync, analytics, ads, AI coach, nutrition tracking, social features, or advanced analytics.

## Authoritative docs
Before making changes, read the relevant docs under `Docs/codex/`:
- `Gym Progress Tracker - PRD and Codex Project Brief v1.md`
- `Gym Progress Tracker - Codex Coding Checklist v1.md`
- `Gym Progress Tracker - UI Style Guide and Theme Tokens v1.md`

Use those docs as the source of truth. Do not duplicate large sections from them into this file.

## Working rules
- Inspect existing files before editing.
- Keep changes small, focused, and easy to review.
- Do not add new dependencies unless clearly necessary.
- Do not change app scope beyond v1.
- Preserve offline-first behavior.
- Preserve Android-first assumptions.
- Save workout set changes immediately to SQLite.
- Use SQLite transactions for multi-step writes.
- Do not change database constraints, migrations, or repository behavior casually.
- Explain any database-impacting change before implementing it.

## UI rules
- Follow the existing light theme and theme tokens.
- Do not introduce blue as the primary color.
- Do not use pure `#FFFFFF` or `#000000` as main surface/text defaults unless already defined in tokens.
- Keep UI simple and beginner-friendly.

## Validation
After relevant changes, run:
- `npx.cmd tsc --noEmit`
- `npx.cmd expo-doctor`
- `git diff --check`

If a command cannot be run, explain why.

## Change control
- Do not commit or push changes unless explicitly asked.
- Leave Git commit, branch, and push decisions to the project owner.
- At the end of each task, summarize changed files, validation results, and remaining risks.