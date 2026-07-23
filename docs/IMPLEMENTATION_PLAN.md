# DealFactor — Phase 1 Implementation Plan

## Context

`WEBSITE_SPEC.md` (4,468 lines) is a complete, interview-derived requirements document for DealFactor, a public real-estate discovery/analysis site for investors (primary) and home buyers (secondary), with Detroit as the first fully-supported advanced-analysis market and nationwide basic coverage elsewhere. The repository is currently empty except for the spec and a reference PDF (`docs/DEALFACTOR_FULL_PRODUCT_SPEC.pdf.pdf`) — no code exists yet, so this is a greenfield build.

The spec is implementation-ready in its *product* requirements but leaves several *technical/legal* questions unresolved (property-data licensing, scoring formulas, cost vs. the stated $50–100/mo budget). This plan performs the feasibility/dependency audit the spec calls for, resolves the material questions through your answers, and breaks Phase 1 into ordered, independently-testable milestones. Nothing has been built, installed, or purchased — this is planning only.

**Phase 1 is a complete beta-launch build, not a stripped-down MVP.** Every visitor journey in the spec ships in Phase 1, honestly labeled wherever a formula, data source, or feature is still a v1/interim approach. All 12 milestones below are official and none are merged.

**Decisions confirmed with you across this session:**
- Property data: **RentCast** is the Phase 1 production provider (real, licensed, nationwide). Zillow/Realtor.com/Redfin become future integrations pending real licensing/MLS access.
- Data layer: a **replaceable adapter** (`PropertyDataProvider`) so RentCast can be supplemented/replaced later without a rebuild.
- Photos: RentCast has **no photo fields**. Build a fully photo-capable UI from day one against a **separate `PropertyMediaProvider` interface**, decoupled from RentCast, using placeholders/licensed sample images only until an authorized photo source exists. Never scrape Zillow/Realtor/Redfin images.
- Admin 2FA: **TOTP authenticator app** instead of SMS.
- **Cost posture during early development: Configuration A (free plans + mock fixtures) is the active configuration.** RentCast's free Developer tier is used only for deliberate integration-verification calls, not routine testing. No paid plan, production API key, or budget commitment happens without your explicit approval — and costs must be **recalculated and re-presented** immediately before any paid upgrade or production launch, since prices/usage assumptions may have shifted by then.
- Refresh policy: **manual refresh on request** plus **limited scheduled refresh for saved/recently-active properties only** — never a twice-daily refresh of the entire property universe. Cadence is administrator-configurable.
- Scoring: a v1 simplified rubric is approved **only** under these conditions — every formula/weight documented, deterministic application code (not AI-generated), covered by automated tests, administrator-configurable, clearly labeled as an initial rubric, and AI never invents a score.
- Detroit housing-authority data: **manually curated, dated, source-linked** entries when available; otherwise the field shows **Not available**. No live API exists for this.
- Uploads: document upload/extraction is **built and internally tested in Milestone 9**, but stays behind an **administrator-controlled feature flag, default off for the public**, until real malware scanning exists — type/MIME/size validation alone is explicitly **not sufficient** to enable public uploads.
- Legal review is a **hard gate** before real public traffic or any legally-sensitive feature goes live. Private development and preview deployments may proceed with clearly marked placeholder legal text.
- Email verification stays disabled for early private testing but is called out as an **explicit decision to make before public launch**, not something to leave un-decided by default.
- No existing external accounts (Anthropic/Supabase/Vercel/Geoapify) — Milestone 1 includes setup, on free tiers.

---

## 1. Feasibility & Dependency Audit

### 1.1 Understanding of the site and main visitor journeys

DealFactor has one core loop reused across two audiences:

**Search → Quick View → Full Analysis → Edit Assumptions/Ask AI → Save/Compare/Share**

- **Investors** (primary): natural-language + strategy search → Investor Analysis (financial metrics, comps, risk, Section 8 suitability, category scores) → editable assumptions/scenarios → Ask About This Deal → save to My Deals / compare / share.
- **Home Buyers** (secondary): natural-language + traditional filters → Home Buyer Analysis (affordability, condition, neighborhood, schools, resale, negotiation) → Ask About This Home.
- **Section 8** is a specialized lens on investor properties (not home buyer), with strict confirmed-vs-hypothetical labeling.
- **Deal Analyzer** is the "bring your own property" entry point: address search, manual entry, or document upload — one-property or multi-property comparison.
- Everything is **guest-first**: full analysis works without an account; an account is only required to *persist* something (save/scenario/chat/share). Guest work transfers into the account seamlessly on sign-up.
- **Admin** is a separate, owner-only-at-launch surface for market expansion, CMS, data-source health, and moderation — architected for more roles later but not exposed yet.

The unifying design principle is **honesty about uncertainty**: every fact/score must be labeled Confirmed/Estimated/Benchmark/Unverified/Not available/etc., nothing is invented, and application code (not AI) performs every financial calculation.

### 1.2 Missing, unclear, conflicting, or technically risky requirements

| # | Issue | Why it matters | Resolution taken in this plan |
|---|---|---|---|
| 1 | Zillow/Realtor.com/Redfin listed as Phase-1 sources, but none offer a public, self-serve, legally-licensable API at hobbyist budget | Would block the entire data layer indefinitely | Use RentCast now (confirmed); keep adapter pattern so these can be added later if/when real licensing is obtained |
| 2 | No photo source at all — RentCast has none, and scraping the big listing sites is both a ToS violation and copyright risk | Photos are central to search cards/quick view/galleries per spec | Photo-ready UI built against a separate `PropertyMediaProvider` interface; placeholders only until a licensed photo feed exists |
| 3 | Overall/category scoring formulas (investor score, risk level, "beginner-friendly," "balanced deal," Section 8 fit) are **never defined** in the spec — only the underlying financial formulas (Appendix A) are | Shipping unvalidated scoring as if authoritative is a real trust/liability risk | Ship a **v1 simplified rubric**, approved only because it will be: fully documented (every formula/weight visible), deterministic application code, automated-test-covered, administrator-configurable, clearly labeled "initial/v1," and never AI-generated |
| 4 | Local housing-authority data (Detroit) has no public API | Section 8 "payment standard" and local considerations need a data source | **Manually curated, dated, source-linked** admin-entered data when available; **Not available** label when it isn't — never estimated or guessed |
| 5 | Mortgage-rate source unspecified | Home Buyer cost engine needs a live current rate | Use **FRED (Federal Reserve Economic Data) public API** — free, official, weekly Freddie Mac PMMS average rates — with optional lender-quote override |
| 6 | "Twice-daily active-listing refresh" (10.3) conflicts with the $50–100/mo budget once a real paid data API is involved | Refreshing every tracked property twice a day at RentCast's per-request pricing can exceed any reasonable tier quickly | **Decided policy:** manual refresh on request + limited scheduled refresh for saved/recently-active properties only; no full-universe twice-daily refresh; cadence is admin-configurable |
| 7 | "Majority rule across 3 sources" conflict-resolution logic assumes 3 real providers | With one real provider (RentCast) in Phase 1, this logic is mostly dormant | Build and unit-test the conflict-resolution code against **multiple mock adapters** now, so it's proven correct before a second real provider is ever added |
| 8 | Document extraction/OCR provider unspecified | Spec requires AI-assisted field extraction from uploads | Use **Claude's native document/vision understanding** directly rather than adding a separate OCR vendor |
| 9 | Malware scanning and admin SMS 2FA both add cost/complexity not otherwise justified at <10 users | Budget and complexity pressure, but uploads carry real risk if left unscanned | TOTP instead of SMS (resolved). Uploads: build/test internally in M9, but the **public-facing flag stays off by default** until malware scanning exists or you explicitly accept documented risk — type/MIME/size validation alone does not unlock public uploads |
| 10 | "Major deal-score change" threshold, low/medium/high risk thresholds, and low-confidence-range thresholds are undefined | Needed for notification logic and UI | Ship sensible defaults (e.g., ±10% score movement triggers a notification) as **admin-configurable settings** |
| 11 | Legal pages, Fair Housing review, and all contextual disclaimers explicitly require qualified legal review (spec §25.12, §31.11) | I cannot perform legal review | **Hard gate:** clearly-labeled draft/placeholder legal text is fine for internal/preview work, but real public traffic and any legally-sensitive feature must not go live until you've had it reviewed |
| 12 | Vercel's Hobby (free) plan is **non-commercial only** per its own terms; DealFactor is a commercial product even though it's free to use | Using Hobby for a real public launch risks a ToS violation | Flagged in the cost breakdown — Configuration A (Hobby) is fine for private/internal development; Pro is the compliant choice once you approve moving toward public launch |

### 1.3 External-service / licensing dependency audit

- **RentCast API** — Confirmed nationwide licensed data (150M+ property records, valuations, comps, active listings). Its API Terms of Use permit commercial use, storing data on your systems, combining with other sources, and displaying it to end users, with **no attribution required**. This satisfies the spec's data-licensing gate (§10.1) reasonably well — you should still have someone skim the actual [Terms of Use](https://www.rentcast.io/terms-api) before real public launch. **No photo or agent-info fields** are documented in its schema.
- **HUD User API** (Fair Market Rents) — free, official government API, requires only a free token signup, rate-limited to 60 req/min.
- **FRED API** (mortgage rates) — free, official Federal Reserve data.
- **Detroit local housing-authority data** — no public API found; manually sourced from published Detroit Housing Commission documents, dated and source-linked at entry time.
- **Geoapify** — free tier covers 3,000 credits/day (~90k/month), ample for <10 users.
- **Anthropic Claude API** — standard pay-as-you-go, cost scales with usage (see below).
- **Supabase / Vercel** — standard commercial hosting terms; Vercel Hobby's non-commercial restriction is the one real flag.

### 1.4 Cost vs. stated $50–100/month budget

The active configuration right now is **Configuration A (free everything, mock fixtures)** — real spend today is close to $0. A realistic eventual production configuration (RentCast Foundation + Vercel Pro + Supabase Pro + Claude usage) lands around **$145–165/month**, above the stated target, driven mainly by RentCast (+$74) and Vercel Pro (+$20) together. A budget-constrained production configuration exists (~$50–75/mo) but accepts real limits. **No move beyond Configuration A happens without your explicit approval, and the numbers below get recalculated fresh at that time** rather than relied on from this planning pass.

---

## 2. Itemized Monthly Cost Breakdown

Current published prices, checked live rather than recalled from memory. "Real request volume" assumptions are mine, stated explicitly. Spec's expected launch traffic: **fewer than 10 users**.

### Configuration A — Free Development (ACTIVE configuration for all of Phase 1A and most of Phase 1B)

| Service | Plan | Cost | Notes / limits |
|---|---|---|---|
| RentCast | Developer (free) | $0 | 50 real API requests/month total — reserved for **deliberate integration-verification calls only**; all iterative dev/testing uses mock fixtures instead |
| Supabase | Free | $0 | 500MB DB, 1GB file storage, 50k MAU, 5GB egress; project auto-pauses after 7 idle days (fine for active dev) |
| Vercel | Hobby (free) | $0 | Preview deployments only; non-commercial ToS — not for a real public production domain |
| Anthropic Claude | Pay-as-you-go | ~$5–10 | Light dev/integration testing only |
| Geoapify | Free | $0 | 3,000 credits/day |
| HUD User / FRED | Free | $0 | Public government APIs |
| PostHog (analytics) | Free | $0 | 1M events/month free tier |
| Sentry (errors) | Free | $0 | 5k events/month free tier |
| Domain | — | $0 | Not purchased yet |
| **Total** | | **~$5–10/month** | This is the configuration in effect through Milestones 1–11 unless you explicitly approve moving off it sooner |

### Configuration B — Lowest-Cost Public Launch (reference only — not approved, not active)

| Service | Plan | Cost | Notes / limits |
|---|---|---|---|
| RentCast | Developer (free) | $0 | Only 50 real property lookups/month total — requires aggressive permanent caching |
| Supabase | Free | $0 | Same limits as above |
| Vercel | Hobby (free) | $0 | **ToS risk**: non-commercial restriction on a commercial product |
| Anthropic Claude | Pay-as-you-go | ~$10–20 | Low real usage |
| Geoapify / HUD / FRED / PostHog / Sentry | Free | $0 | |
| Domain | ~$12–15/yr | ~$1–2/mo | External purchase, amortized |
| **Total** | | **~$12–35/month** | Stays under target; real functionality is thin (50 lookups/month) and Vercel's ToS is a genuine compliance question |

### Configuration C — Expected Full Production (reference only — not approved, not active)

| Service | Plan | Cost | Notes / limits |
|---|---|---|---|
| RentCast | Foundation | $74 | 1,000 real requests/month — supports regular searching plus the *limited* refresh policy decided in this plan (not a literal twice-daily refresh of everything) |
| Supabase | Pro | $25 | Avoids free-tier auto-pause for a live public site; 8GB DB / 100GB storage |
| Vercel | Pro | $20 | ToS-compliant for a commercial product |
| Anthropic Claude | Pay-as-you-go | ~$25–40 | Sonnet for analysis/explanation, Haiku for lighter tasks, prompt caching enabled |
| Geoapify / HUD / FRED | Free | $0 | Still within free tier at this scale |
| PostHog / Sentry | Free | $0 | |
| Domain | ~$1–2/mo | ~$1–2 | External purchase |
| **Total** | | **~$146–162/month** | Exceeds the stated $50–100 target |

**Per spec §26.7's own rule:** the cause of the overage is RentCast Foundation (+$74) and Vercel Pro (+$20) together; they're needed because RentCast's free 50/month is too thin for real repeated use and Vercel Pro removes the ToS ambiguity; the cheaper alternative is Configuration B (same code, lower quota/ToS risk); what changes on the cheaper option is far fewer real lookups/month and no meaningful scheduled refresh.

### Configuration D — Higher-Usage Growth (future reference only)

| Service | Plan | Cost (approx.) | Notes |
|---|---|---|---|
| RentCast | Growth or Scale | $199–$449 | 5,000–25,000 requests/month, for real multi-hundred-user traffic |
| Supabase | Pro + overages | $25–$75 | |
| Vercel | Pro + overages | $50–$150 | |
| Anthropic Claude | Pay-as-you-go | $100–$400 | |
| Geoapify | Likely a paid tier | est. $50–90 | Not researched in depth — out of scope for Phase 1 |
| **Total** | | **~$425–1,165/month** | Order-of-magnitude figure for future planning only |

**No paid plan will be activated, no production API key created, and no budget committed beyond Configuration A until you explicitly approve a move — and the numbers above will be recalculated at that moment, not assumed from this document.**

---

## 3. Recommended Technology Stack

| Layer | Choice | Why (plain-language) |
|---|---|---|
| Frontend framework | **Next.js + TypeScript** (spec-confirmed) | One framework for pages, API routes, and server-side rendering; TypeScript catches data-shape mistakes before they reach a user |
| Backend/DB/auth/storage | **Supabase** (spec-confirmed) | Postgres database, login system, file storage, and scheduled jobs in one product |
| Hosting | **Vercel** (spec-confirmed) | Built to deploy Next.js with minimal configuration; automatic preview deployments per pull request |
| AI | **Anthropic Claude API**, modular provider layer (spec-confirmed) | Claude for reasoning/explanation; a modular layer means swapping models or vendors later doesn't touch every feature that uses AI |
| Property data | **RentCast**, behind a `PropertyDataProvider` adapter interface | Confirmed; the adapter means a future licensed Zillow/Realtor/MLS feed plugs in without rewriting search, cards, or analysis pages |
| Property photos | Separate `PropertyMediaProvider` adapter interface, placeholder implementation | Keeps the entire photo UI working today against placeholders, ready for real photos with zero UI rework |
| Government/rent data | **HUD User API** (FMR), **FRED API** (mortgage rates) | Both free, official, directly answer two spec requirements with no paid dependency |
| Mapping | **Geoapify + MapLibre** (spec-confirmed) | Geoapify for geocoding/routing/nearby-places; MapLibre is a free, open-source map renderer |
| Document extraction | **Claude's native document/vision understanding** | Avoids a third-party OCR vendor for something Claude already does well at this scale |
| Validation | **Zod** (shared client/server schemas) | One schema validates a form on the browser and again on the server, so the two can't drift apart |
| Testing | **Vitest** (unit/financial-engine), **Playwright** (end-to-end journeys) | Vitest is fast for the pure-calculation tests Appendix A demands; Playwright drives a real browser through full journeys |
| Admin 2FA | **TOTP** (e.g., `otplib` + QR enrollment) | Same security guarantee as SMS, no ongoing per-message cost, no SMS-provider account |
| Analytics | **PostHog** (free tier) | Privacy-configurable, generous free tier |
| Error monitoring | **Sentry** (free tier) | Standard, well-supported, free tier sufficient at this scale |

---

## 4. Application Architecture

### 4.1 High-level shape

```
Browser (Next.js pages/components)
        │
        ▼
Next.js API routes / Server Actions  ──►  Supabase (Postgres, Auth, Storage, Edge Functions, Scheduled Jobs)
        │
        ├──► PropertyDataProvider (interface)
        │       ├── RentCastAdapter (real, Phase 1 — deliberate verification calls only)
        │       └── MockFixtureAdapter (dev/test — default in day-to-day work)
        │
        ├──► PropertyMediaProvider (interface)
        │       ├── PlaceholderMediaAdapter (Phase 1)
        │       └── (future) licensed photo-feed adapter
        │
        ├──► FinancialEngine (pure, tested application code — Appendix A formulas)
        │
        ├──► ScoringEngine (v1 rubric — documented, deterministic, tested, admin-configurable)
        │
        ├──► AIOrchestrator
        │       ├── InvestorAnalysisAssistant (isolated context/tools)
        │       ├── HomeBuyerAssistant
        │       ├── Section8Assistant
        │       ├── AskAboutThisDealAssistant (single-property scoped)
        │       ├── AskAboutThisHomeAssistant
        │       ├── ComparisonAssistant
        │       ├── HelpAssistant (product Q&A only, no property data)
        │       └── DocumentExtractionAssistant (Claude vision/document — internal/flagged, see M9)
        │
        ├──► HUD User client (Fair Market Rents)
        ├──► FRED client (mortgage rates)
        └──► Geoapify client (proximity/geocoding)
```

Every provider/assistant is behind an interface with a single real implementation and at least one mock implementation, so tests never depend on a live network call, and swapping a vendor later touches one adapter file, not the pages that use it.

### 4.2 Database structure

Adopt the spec's own recommended logical model (§14.2) essentially unchanged. Two additions worth calling out:

**`property_photos`** (anticipated in the spec, detailed here since RentCast can't supply it):
- `id`, `property_id`, `source` (`placeholder` | future real sources), `storage_path`/`external_url`, `is_primary`, `display_order`, `alt_text`, `attribution` (nullable), `license_notes` (nullable)

**`property_fact_source_values`** — as specified, but in Phase 1 it will usually hold one row per fact (RentCast) plus, where relevant, a `manual_entry`/`user_input` row. The majority/priority conflict-resolution code still runs and is tested against multiple *mock* sources so it's proven correct before a second real provider exists.

**`scoring_rubric_config`** (new, supporting the v1-rubric conditions above): stores the documented formula/weight set per score type, versioned, admin-editable, with every generated score linking back to the rubric version used — this is what makes "administrator-configurable" and "clearly labeled as v1" actually auditable rather than just a stated intention.

**`document_uploads`** gains an `is_public_enabled_context` concept tied to a **feature flag** (`system_settings.uploads_public_enabled`, default `false`) rather than a per-file toggle — see Milestone 9.

Every other entity group (identity/preferences, analysis, user workspace, sharing, operations/admin) is built as specified — see the milestone table in §6 for which entities land in which milestone.

### 4.3 Authentication & permissions

- Supabase Auth: email/password + Google OAuth, no email verification required during private testing — **explicitly revisited as a decision before public launch** (§12).
- Guest sessions: tab-scoped client state until a persistence action triggers sign-in; on success, in-progress work is written to the newly authenticated user's rows.
- RLS enforces per-user data isolation for all private tables. Shared-link access is a separate token-based read path.
- Admin auth: email/password + **TOTP**, with recent-reauthentication required for sensitive actions (backup restore, market publish, security/recovery changes, and — new — enabling public uploads).
- Roles (`full_administrator`, `market_data_manager`, `support`, `content_editor`) are modeled from Phase 1 so the architecture supports them, though only the owner account is active at launch.

### 4.4 AI architecture

- One Anthropic account, multiple isolated assistants — each with its own system prompt, allowed tools, and context scope. No assistant can see another property's or another assistant's data.
- Assistants call the **FinancialEngine** and **ScoringEngine** as tools for any number or score; they never generate one themselves. Enforced structurally and covered by a dedicated test category (Milestone 5).
- Document extraction uses Claude's document/vision input directly — extracted fields always require user confirmation, uncertain fields are labeled "Needs review," nothing auto-commits to an analysis. This pipeline is built and tested internally in Milestone 9 but stays behind the public-upload feature flag.
- Model selection: Sonnet for analysis/explanation quality, Haiku for lower-stakes tasks (Help AI, simple labeling), prompt caching enabled for repeated property context.

### 4.5 Security, privacy, SEO, accessibility (Phase 1 targets)

- **Security:** server-side validation (Zod) on every input, rate limiting on auth/search/AI/upload/share/contact endpoints, secrets only as server-side environment variables, RLS as the primary authorization boundary, TOTP + recent-reauth for admin sensitive actions including the public-uploads flag.
- **Privacy:** exact financial inputs used transiently in calculators are never persisted unless explicitly saved; analytics events exclude query text, document contents, financial values, and AI conversation content.
- **SEO:** sitewide `noindex, nofollow` at launch, `robots.txt` consistent with page metadata, private/shared/admin routes excluded from indexing and gated by auth/token regardless of robots directives.
- **Accessibility:** target **WCAG 2.2 Level AA** — keyboard navigation, visible focus, screen-reader labels, accessible modals/panels/tabs, reduced-motion support, non-color-only status communication, text/table alternatives for charts and maps.
- **Testing:** Vitest for the financial/scoring engines and adapters (unit), Playwright for full user journeys, automated accessibility scan (axe) in CI, manual screen-reader pass before each milestone's completion checkpoint.
- **Hosting/deployment:** GitHub repo → Vercel, separate local/preview/production environments and credentials, migrations committed and reviewable, PR preview deployments.
- **Domain:** connected only in the final Phase 1C milestone (Milestone 12), once the rest of the site is stable.

---

## 5. Phase 1 Scope: A Complete Beta Website

Phase 1 is **not a stripped-down MVP** — every visitor journey in the spec ships: investor discovery, home buyer discovery, Section 8 analysis, one- and multi-property Deal Analyzer, My Deals with folders/stages/notes/tasks, saved scenarios and chats, sharing and reports, admin dashboard, and legal/support pages. It ships on real RentCast data, with a fully tested financial engine, isolated AI assistants, and a documented v1 scoring rubric. Two things are honestly labeled rather than faked: **photos are placeholders** (no licensed photo source exists yet) and **document uploads are built but not publicly enabled** until malware scanning exists.

### 5.1 Phase 1 structure: Alpha → Beta → Production

The 12 milestones below are the only official units of work and approval — nothing is merged, and nothing new is added. Internally, they group into three conceptual stages for your own tracking and communication (not additional milestones):

- **Phase 1A — Internal working alpha (Milestones 1–5):** foundation, data layer, financial engine, core investor loop, first AI integration. Usable by you internally; not yet a full product.
- **Phase 1B — Complete beta website (Milestones 6–11):** accounts, Home Buyer, Section 8, comparison/uploads (internal), admin/legal, and the dedicated QA hardening pass. By the end of Milestone 11, the full spec'd product exists and has passed its quality gates, still running on Configuration A.
- **Phase 1C — Production deployment (Milestone 12):** the single go-live milestone — cost recalculation, plan upgrade (if approved), domain, hosting finalization, monitoring.

---

## 6. Ordered Milestone Plan (Phase 1) — 12 official milestones

Milestones 4, 6, 9, and 10 contain substantial work and may each be completed through **two or three internal implementation passes**; every one of them still has exactly **one official completion checkpoint** at the end, and remains a single milestone for approval purposes.

---

### Milestone 1 — Foundation & Environment Setup *(Phase 1A)*

**Purpose:** Stand up every account, environment, and base UI shell the rest of Phase 1 depends on, with zero licensing or cost risk.

**Features included:** GitHub repo confirmed/pushed; Next.js + TypeScript scaffold; Supabase project (free tier) with local/preview/prod environment separation; Vercel project (Hobby tier); base design system (navy/white/gold palette, typography, light/dark/system mode); global header/footer/nav shell; Supabase Auth wired for email/password + Google OAuth; empty-state pages for all top-level routes.

**Features explicitly excluded:** Any real property data, any AI feature, any paid plan.

**Pages/systems affected:** Global layout, navigation, auth pages, theme system.

**Technical dependencies:** None (first milestone).

**External services required:** GitHub (have it), Supabase (new, free), Vercel (new, free Hobby), Google Cloud OAuth client (new, free).

**Data type:** None — no property data yet.

**Expected deliverable:** A deployed, navigable skeleton site with working sign-up/sign-in and theme toggle, on a Vercel preview URL.

**Acceptance criteria:** All top-level routes render without error; auth sign-up/sign-in/sign-out works end-to-end; light/dark/system theme persists; mobile/tablet/desktop layout shells render per breakpoint rules.

**Automated tests:** Auth flow unit/integration tests; smoke test that every top-level route returns 200.

**Manual testing instructions:** Sign up with email/password, sign out, sign in with Google, toggle theme, resize browser through mobile/tablet/desktop breakpoints.

**Risks:** Low. Mainly account-setup friction.

**Completion checkpoint:** Stop and confirm the deployed skeleton looks/behaves as expected before any real data work begins.

---

### Milestone 2 — Property Data Layer & Photo Architecture *(Phase 1A)*

**Purpose:** Build the replaceable data-access layer for both property facts and property photos, and prove address search works end-to-end on real (if minimal) RentCast data.

**Features included:** `PropertyDataProvider` interface + `RentCastAdapter` + `MockFixtureAdapter`; property/source/fact database entities with full provenance; source-conflict resolution (majority-of-3, priority-fallback) unit-tested against multiple **mock** adapters; `PropertyMediaProvider` interface + `PlaceholderMediaAdapter`; full photo UI (card thumbnail, primary image, gallery, thumbnails, loading/error/placeholder states) built against the interface; landing-page address search → general property page (basic); View Data Sources panel (basic version).

**Features explicitly excluded:** Investor/Home Buyer/Section 8 full analysis; scoring; AI features; manual entry; multi-property.

**Pages/systems affected:** Home address-search box, general property page, View Data Sources panel.

**Technical dependencies:** Milestone 1.

**External services required:** RentCast Developer (free) key — **requires your go-ahead before creating**, and used only for deliberate verification calls per the Configuration A policy, not routine iteration.

**Data type:** Real RentCast data for a small number of deliberate verification calls; mock fixtures for all other dev/test iteration.

**Expected deliverable:** Entering a real address returns real property facts with correct provenance labeling and a photo-ready UI showing professional placeholders.

**Acceptance criteria:** Conflict-resolution rules match spec §10.2 exactly under mock multi-source tests; every displayed fact carries a status label; photo components render correctly with 0, 1, and many photos; no unauthorized image is ever fetched or displayed.

**Automated tests:** Adapter unit tests (majority rule, priority rule, missing-data labeling) against mock fixtures; snapshot tests for property page with varying photo counts; contract test ensuring `RentCastAdapter` and `MockFixtureAdapter` satisfy the same interface.

**Manual testing instructions:** Search a small, deliberate set of real Detroit and non-Detroit addresses (mindful of the 50/month free-tier cap); confirm facts, last-updated time, and View Data Sources panel populate correctly; confirm placeholder photos display cleanly on mobile and desktop.

**Risks:** RentCast free-tier quota (50/month) could be exhausted by careless manual testing — test primarily against mock fixtures, reserve real calls deliberately, as agreed.

**Completion checkpoint:** Stop and confirm real-data address search works before building analysis on top of it.

---

### Milestone 3 — Financial Calculation Engine & Manual Deal Entry *(Phase 1A)*

**Purpose:** Implement and exhaustively test every Appendix A formula before any AI explanation or scoring is built on top of it.

**Features included:** `FinancialEngine` (loan amount, PMT-based mortgage payment, NOI, monthly/annual cash flow, cap rate, cash-on-cash return, price/sqft) with defined zero/negative/missing-value/division-by-zero behavior; manual deal entry form (basic + "Add More Details"); Deal Analyzer one-property mode for manually-entered deals; editable-assumptions engine (preview/apply-temporarily/cancel; named-scenario saving deferred to Milestone 6, which has accounts).

**Features explicitly excluded:** Any AI narration; any live-provider dependency; saved named scenarios (needs auth, comes in M6).

**Pages/systems affected:** Deal Analyzer (one-property, manual-entry path).

**Technical dependencies:** None on live property data — intentionally provider-independent.

**External services required:** None.

**Data type:** User input (manual entry) only, clearly labeled as such.

**Expected deliverable:** A user can manually enter a deal and get a fully correct, tested financial breakdown, and edit assumptions with live recalculation.

**Acceptance criteria:** Every Appendix A formula matches spec exactly; safeguards (no `Infinity`, no fabricated output on divide-by-zero) hold; assumption edits recalculate every dependent number correctly.

**Automated tests:** The highest-priority test suite in the whole plan — unit tests covering positive, negative, zero, and missing-value cases for every formula; property-based/fuzz tests for the safeguards.

**Manual testing instructions:** Enter several manual deals (including edge cases like $0 down payment, 0% vacancy, missing HOA) and confirm every number is intuitively correct.

**Risks:** Low technically, but errors here propagate into every later analysis feature — worth extra scrutiny before moving on.

**Completion checkpoint:** Stop here explicitly — do not proceed to AI-driven analysis or scoring until this milestone's tests are fully green and manually spot-checked.

---

### Milestone 4 — Investor Search, Results & Full Investor Analysis *(Phase 1A)*

*May be built across 2–3 internal implementation passes (e.g., search/cards, then full analysis page, then scoring rubric wiring); one official completion checkpoint applies at the end.*

**Purpose:** Deliver the core investor discovery loop end-to-end on real property data, using the financial engine from M3 and the data layer from M2.

**Features included:** Natural-language search (initial structured parsing), strategy quick-selects, default + core advanced filters, grid/list/map(basic)/split views, manual sorting, property cards with recommendation reasons and Quick Numbers, quick-view panel; full Investor Analysis page (top summary, all 13 detailed sections, category scores using the **v1 documented rubric** — every weight visible, deterministic, tested, admin-configurable), comparable sales engine using RentCast comps + mock fallback.

**Features explicitly excluded:** AI-generated narration/chat (Milestone 5); Section 8 analysis (Milestone 8); Home Buyer context (Milestone 7).

**Pages/systems affected:** Investor Search page, quick view, full Investor Analysis page.

**Technical dependencies:** Milestone 2 (data layer), Milestone 3 (financial engine).

**External services required:** None new (uses RentCast key from M2, same deliberate-use policy).

**Data type:** Real RentCast data for facts/comps; v1 scoring rubric is deterministic application code, clearly labeled "v1/simplified."

**Expected deliverable:** The full investor discovery journey (spec §5.1) works end-to-end with correct numbers and honest, if simplified, scores.

**Acceptance criteria:** Ranking follows the spec's precedence (current search → goals → profile); every category score is either a real rubric value or an explicit Not Applicable/Insufficient Data/Low Confidence label, and every score displays which rubric version produced it; comps show why each was selected.

**Automated tests:** Search-ranking unit tests; comps-selection unit tests; scoring-rubric unit tests (every documented weight produces the expected output, including edge cases); end-to-end Playwright test of the full journey.

**Manual testing instructions:** Run the four example searches from the spec's home-page copy; open several results in quick view and full analysis; verify numbers match manual calculation for at least one property; confirm an admin can adjust a rubric weight and see it take effect.

**Risks:** Largest milestone in the plan — internal passes are expected; keep the single completion checkpoint at the true end.

**Completion checkpoint:** Stop and validate the full investor journey, including the scoring rubric's documentation and configurability, before adding AI.

---

### Milestone 5 — AI Orchestration Foundation *(Phase 1A — end of Alpha)*

**Purpose:** Introduce Claude, isolated by assistant type, layered strictly on top of the already-tested financial/scoring numbers from M3/M4 — never replacing them. This is the end of Phase 1A (internal working alpha).

**Features included:** Modular `AIOrchestrator` (provider-swappable); `InvestorAnalysisAssistant` (narrates/explains M4's numbers, never invents them or a score); `AskAboutThisDealAssistant` (single-property-scoped chat, temporary for guests); `HelpAssistant` (product Q&A only, floating help button, Contact-form handoff on unresolved issues).

**Features explicitly excluded:** Home Buyer/Section 8/Comparison assistants (later milestones); saved chat persistence (needs accounts, M6).

**Pages/systems affected:** Investor Analysis page (AI summary), floating Ask/Help chat UI.

**Technical dependencies:** Milestone 3 (financial engine as callable tool), Milestone 4 (analysis context and scoring engine to narrate).

**External services required:** Anthropic API key + billing — **requires your explicit go-ahead before the first real (paid) call**.

**Data type:** Real analysis data narrated by AI; AI never generates numbers or scores itself.

**Expected deliverable:** A property page with a working AI summary and a chat box that can answer questions about that one property, plus a site-wide Help assistant. At this point, Phase 1A (internal working alpha) is complete.

**Acceptance criteria:** Assistant always calls the calculation/scoring tools for any number or score rather than generating one; one property's chat never leaks into another's context; AI failures show a retry option and never fabricate text in place of a failed response.

**Automated tests:** Tool-use correctness tests (assert the assistant calls `FinancialEngine`/`ScoringEngine`, not free-text math or invented scores); context-isolation tests; AI-error-state tests.

**Manual testing instructions:** Ask the Investor assistant to change an assumption and confirm it updates via the real engine; open two different properties in two tabs and confirm no cross-contamination; open Help AI and ask a non-property question.

**Risks:** Uncontrolled AI cost from chat abuse even at internal-alpha scale — validate rate limiting here, not later.

**Completion checkpoint:** Stop and confirm AI is additive/explanatory only, never a source of numbers or scores, before moving into Phase 1B.

---

### Milestone 6 — Accounts & My Deals Workspace *(Phase 1B — start of Beta)*

*May be built across 2–3 internal implementation passes; one official completion checkpoint applies at the end.*

**Purpose:** Turn the guest-only alpha into a full account lifecycle, and let everything built so far (deals, scenarios, chats) actually persist. This begins Phase 1B (complete beta website).

**Features included:** Guest-to-account transfer flow; optional/skippable profile preferences; My Deals (save, folders, progress stages, notes, collapsible tasks); named saved scenarios (completing M3); saved chats persistence (completing M5's retention rules); in-app notifications (price/status/score-change, scoped to the decided refresh policy — see Milestone 10); RLS policies for all private data; private share links + standard downloadable report; Download My Data / account deletion.

**Features explicitly excluded:** Multi-property comparison (M9); document upload (M9); admin dashboard (M10).

**Pages/systems affected:** My Deals, Profile, Sign-in/Create-account flows, Share viewer.

**Technical dependencies:** Milestones 1 (auth), 3 (scenarios), 5 (chats).

**External services required:** None new.

**Data type:** Real user-generated data (saved deals, notes, scenarios) plus real property data already fetched.

**Expected deliverable:** A guest can search, analyze, then create an account and land back in the same workflow with everything preserved; My Deals and sharing fully work.

**Acceptance criteria:** RLS prevents any cross-user data access; guest transfer never restarts the user's workflow; share links are read-only, token-based, honor password/expiration, and exclude notes/docs by default.

**Automated tests:** RLS policy tests (user A cannot read user B's rows); guest-transfer integration test; share-link security tests (entropy, expiration, exclusion rules).

**Manual testing instructions:** As a guest, save a property, then sign up — confirm it appears in My Deals; create a folder, add a note and a task; generate a share link with a password, open it in a private/incognito window.

**Risks:** RLS misconfiguration is the single highest-severity bug class in this milestone — worth a deliberate adversarial test pass.

**Completion checkpoint:** Stop and confirm data isolation before continuing.

---

### Milestone 7 — Home Buyer Experience *(Phase 1B)*

**Purpose:** Deliver the complete, parallel Home Buyer journey, reusing the financial engine and data layer already built.

**Features included:** Home Buyer search/filters/sort (Best Overall Match default); full Home Buyer Analysis page (all required scores under the same documented v1-rubric conditions, monthly/upfront cost engine extending M3's engine, FRED-based mortgage rate integration, affordability tools with visible Skip, pricing/negotiation analysis, Geoapify/MapLibre neighborhood-proximity integration); `AskAboutThisHomeAssistant` (isolated from the investor assistant).

**Features explicitly excluded:** Section 8 (never appears in Home Buyer context, per spec).

**Pages/systems affected:** Home Buyers search page, full Home Buyer Analysis page.

**Technical dependencies:** Milestones 2, 3, 4 (shared infrastructure), 5 (AI pattern), 6 (saved Home Buyer scenarios need accounts).

**External services required:** FRED API key (free) — new.

**Data type:** Real RentCast property data + real FRED mortgage-rate data; neighborhood proximity via real Geoapify calls.

**Expected deliverable:** The full Home Buyer journey (spec §5.3) works end-to-end with correct cost/affordability numbers.

**Acceptance criteria:** Monthly/upfront cost totals match spec's required line items exactly; credit score and lender quote are genuinely optional and never block calculation; negotiation output includes every required field.

**Automated tests:** Mortgage/affordability calculation unit tests; Geoapify integration tests (mocked in CI, real in a manual pass); Home Buyer AI context-isolation tests.

**Manual testing instructions:** Run a Home Buyer search, open a property, skip affordability inputs entirely and confirm analysis still renders, then fill them in and confirm numbers update.

**Risks:** Fair Housing sensitivity in neighborhood/school/safety scoring — keep wording conservative; this remains subject to the legal-review hard gate before public launch, not something resolved in code alone.

**Completion checkpoint:** Stop and confirm the Home Buyer journey is complete and independently correct before Section 8.

---

### Milestone 8 — Section 8 Analysis Module *(Phase 1B)*

**Purpose:** Deliver the specialized Section 8 lens for Detroit, the market's other defining feature besides investor search.

**Features included:** Four-status labeling (Mentioned-Unverified / Tenant Reported / Active-Confirmed / HAP Contract Confirmed); rent-scenario comparison (current/HUD-benchmark/market) via real HUD User API; payment standard + rent-reasonableness display using the **manually curated, dated, source-linked** Detroit dataset — falling back to **Not available** where no curated entry exists; utility-allowance handling (never guessed); Section 8 scores (balanced + personalized fit + categories) under the same documented v1-rubric conditions; risk/process analysis (approval risk, leasing outlook, HAP abatement — all evidence-gated); collapsible Approval and Lease-Up Process section; Section 8 entry points wired into Investor Analysis, general property page, and Deal Analyzer (never Home Buyer).

**Features explicitly excluded:** Any Section 8 presence in Home Buyer context.

**Pages/systems affected:** Section 8 Analysis page, Investor Analysis (entry point), general property page (entry point).

**Technical dependencies:** Milestones 2–5.

**External services required:** HUD User API token (free) — new. Manually curated Detroit housing-authority dataset — your/owner research, dated and source-linked at entry, not automated.

**Data type:** Real HUD benchmark data; manually-entered, dated, source-linked Detroit payment-standard data where available (Not available otherwise); RentCast facts for the underlying property.

**Expected deliverable:** The full Section 8 discovery/analysis journey (spec §5.2) works for Detroit properties, with strict confirmed-vs-hypothetical labeling throughout.

**Acceptance criteria:** No abatement/inspection-failure claim appears without supporting evidence; missing current rent never gets silently replaced by a benchmark value; every dollar amount carries its required status label; every Detroit-specific figure shows its source and date or explicitly reads Not available.

**Automated tests:** Section 8 formula tests (extends Appendix A); status-labeling unit tests; "no fabrication" guardrail tests.

**Manual testing instructions:** Walk through a hypothetical (non-confirmed) Section 8 property and a confirmed one; verify the hypothetical one never implies guaranteed approval/inspection/HUD rent; verify a property with no curated local data shows Not available rather than an estimate.

**Risks:** Highest liability-sensitivity module in the whole product — treat the guardrail tests as non-negotiable before shipping.

**Completion checkpoint:** Stop and review guardrail test results carefully before moving on.

---

### Milestone 9 — Multi-Property Comparison & Document Upload (Internal, Flagged for Public) *(Phase 1B)*

*May be built across 2–3 internal implementation passes; one official completion checkpoint applies at the end.*

**Purpose:** Deliver the two remaining Deal Analyzer entry points: comparing several properties at once, and building (but not yet publicly enabling) document upload.

**Features included:** Deal Analyzer multi-property mode (comparison workspace, AI comparison brief, goal controls, metric table, category rankings, `ComparisonAssistant` scoped only to the compared set); document upload (PDF/image/spreadsheet) pipeline using Claude's native document/vision extraction, Needs-review labeling, confirm-before-analysis flow, save-to-deal/delete-document choice with retained-value provenance, pre-upload PII warning + basic pattern-based redaction (regex for SSN/phone/email, labeled "assistance, not guaranteed"), type/size/MIME validation — **built and fully tested internally, but gated behind a new administrator-controlled feature flag (`system_settings.uploads_public_enabled`), which defaults to `false`.**

**Features explicitly excluded:** Public-facing enabled uploads. Type/MIME/size validation is necessary but is **explicitly not sufficient** to turn the flag on — the flag may only move to `true` once real malware scanning is integrated and passes its own tests, or you give documented, explicit sign-off accepting the residual risk. Full ML-based redaction is also excluded.

**Pages/systems affected:** Deal Analyzer (multi-property mode), document upload flow (admin/internal-only visibility at launch).

**Technical dependencies:** Milestones 3 (financial engine for comparison metrics), 5 (AI pattern), 6 (saved comparisons need accounts).

**External services required:** None new for comparison. Malware-scanning integration is a distinct future dependency, not created in this milestone.

**Data type:** Mix of real (DealFactor-found), manual, and uploaded-and-extracted data (internal/admin testing only) — all provenance-labeled.

**Expected deliverable:** A user can compare 2+ properties from any input method and get a real comparison brief; internally, an admin can upload a listing PDF and get prefilled, review-gated fields — the public cannot access uploads yet.

**Acceptance criteria:** Comparison assistant never mixes in a property outside the current comparison set; extraction always requires explicit user confirmation before use; deleting a document keeps only user-confirmed structured values with provenance noting the deleted-source origin; `uploads_public_enabled` defaults to `false` and cannot be flipped to `true` without recent-reauthentication and an explicit admin action (no code path enables it implicitly).

**Automated tests:** Comparison-ranking unit tests; extraction confidence-labeling tests; redaction-pattern tests; comparison-AI context-isolation tests; a test explicitly asserting the public upload path is inaccessible while the flag is off.

**Manual testing instructions:** Compare a RentCast property, a manual entry, and an uploaded PDF together (as admin); upload a sample document containing a fake SSN/phone/email and confirm the redaction warning and pattern-matching behavior; confirm a non-admin session cannot reach the upload endpoint while the flag is off.

**Risks:** Uploaded files are private-by-default and now also public-disabled-by-default, which meaningfully reduces the unscanned-upload risk flagged earlier — residual risk only materializes if/when the flag is deliberately enabled, which itself requires a malware-scanning decision first (tracked in §12).

**Completion checkpoint:** Stop and confirm cross-property isolation, extraction-confirmation gating, and the upload flag's default-off/no-implicit-enable behavior before moving to admin/legal.

---

### Milestone 10 — Legal, Support, Admin Dashboard & Refresh Operations *(Phase 1B)*

*May be built across 2–3 internal implementation passes; one official completion checkpoint applies at the end.*

**Purpose:** Give the product an operator: legal pages, support channels, moderation tools, and the scheduled jobs that keep data fresh.

**Features included:** All required legal pages (draft/placeholder text, clearly marked "pending legal review"); Report an Issue (auto-attached context, guest support); Contact form; About/Help pages with CMS-editable content; admin dashboard core (user management, issue/support queues, data-source status, CMS with preview/version history/restore, refresh-limit configuration, activity log, and the `uploads_public_enabled` control from M9); admin TOTP auth + recent-reauth gating; the **decided refresh policy** implemented as scheduled Supabase functions: manual refresh on request (3/day default, admin-configurable) plus limited scheduled refresh for saved/recently-active properties only — explicitly **not** a twice-daily refresh of the full property universe, with cadence exposed as an admin setting.

**Features explicitly excluded:** Full multi-role admin (owner-only per spec at launch); market-expansion workflow beyond Detroit (architecture present, not exercised further); email verification (tracked as a pre-launch decision, not built here — see §12).

**Pages/systems affected:** Legal pages, Contact/Help, Admin dashboard, background refresh jobs.

**Technical dependencies:** Milestones 1–9.

**External services required:** None new.

**Data type:** Draft/placeholder legal content (explicitly labeled); real operational data (issue reports, activity logs).

**Expected deliverable:** An operator (you) can moderate reports, edit content without code, see data-source/refresh health, and control the uploads flag; real visitors can get support and see legal pages.

**Acceptance criteria:** Legal pages are reachable from every required location and visibly marked as pending final legal review; CMS edits don't require a deploy; admin sensitive actions (including flipping `uploads_public_enabled`) require recent reauthentication; activity log never records a TOTP code; refresh jobs never run a full-catalog twice-daily sweep.

**Automated tests:** Admin RBAC tests; refresh-job idempotency tests (no duplicate/contradictory records on retry); refresh-scope tests (only saved/recently-active properties are touched by scheduled jobs); activity-log completeness tests.

**Manual testing instructions:** Submit an issue report as a guest and as a signed-in user; edit a piece of CMS content and confirm it publishes with version history; trigger a manual refresh and confirm the remaining-refreshes counter updates; confirm the scheduled refresh job only touches saved/recently-viewed properties in a test run.

**Risks:** Placeholder legal text must not be mistaken for launch-ready — reaffirmed as a hard gate at Milestone 12.

**Completion checkpoint:** Stop and confirm admin/legal/support surfaces are functional before the dedicated QA milestone.

---

### Milestone 11 — Accessibility, Security, SEO & Performance Hardening *(Phase 1B — end of Beta)*

**Purpose:** A dedicated pre-launch quality gate — not new features, but proving the whole site meets the spec's non-functional bar before real visitors arrive. This is the end of Phase 1B: by completion, the full beta website exists and has passed its quality gates, still on Configuration A.

**Features included:** WCAG 2.2 AA pass across every page (keyboard nav, screen reader labels, contrast, focus management/trapping, reduced motion, accessible modals/tabs/tooltips/maps, non-visual chart/map alternatives); sitewide noindex + robots.txt verification; security review (rate limiting on every sensitive endpoint including the uploads-flag toggle, input validation audit, RLS audit, secrets audit, CSRF/XSS/injection checks); performance pass (LCP targets, progressive loading, truthful staged-progress panels, bundle-size checks); full error/loading/empty-state audit against spec §23; analytics wiring verification (no prohibited content in PostHog events).

**Features explicitly excluded:** New product features.

**Pages/systems affected:** Every page (audit, not addition).

**Technical dependencies:** Milestones 1–10.

**External services required:** None new.

**Data type:** N/A — this is a QA pass over existing real/mock/manual data.

**Expected deliverable:** A release-candidate build passing the acceptance criteria in spec §30 for accessibility, security, SEO, and performance, still running on Configuration A.

**Acceptance criteria:** Automated a11y scan (axe) passes with no critical violations; manual screen-reader walkthrough of the core journeys succeeds; no secrets appear in client bundles; Lighthouse performance budget met on core pages; no prohibited field appears in any analytics event payload.

**Automated tests:** Automated axe accessibility scan in CI; basic SAST/security-lint pass; Lighthouse CI performance budget checks; analytics event-schema assertions.

**Manual testing instructions:** Navigate the entire investor and home-buyer journeys using only a keyboard; run a screen reader (NVDA/VoiceOver) through the same journeys; attempt a few basic injection/access-control probes manually.

**Risks:** This milestone often surfaces issues from earlier milestones — budget time for fixes, not just detection, before moving to deployment.

**Completion checkpoint:** Stop — do not proceed to production deployment until this milestone's criteria are met. Phase 1B (complete beta website) is done at this point.

---

### Milestone 12 — Production Deployment & Custom Domain Connection *(Phase 1C)*

**Purpose:** Go live — the final Phase 1 milestone, and the only one in Phase 1C.

**Features included:** Fresh cost recalculation and presentation to you (per §1.4/§2 — numbers are not assumed from earlier in this plan); your explicit approval of a specific paid configuration before any upgrade; Vercel production environment finalized on the approved plan; production secrets/environment variables set; custom domain (purchased externally by you) connected with HTTPS enforcement and canonical-hostname redirects; DNS configuration; weekly backup verification; Sentry uptime/error monitoring live; final go-live checklist against spec §27 (MVP/beta launch bar) and §30 (acceptance criteria), explicitly including: legal review completed (not just placeholder text), the email-verification decision explicitly made one way or the other, and `uploads_public_enabled` confirmed still `false` unless malware scanning has since been added and tested.

**Features explicitly excluded:** Nothing — this is the finish line for Phase 1, not a place to cut scope.

**Pages/systems affected:** Deployment configuration, DNS, domain-facing metadata.

**Technical dependencies:** All prior milestones, especially 11.

**External services required:** Domain purchase (you, external) — required before this milestone can complete. Whatever paid-plan upgrades you approve after seeing the recalculated costs.

**Data type:** Real production data going forward.

**Expected deliverable:** DealFactor is live on your custom domain, reachable by real visitors, noindexed, monitored, and backed up.

**Acceptance criteria:** HTTPS enforced with no mixed-content warnings; alternate hostnames redirect to canonical; noindex confirmed live via a real search-engine fetch test; weekly backup restorable in a dry run; production smoke test passes on the real domain; legal review is confirmed complete (not placeholder); email-verification decision is documented; upload flag state is confirmed intentional.

**Automated tests:** Production smoke tests (critical path: search → analyze → save → share) run against the live domain.

**Manual testing instructions:** Visit the live domain from an outside network, run through the core journeys as a real anonymous visitor, then sign up and confirm persistence.

**Risks:** This is the point where "legal pages are still placeholders" becomes a real blocker if not yet resolved — **do not treat this milestone as complete for real public traffic until legal review has actually happened**, even though the technical deployment itself can finish independently.

**Completion checkpoint:** Final stop of Phase 1 — full review against spec §27 and §30, plus the explicit gates above, before calling Phase 1 done.

---

## 7. Phase 2 — Major Feature Expansion (feature groups, not yet milestoned)

- Real photo-provider integration (once a licensed feed exists) — plugs into the existing `PropertyMediaProvider` interface with no UI rework
- Real malware scanning for uploads, enabling the `uploads_public_enabled` flag for real visitors
- Additional/upgraded property-data providers (Zillow/Realtor.com/Redfin/MLS/ATTOM, once genuinely licensed) — plugs into the existing `PropertyDataProvider` interface
- Refined, validated scoring formulas replacing the Phase 1 v1 rubric (with real product/data validation behind the changes)
- Market expansion beyond Detroit (the admin market-expansion workflow already exists architecturally; Phase 2 exercises it for new metros)
- Advanced staff roles activated beyond owner-only (market-data manager, support, content editor)
- Email/SMS property alerts (opt-in, beyond in-app notifications)
- Deeper admin market-research automation
- Advanced mobile optimization
- Report customization
- Profile-level advanced weighting controls
- Deeper analytics dashboards

## 8. Phase 3 — Advanced Capabilities (feature groups)

- Paid plans / monetization infrastructure (architecture allows, not exposed to users)
- Premium reports, higher usage limits
- Referral and partnership programs (agent, lender, property-manager)
- Collaborative multi-user deal workspaces
- Direct property-tour request integrations
- 5+ unit multifamily, commercial, and vacant-land specialized analysis
- Full nationwide advanced analysis at scale (all target states activated)
- Additional report formats, deeper continuous market-research automation
- Apple sign-in
- Public search-engine indexing enablement

## 9. Long-Term Features (preserved as-is from spec §29 — not shrunk by Phase 1 sequencing)

Paid plans and monetization; premium reports; higher limits; referrals/partnerships; email/text alerts; collaborative workspaces; direct tour requests; agent/lender/property-manager partnerships; fully activated staff roles; advanced mobile optimization; nationwide advanced analysis beyond Detroit and other activated markets; 5+ unit multifamily analysis; commercial property analysis; vacant-land analysis; additional report formats; deeper analytics; more advanced continuous market research; Apple sign-in; email verification if later needed.

---

## 10. Highest Technical & Business Risks

1. **Property-data licensing** — RentCast's terms look favorable, but only qualified legal review (not web research) can confirm it before real public launch.
2. **Photo licensing** — no real photo source exists yet; placeholder-only presentation is a genuine UX/reputational gap versus visitor expectations.
3. **Unvalidated scoring** — even under the documented/tested/admin-configurable v1-rubric conditions, it remains an interim approach that must stay clearly labeled and not be presented as final.
4. **Fair Housing / legal exposure** — neighborhood/school/safety scoring needs real legal review before public launch.
5. **Cost trajectory** — Configuration A keeps Phase 1 near $0–10/month, but the realistic production configuration (~$150/mo) exceeds the stated target; this needs an active decision at Milestone 12, not a default.
6. **AI cost/abuse** — a public AI chat feature is vulnerable to cost-driving abuse without effective rate limiting.
7. **Single-operator risk** — admin is owner-only at launch; no redundancy for support or monitoring.
8. **Unscanned uploads** — mitigated substantially by the default-off public feature flag, but the underlying malware-scanning gap must still be closed (or knowingly, explicitly waived by you) before the flag ever flips to `true`.
9. **Section 8 liability sensitivity** — wrong guidance on approval/HAP/abatement has real financial consequences for users; guardrail tests in Milestone 8 are non-negotiable.
10. **Refresh-scope discipline** — the limited refresh policy must be enforced in code (tested in Milestone 10), not just described, or costs and staleness both drift the wrong way as usage grows.

## 11. External Dependencies You Must Obtain

- RentCast API account (free Developer tier; used only for deliberate verification calls; any tier upgrade needs your approval)
- HUD User API token (free)
- FRED API key (free)
- Anthropic API key + billing (needs your go-ahead before first paid call)
- Supabase account/project (free tier to start)
- Vercel account (Hobby to start; Pro pending your cost decision at Milestone 12)
- Geoapify API key (free)
- Google Cloud OAuth client for Google sign-in (free)
- Domain name purchase (whenever you're ready — needed by Milestone 12)
- Sentry account (free tier)
- PostHog account (free tier)
- Manually-researched, dated, source-linked Detroit local housing-authority payment-standard data (no API — your/owner curation)
- Malware-scanning service or solution (Phase 2, or sooner if you choose to enable public uploads earlier — see §12)
- (Phase 2+) Real Zillow/Realtor.com/Redfin/MLS/ATTOM licensing, if pursued
- Qualified legal review of all legal pages and Fair Housing-sensitive features before real public launch

## 12. Key Decisions You Must Make Before Implementation (or Before Milestone 12, Where Noted)

1. **When to move beyond Configuration A**, and to which configuration (B/C/D/hybrid) — deferred by design until costs are recalculated at Milestone 12, but worth knowing this is coming.
2. **Vercel Hobby vs. Pro** — tied to decision 1; Hobby is fine for private/internal work, Pro is the compliant choice once approaching public launch.
3. **Malware scanning for uploads** — build a real scanning integration before enabling `uploads_public_enabled`, or leave uploads disabled for public users indefinitely at launch and revisit in Phase 2. (Uploads remain built/internally usable either way per Milestone 9.)
4. **Email verification** — keep disabled at public launch (matching the spec's original intent) or enable it as an added safeguard, given immediate-use accounts are otherwise unverified. Needs an explicit answer before Milestone 12 completes, not a default carried forward silently.

All other major open questions from earlier in the process (refresh cadence, scoring-rubric approach, Detroit data sourcing, legal-review timing) are now resolved per the decisions listed in the Context section above and reflected throughout this plan.

## 13. Recommended First Milestone

**Milestone 1 — Foundation & Environment Setup.** It has zero licensing or cost risk (free-tier signups plus scaffolding), everything else in the plan depends on it, and it gives you something real to look at (a deployed, navigable skeleton) before any data or AI spend begins.
