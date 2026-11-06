# AGENTS.md

Instructions for Claude Code working in the Bagvaly repository.

## 1. Project context

Bagvaly is a Bangladesh-focused ladies' bag e-commerce shop. Most
customers visit on mobile devices and mobile data, often through
Facebook, Instagram, TikTok, or other social-media campaigns and in-app
browsers. The initial checkout model is cash on delivery (COD).

Build for the current business: a small, mobile-first storefront with a
practical admin area. Keep the implementation straightforward, reliable,
secure, and inexpensive to operate.

## 2. How to work

### Before making changes

- Inspect the relevant code, configuration, and existing conventions
  before proposing an implementation.
- For a substantial task, first provide a concise plan covering the
  approach, affected areas, important risks, and validation. Wait for
  approval before implementing.
- For a small, clearly scoped change, proceed without an unnecessary
  planning round.
- If requirements are ambiguous in a way that affects architecture,
  business behavior, security, or cost, ask one focused question
  rather than guessing.
- Prefer the smallest complete change that solves the request.

### Autonomy and approvals

Work independently within the approved scope. Use judgment for ordinary
implementation details, but ask for approval before:

- Changing database schema, migration strategy, or existing migration
  history.
- Changing authentication, authorization, or security-sensitive
  behavior.
- Changing Cloudflare, Wrangler, environment, binding, or deployment
  configuration.
- Changing caching behavior or cache invalidation rules.
- Introducing a paid service, a new recurring cost, or infrastructure
  that could affect the operating budget.
- Making a significant architectural change or changing an established
  business rule.

When proposing one of these changes, explain why it is needed, the
alternatives considered, and its cost or operational impact. Do not make
the change until approved.

### Scope and refactoring

- Avoid unrelated changes and speculative abstractions.
- Refactor nearby code when doing so materially improves clarity or
  maintainability and stays within the approved scope.
- Follow the existing architecture by default. Sensible improvements
  are allowed, but significant structural changes require approval.
- Keep reasonable extension points for known future needs, such as
  online payments and courier integrations. Do not implement future
  features before they are requested.

## 3. Engineering principles

Balance simplicity, maintainability, performance, scalability, and
delivery speed. In practice:

1.  Prefer the simplest design that meets the requirements.
2.  Keep business logic explicit and easy to test.
3.  Avoid premature abstraction, unnecessary dependencies, and
    overengineering.
4.  Optimize real user-facing bottlenecks, especially mobile loading,
    image delivery, and server work.
5.  Keep boundaries clear without turning this small application into a
    distributed system or an elaborate framework.
6.  Prefer established platform capabilities and lightweight, maintained
    dependencies.
7.  Consider the cost and operational burden of every new service or
    dependency.

## 4. Technology stack

Use the versions and configuration already declared by the repository.
Do not upgrade major versions or replace tools without approval.

- Framework: SvelteKit with Svelte 5 runes.
- Styling: Tailwind CSS and `@tailwindcss/forms`.
- Tooling: Vite+ (`vp`) on Vite 8, with Oxlint and Oxfmt configured in
  `vite.config.ts`, Vitest, `svelte-check`, and Playwright.
- Runtime and package manager: Node.js LTS pinned with `vp env pin`
  (`devEngines` in `package.json`) and pnpm.
- Hosting: Cloudflare Workers with static assets, using
  `@sveltejs/adapter-cloudflare` and Wrangler.
- Environments: production and staging, with separate D1, R2, and
  secrets. Staging is noindex and behind Cloudflare Access.
- Database: Cloudflare D1 (SQLite, APAC location) with Drizzle ORM.
- Object storage: Cloudflare R2 for original product images.
- Images: Cloudflare Image Transformations for product images;
  `@sveltejs/enhanced-img` for repository images where appropriate.
- Video: unlisted YouTube videos behind a click-to-load facade.
- Caching: prerendering plus the Cache API on public pages.
- Authentication: Better Auth with phone-number OTP.
- Internationalization: Paraglide with `bn` and `en`.
- Fonts: self-hosted Fraunces, Manrope, and Hind Siliguri (Fontsource).
- Messaging: a Bangladeshi SMS gateway for OTP; WhatsApp `wa.me` links,
  Click-to-WhatsApp ads, and approved Cloud API utility templates.
- Bot protection: Cloudflare Turnstile, Bot Fight Mode, and WAF rate
  limits.
- Payments: COD initially; bKash/SSLCommerz later, when requested.
- Ads: Meta Pixel and Conversions API, catalog feed, Open Graph tags.
- Analytics: Cloudflare Web Analytics; PostHog later (funnel events
  only).
- Errors and uptime: Workers Logs, PostHog or Sentry, UptimeRobot.
- Domain email: Cloudflare Email Routing.

Do not introduce these without an explicit change in direction: a
separate API server or Hono, another database platform, a VPS, Next.js,
Bun as the application runtime, password login, OAuth providers,
Telegram bots, `tsx`, `ts-node`, Storybook, mdsvex, experimental
Svelte/SvelteKit flags, or pre-release framework versions.

## 5. Architecture and code organization

Use a lightweight, domain-organized monolith. Keep the application
inside SvelteKit unless an approved requirement justifies otherwise.

Follow this structure as the default, adapting names and boundaries to
the actual codebase:

```text
src/
  lib/
    server/
      db/             # Drizzle schema, database client, migration-related helpers
      catalog/        # Products, variants, images: queries and domain rules
      orders/         # Order creation, pricing, status transitions
      customers/      # Customer lookup, blocking, order/return counts
      auth.ts         # Better Auth configuration and OTP rules (split into auth/ when it grows)
      providers/      # sms/, whatsapp/, courier/, meta/, notify.ts
      cache.ts        # Cache API wrapper and purge helpers
    components/
      ui/             # Reusable UI primitives
      shop/           # Storefront-specific components
      admin/          # Admin-specific components
    phone.ts          # Shared phone normalization
    money.ts          # Money conversion and formatting helpers
    images.ts         # Shared image URL helper
  routes/
    (shop)/           # Storefront routes
    (admin)/admin/    # Admin routes
    api/              # Webhooks, feeds, OTP endpoints
messages/              # bn.json and en.json
drizzle/               # Committed database migrations
docs/
  decisions.md         # Short record of important decisions and rationale
```

Architecture rules:

- Keep database access, secrets, and provider integrations server-only
  under `src/lib/server/`.
- Keep shared utilities free of server-only imports when they are used
  by both browser and server code.
- Put domain rules close to their domain. Avoid scattering order,
  stock, pricing, and customer rules across route handlers and
  components.
- Keep route handlers thin: validate input, call the appropriate
  domain operation, and translate the result into an HTTP response or
  page result.
- Keep provider-specific code behind small adapters so providers can
  be replaced without rewriting domain logic.
- Do not create a generic abstraction until there is a real use case
  for it.
- Follow the installed SvelteKit version's conventions. Verify aliases
  and configuration in the repository rather than assuming conventions
  from another major version.

## 6. Svelte, TypeScript, and validation

### Svelte

- Use Svelte 5 runes for component state: `$state`, `$derived`,
  `$effect`, and `$props`.
- Do not introduce legacy component patterns such as `export let` or
  `$:` unless compatibility with existing code requires it.
- Use SvelteKit form actions for page mutations where they provide a
  good progressive-enhancement path.
- Use `+server.ts` endpoints for APIs, webhooks, feeds, and other HTTP
  interfaces.
- Keep browser and server boundaries explicit. Never import
  server-only modules into client code.

### TypeScript

- Use strict TypeScript and preserve the repository's strict compiler
  settings.
- Prefer inferred types when they are clear; add explicit types at
  public boundaries and where they improve readability.
- Avoid `any`. If an unsafe type assertion is genuinely necessary,
  keep it narrow and explain the reason.
- Do not add duplicate types when an existing schema or domain type
  can be reused.

### Validation

- Use Valibot for request, form, environment, and external-data
  validation where schema validation is appropriate.
- Define reusable schemas near the domain that owns the data.
- Validate untrusted data at system boundaries. TypeScript types alone
  do not validate runtime input.
- Treat provider responses and webhook payloads as untrusted input.
- Return useful validation errors without exposing secrets or internal
  implementation details.

## 7. Cloudflare Workers runtime

Production server code runs on Cloudflare's `workerd` runtime, not a
conventional Node.js server.

- Prefer standard Web APIs such as `fetch`, `Request`, `Response`,
  `URL`, and `crypto.subtle`.
- Do not rely on Node-only APIs in application code unless the
  required compatibility setting is deliberately configured and
  approved.
- Do not use Bun-specific APIs.
- Read Cloudflare bindings with `import { env } from 'cloudflare:workers'`.
  `@sveltejs/adapter-cloudflare` 8 does not populate `event.platform`.
  Binding types come from `worker-configuration.d.ts`, which is
  generated by `wrangler types` and not committed. Read app variables
  declared in `src/env.ts` through `$app/env/private` or `$app/env/public`.
- Bindings are unavailable while prerendering. Guard binding access with
  `building` from `$app/env` in code that also runs during the build.
- Keep request-time work small. Prerender pages that do not require
  per-request data.
- Avoid CPU-heavy work, large serialization, image processing, or
  other expensive operations inside request handlers.
- Use `waitUntil()` from `cloudflare:workers` for non-critical side
  effects when appropriate. A customer-facing checkout response must not wait for
  analytics or marketing integrations.
- Check the current Cloudflare plan limits and project configuration
  before relying on quotas or free-plan assumptions. Do not hard-code
  remembered quota figures into design decisions.
- Keep the Worker bundle small. Check the impact of server-side
  dependencies before adding them.

## 8. Database and business rules

### Database

- Use D1 through Drizzle ORM.
- Commit schema changes and generated Drizzle migrations together.
- Never rewrite or edit a migration that has already been applied.
  Create a new migration instead.
- Index columns used frequently in `WHERE`, `JOIN`, and `ORDER BY`
  clauses when justified by query patterns.
- Paginate potentially large lists and select only the columns needed.
- Avoid unbounded queries.
- Keep analytics/event data out of D1 unless a specific requirement
  justifies storing it there.

### Business invariants

The following are the current business rules. Follow them by default. If
a rule appears unsuitable, explain the issue and propose an alternative
before changing it.

- Store money as integers in poisha (`৳1 = 100 poisha`). Never use
  floating-point values for persisted money or financial calculations.
- Store timestamps in UTC and display them in `Asia/Dhaka`.
- Normalize Bangladeshi phone numbers through one shared, tested
  helper before storing or comparing them. Support `01…`, `+880…`,
  spaces, dashes, and Bengali digits (`০-৯`); use the canonical
  `+8801XXXXXXXXX` form.
- Re-read product prices and stock from D1 during order creation.
  Never trust prices or stock values submitted by the browser.
- Order creation and stock decrement must be atomic. Use an
  appropriate D1/Drizzle transaction or batch strategy supported by
  the actual runtime and library versions; verify the guarantees
  rather than assuming them.
- Change order status only through centralized domain logic that
  validates allowed transitions.
- Keep payment method and payment status separate. COD is the initial
  payment method; future payment methods must not be implemented until
  requested.
- Preserve useful order attribution, including applicable UTM
  parameters and `fbclid`.
- Model product variants and their stock explicitly. Products may have
  an optional YouTube video ID.
- Keep customer blocking and relevant order/return counts in the
  customer domain.

Current order lifecycle:

```text
pending -> confirmed -> shipped -> delivered
                              \-> returned
             \-> cancelled
```

Do not assume every transition is valid. Enforce allowed transitions in
one tested domain operation.

## 9. Authentication, security, and abuse prevention

- Use Better Auth with phone-number OTP as the approved authentication
  approach. Do not add passwords or OAuth providers.
- Protect OTP requests with Turnstile, per-phone and per-IP rate
  limits, attempt limits, and short expiry.
- Never log production OTP values, secrets, access tokens, or
  sensitive customer data.
- Any staging OTP bypass or fixed test code must be impossible to
  activate in production. Include an explicit production guard that
  fails closed.
- Validate and authorize every admin operation on the server. Hiding
  admin UI is not authorization.
- Validate all untrusted input and verify ownership before returning
  or changing customer-specific data.
- Protect order creation against duplicate submissions, abuse, and
  stock races.
- Keep secrets in Cloudflare secrets or local ignored environment
  files. Never commit secrets or place secret values in tracked
  configuration.
- Treat webhook signatures, replay protection, and provider-specific
  verification as security requirements when implementing webhooks.
- Do not weaken security controls to make local testing easier.

## 10. Images, video, and performance

### Product images

- Store original product photos in R2.
- Resize images in the browser before upload, with a maximum long edge
  of 2000px, unless an approved requirement changes this.
- Give each uploaded image a unique object key. Do not overwrite
  existing image keys.
- Use the shared image URL helper and shared `ProductImage` component.
- Use only the approved transformation widths: 400, 800, and 1200;
  quality 75; `format=auto`.
- Do not introduce arbitrary transformation parameters or widths
  without approval. Check current Cloudflare transformation limits and
  costs before changing this policy.
- Set image dimensions or aspect ratio to prevent layout shifts.
- Prioritize the main product/hero image. Lazy-load below-the-fold
  images and use asynchronous decoding where appropriate.
- Use `@sveltejs/enhanced-img` for suitable images stored in the
  repository, such as logos and banners. Preserve the required Vite
  plugin ordering in the existing configuration.

### Video

- Do not load YouTube iframes on initial page load.
- Product videos are unlisted YouTube videos.
- Use a click-to-load facade with a thumbnail and play control.
- Use `youtube-nocookie.com` for the embedded player.

### Storefront performance

- Design mobile-first for common phone widths and constrained mobile
  connections.
- Keep client-side JavaScript and third-party scripts small.
- Avoid loading marketing, analytics, video, or other third-party
  resources before they are needed.
- Prefer prerendering for pages that do not need request-time data.
- Measure before adding complexity for performance.

## 11. Caching

- Cache only public, non-personalized GET responses, such as home,
  category, product, and catalog-feed pages.
- Never cache cart, checkout, account, authentication/OTP, admin, or
  any response that depends on a session, sets cookies, or contains
  personal data.
- Use the established cache wrapper and current project TTL policy
  (1–5 minutes) unless an approved change is made.
- Product/category admin edits must trigger the appropriate Cloudflare
  cache purge for affected public URLs.
- Do not assume `cache.delete()` invalidates every Cloudflare data
  center.
- Verify cache behavior on the configured staging custom domain. Do
  not assume preview or `workers.dev` behavior matches production.
- Cached pages may contain slightly stale stock information. Do not
  display precise low-stock counts on cached pages.

## 12. Messaging and external providers

- Keep SMS, WhatsApp, courier, and Meta integrations behind small
  server-side adapters.
- Keep provider credentials and network calls out of shared UI and
  domain-independent browser code.
- Disable real provider side effects in staging by default, or use
  provider test modes.
- Route owner notifications through one `notifyOwner()` entry point so
  the delivery channel can change.
- The storefront's WhatsApp order action should be a regular `wa.me`
  link with an appropriate product name and URL.
- If implementing WhatsApp Cloud API messaging, use approved utility
  templates for transactional messages. Do not send marketing messages
  without the required approval and explicit business decision.
- Avoid duplicate or unnecessary messages. The current plan is at most
  one WhatsApp confirmation message per order.
- Do not select or integrate a courier provider until that decision is
  approved.
- Do not add a paid provider or enable billable messaging without
  explaining the expected cost and receiving approval.

## 13. Marketing, SEO, and analytics

- Support Meta Pixel in the browser and Meta Conversions API on the
  server when implemented.
- Use matching `event_id` values for corresponding browser and server
  events so Meta can deduplicate them.
- Disable production marketing events in staging or use the configured
  test-events mechanism.
- Capture relevant campaign attribution parameters on landing and
  preserve them with the order where appropriate.
- Product pages should provide server-rendered Open Graph metadata,
  canonical URLs, and locale metadata for Bangla and English.
- Keep the Meta catalog feed cacheable and public, without exposing
  private data.
- Keep analytics focused on explicitly selected funnel events, such as
  `product_viewed`, `add_to_cart`, `checkout_started`, and
  `order_placed`.
- Do not enable broad autocapture by default. Avoid collecting
  unnecessary personal data and configure billing limits before
  enabling a paid analytics service.
- Staging must be noindex and protected by Cloudflare Access. Use
  appropriate robots directives and response headers; do not rely on
  `robots.txt` alone for access control.

## 14. Brand, UI, accessibility, and localization

### Brand

Bagvaly's intended tone is everyday elegance at an affordable price:
warm, premium-boutique, and uncluttered.

Use the design tokens in `src/routes/layout.css` (Tailwind `@theme`)
rather than hard-coding colors in components:

| Role               | Tailwind token     | Value     |
| ------------------ | ------------------ | --------- |
| Primary / burgundy | `color-primary`    | `#790B27` |
| Background / ivory | `color-background` | `#FDF7EB` |
| Accent             | `color-accent`     | `#B99A6B` |
| Text               | `color-foreground` | `#292525` |
| Surface            | `color-surface`    | `#E8DCCF` |

Typography:

| Role            | Font          | Tailwind utility | Notes                                                   |
| --------------- | ------------- | ---------------- | ------------------------------------------------------- |
| Headings        | Fraunces      | `font-heading`   | SOFT axis at 100 and optical sizing on, for a warm look |
| Body text       | Manrope       | `font-body`      | Descriptions, prices, buttons, and forms                |
| Bangla fallback | Hind Siliguri | (in both stacks) | Fraunces and Manrope have no Bengali glyphs             |

```css
--font-heading: 'Fraunces Variable', 'Hind Siliguri', Georgia, serif;
--font-body: 'Manrope Variable', 'Hind Siliguri', system-ui, sans-serif;
```

- Self-host fonts through Fontsource, load only the needed subsets and
  weights, keep `font-display: swap`, and avoid unnecessary font
  preloads.

### UI and accessibility

- Storefront: mobile-first. Validate layouts around 360–414px widths
  before desktop refinement.
- Admin: desktop-first, while remaining usable on smaller screens.
- Use semantic HTML, keyboard-accessible controls, visible focus
  states, and meaningful alternative text.
- Aim for touch targets of at least 44px and readable color contrast.
- Avoid clutter and unnecessary interaction steps in product discovery
  and COD checkout.
- Keep loading, empty, validation, error, and success states clear.

### Localization

- Use Paraglide for user-facing strings. Do not hard-code interface
  copy in components.
- Add every new message key to both `bn` and `en`.
- Check Bangla rendering and font fallback on every new or
  substantially changed page.
- Format prices using `Intl.NumberFormat` for the active locale and
  the Bangladeshi taka symbol.
- Store machine-readable values independently of their localized
  display strings.

## 15. Environments and deployment

- Production is the default Wrangler environment; staging is
  configured separately.
- Explicitly declare staging bindings and variables. Do not assume
  production bindings are inherited.
- Never put production resource IDs or secrets into staging
  configuration.
- Keep local secrets in the ignored `.env` file. Declare every variable
  in `src/env.ts` and document it in `.env.example` without values.
- Set deployed secrets through Wrangler's secret mechanism, targeting
  the correct environment.
- Deploy through the repository's approved package scripts, not an
  improvised bare Wrangler command.
- Follow the release sequence: local validation, staging migrations
  and tests, then production deployment.
- Read the configured `ORIGIN` for absolute URLs used in auth
  callbacks, Open Graph metadata, feeds, and outbound messages. Prefer
  relative URLs for internal navigation.
- Never deploy, apply production migrations, or change production
  configuration unless explicitly requested and approved.

Before running a command that changes a remote environment, inspect the
script and its target environment. Explain the effect before proceeding
if it could affect staging or production.

## 16. Testing and validation

Choose tests based on risk and behavior, not coverage targets.

- Unit tests: business logic such as money calculations, pricing,
  stock checks, order status transitions, phone normalization, OTP
  rules, COD rules, image URL generation, and event ID generation.
- Integration tests: server operations and interactions with D1 or
  provider adapters where practical.
- End-to-end tests: critical customer and admin journeys, especially
  COD order placement, an admin product edit appearing on the
  storefront, and preventing purchase of an out-of-stock variant.
- Add a regression test for each bug fix when practical.
- Do not add component tests indiscriminately. Prioritize components
  with meaningful business behavior, such as cart totals, checkout
  validation, and variant selection.

Before declaring a task complete:

1.  Run the relevant tests and checks available in the repository.
2.  Run the project's full validation scripts when the change warrants
    them.
3.  Inspect the final diff for accidental changes, secrets, generated
    files, and unrelated refactoring.
4.  Report checks that were not run and why. Never claim a check passed
    unless it actually ran and passed.

Use the commands defined by the current `package.json` and Vite+
configuration. Vite+ built-ins and package scripts are not necessarily
interchangeable:

- `vp <command>` invokes a Vite+ built-in command.
- `vp run <name>` invokes a package script or configured task.
- Inspect `package.json` and `vite.config.ts` before choosing between
  them.
- Use `vpx <file>` for TypeScript/JavaScript scripts when appropriate;
  do not add `tsx` or `ts-node` just to execute scripts.
- Use `vp toolchain` and `vp env doctor` when investigating toolchain
  or runtime problems.

The standard validation set is:

- `vp run check`: regenerates Worker types and runs `svelte-check`.
- `vp run lint`: Oxfmt format check and Oxlint (rules in
  `vite.config.ts`).
- `vp test --run`: Vitest unit tests.
- `vp run test:e2e`: build, preview, and Playwright tests, when the
  change affects pages or server behavior.

Confirm script names in `package.json` if they may have changed.

## 17. Git and repository hygiene

- Do not create commits, amend commits, push, or rewrite Git history
  unless explicitly instructed.
- Do not discard, overwrite, or revert user changes.
- Inspect `git status` and the relevant diff before making changes
  when the working tree may contain user work.
- Do not commit secrets, local environment files, generated build
  output, or unrelated files.
- Keep changes focused and preserve existing formatting and
  conventions.

## 18. Completion report

When a task is complete, provide a concise report containing:

- What was implemented or changed.
- The important files or areas affected.
- Tests and validation commands actually run, with their outcomes.
- Any known limitations, assumptions, or remaining work.
- Any cost, migration, deployment, or operational implications.

Do not claim that something is deployed, committed, or externally
configured unless that action was explicitly authorized and successfully
completed.

## 19. Pending product decisions

Do not make these decisions independently:

- Courier provider.
- SMS gateway provider for OTP.
- Owner notification channel (WhatsApp API or email).
- Online payment gateway and timing.
- Whether to add `@tailwindcss/typography`.
- Any new paid service or material recurring cost.

Record significant approved architectural choices and their rationale in
`docs/decisions.md`. Keep entries short and update the document when an
approved decision changes the direction of the project.
