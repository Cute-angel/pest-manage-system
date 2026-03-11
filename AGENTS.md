# Repository Guidelines

## Project Structure & Module Organization
This repository is a Tauri + Vue 3 + TypeScript app.

- `src/`: frontend application code.
- `src/pages/`: route-level pages (for example `HomePage.vue`, `TimelinePage.vue`).
- `src/components/`: shared Vue UI components.
- `src/styles/`: Tailwind and app-level CSS (`tailwind.css`, `mobile-shell.css`).
- `public/`: static assets served by Vite.
- `src-tauri/src/`: Rust backend entrypoints (`main.rs`, `lib.rs`).
- `src-tauri/gen/` and `src-tauri/target/`: generated/mobile and build artifacts; avoid manual edits.

## Build, Test, and Development Commands
Use `pnpm` for frontend and `cargo` for Rust:

- `pnpm dev`: start the Vite dev server.
- `pnpm build`: run type-check (`vue-tsc --noEmit`) and produce production frontend build in `dist/`.
- `pnpm preview`: preview the built frontend locally.
- `pnpm tauri dev`: run the desktop app with Tauri + Vite integration.
- `pnpm tauri build`: build distributable Tauri app artifacts.
- `cargo test --manifest-path src-tauri/Cargo.toml`: run Rust tests in the Tauri crate.

## Coding Style & Naming Conventions
- TypeScript is `strict`; keep code free of unused locals/params.
- Vue SFCs use `<script setup lang="ts">`.
- Follow existing naming:
  - Components/pages: `PascalCase.vue` (e.g., `LoginTable.vue`).
  - Variables/functions: `camelCase`.
  - Route paths: lowercase kebab-case (e.g., `/recommendation-detail`).
- Match surrounding formatting in each file (current codebase contains both 2-space and 4-space styles).

## Testing Guidelines
- No frontend test framework is configured yet. For frontend changes, at minimum run `pnpm build` to catch type and bundling issues.
- For Rust logic, add unit tests in `src-tauri/src/` using `#[cfg(test)]` and run `cargo test --manifest-path src-tauri/Cargo.toml`.
- Prefer naming tests by behavior, for example `greet_returns_expected_message`.

## Commit & Pull Request Guidelines
- Current Git history is minimal (`init`), so conventions are not yet established.
- Use clear, imperative commit messages moving forward (recommended: Conventional Commits, e.g., `feat(auth): add login page validation`).
- PRs should include:
  - concise summary of what changed and why,
  - linked issue/task when available,
  - screenshots or short recordings for UI changes,
  - verification notes listing commands run (for example `pnpm build`, `cargo test`).
