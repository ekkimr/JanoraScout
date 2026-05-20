# Claude Code Setup — Monorepo (Next.js + .NET + Flutter)

Paste this entire prompt into Claude Code at your monorepo root.

---

You are setting up our Claude Code architecture standard on this monorepo.
The repo contains three stacks: .NET backend, Flutter mobile, and Next.js web.

**Your default mode for this session: Plan first, then wait for my approval before writing any file.**

---

## Phase 1 — Explore (read-only, no file writes)

Scan the repo using Glob, Read, and Bash. Do not write anything yet.

Find and report:

1. **Folder structure** — actual paths for backend, mobile, web (e.g. `src/backend/`, `apps/mobile/`, `web/`)
2. **Backend (.NET)** — solution file path, project folder names, namespace pattern (read 2-3 `.cs` files), existing test project and framework (xUnit/NUnit/MSTest), EF Core present? (look for `Migrations/` folder)
3. **Mobile (Flutter)** — `pubspec.yaml` path, state management in use (check `pubspec.yaml` dependencies: riverpod/bloc/provider), existing test folder
4. **Web (Next.js)** — confirm App Router (`app/`) or Pages Router (`pages/`), TypeScript strict mode (check `tsconfig.json`), existing test setup (Vitest/Jest, check `package.json`)
5. **Existing Claude config** — any `CLAUDE.md` or `.claude/` folder already present?
6. **Build & CI** — check `Makefile`, `package.json` scripts, `.github/workflows/`, `azure-pipelines.yml` for actual build/test/lint commands per stack
7. **Git** — default branch name (`main`/`master`/`develop`)

Format your findings exactly like this, then STOP and ask for my confirmation:

```
FINDINGS REPORT
═══════════════

Monorepo root: [path]

BACKEND (.NET)
  Solution file:     [path]
  Source projects:   [list]
  Test project:      [path]
  Test framework:    [xUnit | NUnit | MSTest | not found]
  EF Core:           [yes — migrations at: path | no]
  Namespace pattern: [e.g. MyApp.Domain, MyApp.Application]
  Build command:     [e.g. dotnet build backend/MyApp.sln]
  Test command:      [e.g. dotnet test backend/]

MOBILE (Flutter)
  Folder:            [path]
  State mgmt:        [riverpod | bloc | provider | not determined]
  Test folder:       [path | not found]
  Build command:     [e.g. flutter build apk]
  Test command:      [e.g. flutter test]

WEB (Next.js)
  Folder:            [path]
  Router:            [App Router | Pages Router]
  TypeScript strict: [yes | no | no tsconfig found]
  Test framework:    [Vitest | Jest | not found]
  Build command:     [e.g. pnpm build | npm run build]
  Test command:      [e.g. pnpm test]
  Lint command:      [e.g. pnpm lint]

EXISTING CLAUDE CONFIG
  CLAUDE.md:         [exists at: path | not found]
  .claude/ folder:   [exists with: contents | not found]

CI PLATFORM
  [GitHub Actions | Azure DevOps | none found]
  Key workflow files: [list]

DEFAULT BRANCH:      [main | master | develop]
```

**Do not proceed to Phase 2 until I reply "confirmed" or give corrections.**

---

## Phase 2 — Implementation Plan

After I confirm findings, produce a numbered implementation plan listing
every file you will create or modify, with a one-line description of each.

Format:
```
IMPLEMENTATION PLAN
═══════════════════

Files to CREATE:
  1.  CLAUDE.md                                             — project overview + build commands + stack pointers
  2.  .claude/skills/dotnet-conventions/SKILL.md            — .NET Clean Architecture + CQRS/MediatR rules
  3.  .claude/skills/flutter-conventions/SKILL.md           — Flutter Riverpod feature-first structure rules
  4.  .claude/skills/flutter-wizard-patterns/SKILL.md       — multi-step wizard/PageView patterns (Flutter)
  5.  .claude/skills/nextjs-conventions/SKILL.md            — Next.js App Router + server/client split rules
  6.  .claude/skills/api-code-review/SKILL.md               — API endpoint review checklist (all stacks)
  7.  .claude/skills/db-migration/SKILL.md                  — EF Core + PostgreSQL migration safety workflow
  8.  .claude/skills/railway-deployment/SKILL.md            — Railway Dockerfile + config deployment patterns
  9.  .claude/agents/codebase-explorer.md                   — pre-feature repo mapping (haiku, read-only)
 10.  .claude/agents/code-reviewer.md                       — post-change quality review (sonnet)
 11.  .claude/agents/test-writer.md                         — test generation across all stacks (sonnet)
 12.  .claude/agents/security-auditor.md                    — OWASP read-only security scan (sonnet)
 13.  .claude/agents/db-inspector.md                        — live Railway PostgreSQL inspector (sonnet)
 14.  .claude/agents/doc-updater.md                         — keeps docs/ in sync after code changes (sonnet)
 15.  .claude/agents/feature-planner.md                     — cross-stack feature planning before coding (sonnet)
 16.  .claude/agents/product-analyst.md                     — product/feature verdict with UX + business lens (sonnet)
 17.  .claude/agents/ux-reviewer.md                         — UI/UX review for screens and flows (sonnet)
 18.  .claude/settings.json                                  — hook event configuration
 19.  .claude/hooks/block-dangerous-commands.sh              — PreToolUse: hard-block destructive Bash commands
 20.  .claude/hooks/run-linter.sh                            — PostToolUse: auto-lint after file writes
 21.  .claude/hooks/notify-done.sh                           — Stop: desktop notification when done
 22.  .claude/hooks/check-docs-needed.sh                     — Stop: remind Claude to run /doc-updater when code changed

Files to MODIFY:
  [list any existing files that need merging, e.g. existing CLAUDE.md]

Estimated files: 22 (adjust if any already exist)
```

**Wait for me to reply "approved" before writing any file.**

---

## Phase 3 — Execute

Only after I approve the plan, create all files. Rules:

### CLAUDE.md rules
- If one exists: read it first, preserve all existing content, merge our standard in
- If not: create fresh
- Use ACTUAL commands from Phase 1 findings — no placeholders
- Under 120 lines total
- Structure:
  ```
  # [Project Name]

  ## Stacks
  backend/ — .NET [version if found]
  mobile/  — Flutter
  web/     — Next.js (App Router)

  ## Build & test commands
  [actual commands from findings]

  ## Planning vs. direct execution
  Plan first (3+ files, new feature/endpoint, schema changes, cross-stack refactor).
  Execute directly (debugging, single-file fix, user says "just do it").

  ## Documentation
  After completing any feature, flow change, or API change, invoke /doc-updater.
  The Stop hook (check-docs-needed.sh) also reminds automatically.

  ## Universal rules
  [SOLID, no secrets, conventional commits, PR required, etc.]

  ## Stack conventions
  Skills activate automatically by file type:
    .cs files        → dotnet-conventions
    .dart files      → flutter-conventions + flutter-wizard-patterns
    .ts/.tsx         → nextjs-conventions
    Dockerfile/toml  → railway-deployment

  Manual invocation: /api-code-review, /db-migration, /railway-deployment

  ## Agents available
  /codebase-explorer  — map the repo before starting a feature (fast, read-only)
  /code-reviewer      — review changes before committing
  /test-writer        — generate xUnit / Flutter tests for any file
  /security-auditor   — OWASP read-only scan for auth, stock, integration paths
  /db-inspector       — diagnose Railway PostgreSQL schema vs EF Core model
  /doc-updater        — keep docs/ in sync after feature implementations
  /feature-planner    — cross-stack plan before writing any code
  /product-analyst    — product/feature verdict with persona + benchmark
  /ux-reviewer        — UI/UX review for mobile flows and web dashboard
  ```

### SKILL.md rules
- Adapt naming conventions to what was observed in Phase 1
- For `dotnet-conventions`: use actual namespace pattern, actual test framework with real examples
- For `flutter-conventions`: use actual state management library found in pubspec.yaml
- For `flutter-wizard-patterns`: describe multi-step flow pattern used in the app (PageView + draft state)
- For `nextjs-conventions`: confirm App Router patterns, server vs. client component split
- For `railway-deployment`: cover Dockerfile patterns, railway.toml, env config via Railway config vars
- For `db-migration`: use actual DB engine (PostgreSQL) for zero-downtime examples
- Each skill under 80 lines
- YAML frontmatter must include `name` and `description` (description drives auto-activation)

### Agent rules

Frontmatter fields:
```yaml
---
name: [agent-name]
description: >
  [When Claude auto-delegates to this agent — be specific about trigger phrases]
model: [model-id]
tools:
  - [minimal set needed]
skills:
  - [preload relevant skills — subagents don't inherit parent skills]
---
```

Model assignment — use exact model IDs:
- `codebase-explorer`: `claude-haiku-4-5-20251001` (speed + cost — read-only)
- `code-reviewer`: `claude-sonnet-4-6`
- `test-writer`: `claude-sonnet-4-6`
- `security-auditor`: `claude-sonnet-4-6`
- `db-inspector`: `claude-sonnet-4-6`
- `doc-updater`: `claude-sonnet-4-6`
- `feature-planner`: `claude-sonnet-4-6`
- `product-analyst`: `claude-sonnet-4-6`
- `ux-reviewer`: `claude-sonnet-4-6`

Tool assignment:
- Read-only agents (`codebase-explorer`, `security-auditor`, `db-inspector`): `Read`, `Bash`
- Review agents (`code-reviewer`, `feature-planner`, `product-analyst`, `ux-reviewer`): `Read`, `Bash`
- Writing agents (`test-writer`, `doc-updater`): `Read`, `Bash`, `Write`, `Edit`

Skill preloading per agent:
- `code-reviewer`: all four conventions skills + `api-code-review` + `db-migration`
- `codebase-explorer`: all three conventions skills
- `db-inspector`: `db-migration` + `dotnet-conventions`
- `doc-updater`: all three conventions skills
- `feature-planner`: all three conventions skills + `api-code-review` + `db-migration`
- `product-analyst`: `flutter-conventions` + `nextjs-conventions`
- `security-auditor`: `dotnet-conventions` + `api-code-review`
- `test-writer`: `dotnet-conventions` + `flutter-conventions`
- `ux-reviewer`: `flutter-wizard-patterns` + `nextjs-conventions`

### settings.json structure
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [{ "type": "command", "command": "bash '.claude/hooks/block-dangerous-commands.sh'" }]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "bash '.claude/hooks/run-linter.sh'" }]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "bash '.claude/hooks/notify-done.sh'" },
          { "type": "command", "command": "bash '.claude/hooks/check-docs-needed.sh'" }
        ]
      }
    ]
  }
}
```
Use absolute paths for hook commands (required by Claude Code).

### Hook rules
- All `.sh` scripts: `chmod +x` after creation
- `block-dangerous-commands.sh`: reads tool input JSON from stdin, extracts `tool_input.command`,
  exit code 2 to hard-block (not just warn). Patterns to block:
  `rm -rf /`, `rm -rf ~`, `DROP DATABASE`, `DROP TABLE`, `TRUNCATE`,
  `dotnet ef database update` with a production connection string
- `run-linter.sh`: reads tool input JSON from stdin, extracts `tool_input.file_path`,
  detects extension, runs the right linter (ESLint for .ts/.tsx, dart analyze for .dart,
  dotnet build for .cs), always exits 0 so it never blocks the write
- `notify-done.sh`: macOS `osascript` + Linux `notify-send`, silent fail if unavailable
- `check-docs-needed.sh`: runs `git diff HEAD --name-only` + `git diff --cached --name-only`,
  filters for `.cs`, `.dart`, `.ts`, `.tsx` (excluding migrations, generated files, node_modules),
  if any found prints a reminder message so Claude invokes `/doc-updater`

---

## Phase 4 — Verify

After all files are written:

1. Run `find .claude -type f | sort` and list every file created
2. Check: no placeholder text remains (`grep -r '\[' .claude/skills/ .claude/agents/`)
3. Validate `settings.json` is valid JSON: `cat .claude/settings.json | python3 -m json.tool`
4. Confirm hook scripts are executable: `ls -la .claude/hooks/`
5. Print this team workflow card using actual paths from the project:

```
══════════════════════════════════════════
  DAILY WORKFLOW — [Project Name]
══════════════════════════════════════════

PLAN A FEATURE
  /feature-planner we should add [feature]
  → Returns: cross-stack plan, files to touch, API contract, risks

START IMPLEMENTATION
  /codebase-explorer map out [feature area]
  → Returns: relevant files, patterns, where to add code

DURING IMPLEMENTATION
  Skills activate automatically:
  • Working on .cs files        → dotnet-conventions
  • Working on .dart files      → flutter-conventions + flutter-wizard-patterns
  • Working on .tsx/.ts files   → nextjs-conventions
  • Editing Dockerfile/toml     → railway-deployment
  • Creating a migration        → db-migration

BEFORE COMMITTING
  /code-reviewer review my changes
  → Returns: PASS / WARN / FAIL with specific findings

ADDING TESTS
  /test-writer write tests for [file or feature]
  → Writes tests in the correct framework for the stack

CHECKING THE DATABASE
  /db-inspector check the database
  → Queries live Railway PostgreSQL, checks schema vs EF Core model

AFTER A FEATURE IS SHIPPED
  /doc-updater
  → Reads git diff, updates only the affected docs sections
  (also triggered automatically by the Stop hook)

SECURITY-SENSITIVE FEATURES (auth, payments, data)
  /security-auditor audit [path]
  → Returns: findings table with severity + fix recommendations

PRODUCT / UX DECISIONS
  /product-analyst is this a good idea: [feature]
  → Returns: verdict, persona impact, benchmark comparison

  /ux-reviewer review the UX of [screen or flow]
  → Returns: PASS / WARN / FAIL with specific Tailwind/component fixes

MANUAL SKILL INVOCATION
  /api-code-review  — review an endpoint or handler
  /db-migration     — safety check before running a migration
  /railway-deployment — deployment pattern guidance

NEW TEAM MEMBER ONBOARDING (run once per project)
  Read CLAUDE.md and all files under .claude/skills/ and .claude/agents/.
  Summarise what's available and print the recommended daily workflow
  for this project in 10 lines or fewer.
══════════════════════════════════════════
```

---

## Constraints (active throughout all phases)

- Never modify existing source code files (`.cs`, `.dart`, `.ts`, `.tsx`, etc.)
- Never delete or overwrite an existing `.claude/` file — merge only
- If you are unsure about any observed convention, note it in the findings and ask
- If a stack folder is not found, do not create its skill — flag it in findings instead
- Plan first, execute only after approval — this applies to every phase transition
