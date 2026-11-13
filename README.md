# Bagvaly

Mobile-first storefront and admin for Bagvaly, a Bangladesh-focused ladies' bag shop.
Cash on delivery first; most traffic comes from social-media campaigns on mobile data.

Working rules for contributors and coding agents are in [AGENTS.md](AGENTS.md). Significant
decisions and their rationale are in [docs/decisions.md](docs/decisions.md).

## Stack

| Layer          | Choice                                                                        |
| -------------- | ----------------------------------------------------------------------------- |
| Framework      | SvelteKit 3 + Svelte 5 (runes)                                                |
| Styling        | Tailwind CSS 4 + `@tailwindcss/forms`                                         |
| Tooling        | Vite+ (`vp`) on Vite 8: Oxlint, Oxfmt, Vitest; `svelte-check`; Playwright     |
| Runtime        | Node.js LTS (pinned with `vp env pin`) + pnpm                                 |
| Hosting        | Cloudflare Workers + static assets (`@sveltejs/adapter-cloudflare`), Wrangler |
| Database       | Cloudflare D1 (APAC) + Drizzle ORM                                            |
| Storage        | Cloudflare R2 for product image originals                                     |
| Images         | Cloudflare Image Transformations (400/800/1200, q75, `format=auto`)           |
| Auth           | Better Auth, phone-number OTP only                                            |
| i18n           | Paraglide (`en`, `bn`)                                                        |
| Fonts          | Fraunces (headings), Manrope (body), Hind Siliguri (Bangla), all self-hosted  |
| Bot protection | Turnstile, Bot Fight Mode, WAF rate limits                                    |
| Payments       | Cash on delivery (bKash/SSLCommerz later)                                     |
| Marketing      | Meta Pixel + Conversions API, catalog feed, Open Graph                        |
| Analytics      | Cloudflare Web Analytics; PostHog later (funnel events only)                  |

## Getting started

Requires [Vite+](https://viteplus.dev) (`vp`). It installs the pinned Node.js and pnpm versions.

```sh
pnpm install                 # also runs `svelte-kit sync` and `wrangler types`
cp .env.example .env         # then fill in the values (see below)
vp run db:migrate:local      # create the auth tables in the local D1 database
vp dev
```

### Environment variables

Local values live in `.env` (ignored by Git). Deployed values are Cloudflare secrets set with
`wrangler secret put`.

| Variable                                                                 | Purpose                                                |
| ------------------------------------------------------------------------ | ------------------------------------------------------ |
| `ORIGIN`                                                                 | Public base URL, e.g. `http://localhost:5173`          |
| `BETTER_AUTH_SECRET`                                                     | Session signing secret (32+ random characters)         |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_D1_TOKEN` | Only for `drizzle-kit` commands that talk to remote D1 |

### Phone OTP in development

No SMS gateway is connected yet. On the dev server (`vp dev`) the OTP is printed to the terminal
as `[sms:dev] OTP for +8801…`. Every build, including `vp run preview`, staging and production,
refuses to send OTPs until a gateway adapter is added in `src/lib/server/providers/sms/`.

## Commands

| Command                   | What it does                                                    |
| ------------------------- | --------------------------------------------------------------- |
| `vp dev`                  | Start the dev server                                            |
| `vp run build`            | Regenerate Worker types and build for Cloudflare                |
| `vp run preview`          | Serve the build locally with Wrangler on port 4173              |
| `vp run check`            | Regenerate Worker types, then type-check with `svelte-check`    |
| `vp run lint`             | Check formatting (Oxfmt) and lint (Oxlint)                      |
| `vp run format`           | Format the code                                                 |
| `vp test`                 | Unit tests (Vitest) in watch mode; add `--run` for a single run |
| `vp run test:e2e`         | Build, preview and run Playwright end-to-end tests              |
| `vp run test`             | Unit tests, then end-to-end tests                               |
| `vp run gen`              | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc`    |
| `vp run db:generate`      | Generate a migration in `drizzle/` from the schema              |
| `vp run db:migrate:local` | Apply migrations to the local D1 database                       |
| `vp run auth:schema`      | Regenerate the Better Auth tables after changing auth plugins   |

Lint and format rules live in the `lint` and `fmt` sections of [vite.config.ts](vite.config.ts).
Before handing off a change, run `vp run check`, `vp run lint` and `vp test --run`.

### Secret scanning

CI runs [Gitleaks](https://github.com/gitleaks/gitleaks) over the full Git history on every push
and pull request ([.github/workflows/secret-scan.yml](.github/workflows/secret-scan.yml)) and
fails on any finding. Values are redacted in the log. To run the same scan locally, install
Gitleaks 8.30.1 (release binary, `brew install gitleaks`, or Docker) and run, from the repo root:

```sh
gitleaks git --redact .                       # full history, as in CI
gitleaks git --pre-commit --staged --redact . # only what you are about to commit
```

`gitleaks dir .` also reads ignored files such as `.env`, so a finding there is expected and not
a leak. [.gitleaksignore](.gitleaksignore) lists the only accepted findings by fingerprint (commit,
file, rule, line). Add an entry only for a confirmed false positive, with a comment explaining it.
A real secret must be removed and rotated, not ignored. The one exception is a temporary entry for
an already-public historical Supabase `anon` key, which must be removed once the old project is
deleted or its JWT secret is rotated.

## Project layout

```text
src/
  lib/
    server/
      auth.ts          # Better Auth (phone OTP)
      db/              # Drizzle schema and client
      providers/sms/   # SMS adapter (dev-only until a gateway is chosen)
    phone.ts           # Bangladeshi phone normalization (+8801XXXXXXXXX)
  routes/              # Pages; layout.css holds the brand theme tokens
messages/              # en.json, bn.json (Paraglide)
drizzle/               # Committed D1 migrations
docs/decisions.md      # Decision log
```

## Deployment

Not set up yet. The `DB` binding in `wrangler.jsonc` uses a placeholder ID that only works
locally. Before the first deploy:

1. Create the production and staging D1 databases (`wrangler d1 create … --location apac`) and
   the R2 buckets.
2. Add the real IDs and a separate `staging` environment to `wrangler.jsonc`.
3. Set secrets per environment with `wrangler secret put`.
4. Add deploy and remote-migration package scripts.

Releases follow the order in AGENTS.md: local validation, then staging migrations and tests,
then production.
