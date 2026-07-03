# Owner Quickstart — Using This Toolbox Day to Day

A practical, no-jargon guide to getting value out of this repo (the Everything Claude Code plugin) for **docs, websites, and automations**. Read this once, then keep it as a cheat sheet.

---

## The one thing to understand first

This repo is a **toolbox**, not a website and not a project. It installs into `~/.claude/` and then rides along in **every** Claude Code session, in **any** folder.

```
this repo (source)  →  ./install.sh  →  ~/.claude/ (active everywhere)
```

- You **edit** tools here (agents, skills, commands, rules).
- You **use** them from your *other* project folders (client sites, automations).
- **Never** clone a client project into this repo — this is the workshop's tool wall, not the workbench.

**Golden rule:** after editing anything here, re-run `./install.sh typescript` and start a **new** session, or your change isn't live.

---

## Learn these 5 commands first

| Command | When | What it does |
|---|---|---|
| `/plan <goal>` | Before building anything non-trivial | Makes a step-by-step plan and **waits for your OK** before touching code. |
| `/code-review` | After writing/changing code | Security + quality pass on uncommitted changes. |
| `/build-fix` | When something won't build | Minimal, surgical fixes. |
| `/learn` | End of a good session | Banks what worked as a reusable skill — this is the compounding loop. |
| `/save-session` → `/resume-session` | End / start of day | Carries full context across days. |

Most **skills** auto-trigger from plain-English descriptions — you rarely pick them by hand. Your job is mostly firing the right *command* and letting skills do the rest.

---

## Daily loop

**Start of day**
- `/resume-session` — reload yesterday's context.

**Per task**
1. `/plan <what you want>` → review → approve.
2. Build (skills auto-fire as you go).
3. `/code-review` (code) or a verification pass (content/config).
4. Commit only when happy. (Claude won't push without you asking.)

**End of day**
- `/learn` — bank any reusable pattern.
- `/save-session` — snapshot for tomorrow.

**Weekly (15 min)**
- `/skill-health` — see your skill library's health.
- `/promote` — push project learnings to global so they help everywhere.

> Highest-ROI habit: **`/plan` before, `/learn` after.** Plan-first stops wrong-direction work; learn-after means you never solve the same problem twice.

---

## Recipes for your three work types

### Creating docs
- **Long-form** (guides, client deliverables): `article-writing` skill for consistent voice + `/docs` for accurate library facts.
- **Keep project docs current**: `/update-docs`, `/update-codemaps` — generate from source so docs don't rot.
- **Client notes**: `/client-note` and `/notion-triage` capture into the right Notion folder.
- *Flow:* `/plan draft an onboarding guide` → generate → `article-writing` shapes voice → review.

### Building websites
- **Design & build**: `frontend-patterns`, `design-system`, `frontend-slides`.
- **Quality gate** (installed QA agents): `site-health-sentinel`, `lead-flow-tester`, `seo-content-auditor`, `responsive-visual-qa`, and `release-gatekeeper` (runs all four → ship/don't-ship). Plus `/e2e`.
- **SEO**: `seo-content-auditor` automates the per-page checklist (titles, canonicals, schema, local signals).
- *Flow:* `/plan build a landing page` → build with `frontend-patterns` → `responsive-visual-qa` + `seo-content-auditor` → `release-gatekeeper`.

### Building automations
- **Scrapers / data agents**: `data-scraper-agent` (scheduled scrape + LLM enrichment → Notion/Sheets, free on GitHub Actions).
- **Connecting tools / APIs**: `backend-patterns`, `mcp-server-patterns`, `api-design`.
- **Multi-step orchestration**: `blueprint` (one-line goal → multi-session plan) and `/devfleet` (parallel agents).
- **Your reference example**: your own `scripts/notion-triage.js` + workflow.
- *Flow:* `/plan automate lead intake into the CRM` → `blueprint` breaks it down → build with `backend-patterns` → `lead-flow-tester` confirms leads land.

---

## The QA agents (installed)

Five agents that automate the repetitive "is my site working / does the form still email me / does it look right on a phone" checks:

| Agent | Answers | Model |
|---|---|---|
| `site-health-sentinel` | Is the site up and unbroken? | haiku |
| `lead-flow-tester` | Are leads actually reaching me? | sonnet |
| `seo-content-auditor` | Is this page publish-ready for search? | haiku |
| `responsive-visual-qa` | Does it look right on a phone? | sonnet |
| `release-gatekeeper` | Should we ship this? (runs the other four) | sonnet |

**Before every client deploy:** run `release-gatekeeper` against the URL. It gives one PASS/FAIL verdict.

---

## Three gotchas

1. **Edit here → `./install.sh typescript` → new session.** Otherwise the change isn't live.
2. **Skills auto-trigger from their description.** If one isn't firing, its description doesn't match your phrasing — tune it.
3. **This repo is the toolbox, not the workshop.** Your sites and automations live in other folders and get these tools for free.

---

## Where to go deeper

- `USAGE.md` — the install/use loop.
- `docs/guides/the-shortform-guide.md` — day-to-day playbook.
- `docs/COMMAND-AGENT-MAP.md` — which command runs which agent.
- `/skill-health` and `/instinct-status` — see how the toolbox is learning your style.
