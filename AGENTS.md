# OpenCode Agent Instructions - TodoPoderoso-TMS

## Critical Environmental Constraints
* **Host Platform:** Windows (PowerShell 5.1).
* **No Local PHP/Composer:** PHP and Composer are NOT installed on the Windows host. You cannot run `php` or `composer` directly in PowerShell.
* **WSL & Docker:** Development is fully containerized using **Laravel Sail** (requires WSL 2 + Docker Desktop). WSL/Docker services (`Ubuntu`, `docker-desktop`) are installed but may be stopped by default; they must be running to execute Laravel, Artisan, database, and test tasks.
* **Local NPM:** Node.js (`v24.x+`) and NPM (`11.x+`) are installed on the host and can be run directly if needed.

## Tech Stack & Architecture Quirks
* **Routing:** Unified routing in Laravel. All web/API routes live strictly in `routes/web.php`. Console commands live in `routes/console.php`.
* **Inertia & React (Not Yet Scaffolded):** Although the design specifies a React + Inertia SPA, Inertia and React packages are *not yet installed* in `composer.json` or `package.json`. If starting UI development, you must first scaffold them (e.g., via `laravel/breeze` or manual installation).
* **Vite & Tailwind CSS v4:** Frontend utilizes `@tailwindcss/vite` (Tailwind v4) with Vite.

## Database & Environment Gotchas
* **SQLite vs PostgreSQL:** `compose.yaml` provisions PostgreSQL 18, but `.env.example` defaults `DB_CONNECTION` to `sqlite`.
* **Configuring PostgreSQL:** Copy `.env.example` to `.env` and change `DB_CONNECTION=pgsql` with database settings matching `compose.yaml` when running under Sail.

## Essential Developer Commands
Since PHP/Composer are containerized, PHP/Artisan commands must be executed via Laravel Sail/WSL.

* **Initial Setup (Copies .env, generates keys, migrates, builds assets):**
  Run `composer setup` (inside WSL/Sail container).
* **Start Development Environment (Concurrently runs server, queue, logs, vite):**
  Run `composer dev` (inside WSL/Sail container).
* **Run Verification Tests:**
  Run `composer test` or `php artisan test` (inside WSL/Sail container).
* **Linter/Formatter (Laravel Pint):**
  Run PHP code style formatting: `./vendor/bin/pint` (inside WSL/Sail container).
