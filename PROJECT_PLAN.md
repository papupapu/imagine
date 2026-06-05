# Imagine — Blog Platform Architecture Plan

## Dev Environment Setup

### Prerequisites
- **Node 24** — pinned via Volta in `package.json`. Install Volta, then `volta install node@24`.
- **pnpm 10** — `npm install -g pnpm@10.30.1`
- **Chrome DevTools MCP** — installed globally: `npm install -g chrome-devtools-mcp@latest`
- **GitHub Packages auth** — `~/.npmrc` must contain your PAT for `@papupapu` scope (see `.npmrc` at project root for the registry config)

### Starting the dev environment

```bash
# Start everything (Next.js dev server + Chrome debug instance)
pnpm dev:all

# Or separately:
pnpm dev       # Next.js only (Turbopack, auto-picks available port starting at 3000)
pnpm chrome    # Chrome with remote debugging on port 9222
```

In VSCode: `Cmd+Shift+B` runs the default build task **"Dev: Start All"** — starts both in parallel.

### Chrome DevTools MCP
The `chrome-devtools` MCP server is registered globally via `claude mcp add` and connects to `http://127.0.0.1:9222`. Chrome **must be running** (via `pnpm chrome`) for the MCP tools to work. A Claude skill at [.claude/skills/browser-verify.md](.claude/skills/browser-verify.md) documents the full verification workflow.

> **Note:** Port 3000 is used by another app on this machine (idealista dev server). The imagine app typically starts on **3001** or **3002**. Always check with `pnpm dev` output or `curl http://localhost:3001`.

### Install dependencies
```bash
pnpm install
```

---

## Context

Greenfield project to build a production-ready, SSR blog platform where users create posts, comment, and have profiles. Content is managed via headless CMS. Auth is social-only (Google/GitHub OAuth). Everything must be fast, SEO-optimized, and lightweight.

The existing `@mine/ui` library (published from the separate `mine` repo) will be consumed as an npm dependency. Blog-specific components live in the app itself; shared UI primitives come from `@mine/ui`.

---

## Tech Stack

| Concern | Choice | Why |
|---------|--------|-----|
| Framework | **Next.js 16 (App Router)** | SSR, ISR, RSC, streaming, PPR — all built-in |
| Language | TypeScript (strict) | — |
| Styling | **Tailwind CSS v4** | Already used in `@mine`, zero-runtime, v4 has `@theme` + `@source` |
| CMS | **Sanity v3** | GROQ, TypeGen, `next-sanity` App Router support, generous free tier |
| Auth | **Better Auth** | Database sessions, instant revocation, first-class Drizzle adapter. Auth.js is in maintenance mode for greenfield projects |
| Database | **Neon Postgres** | Serverless, branching for previews, Drizzle HTTP adapter |
| ORM | **Drizzle** | Zero client bundle overhead, SQL-native, type-safe |
| Client state | **TanStack Query v5** (sparingly) | Only for client-side polling/mutations; RSC + Server Actions cover most cases |
| Component lib | **@mine/ui** (npm dependency) | Reuse existing published library |
| Monorepo | **pnpm workspaces + Turborepo** | Same proven pattern as `@mine` |
| Deployment | **Vercel** | First-class Next.js support, edge network, preview deploys |

---

## Project Structure

```
imagine/
  package.json                    # root, private: true
  pnpm-workspace.yaml
  turbo.json
  apps/
    web/                          # Next.js blog app
      next.config.ts
      middleware.ts               # cookie check for protected routes
      app/
        layout.tsx
        globals.css               # @import "tailwindcss"; @source "@mine/ui"
        (marketing)/              # public, cacheable, SEO-critical
          page.tsx                # landing
          blog/
            page.tsx              # blog index (ISR)
            [slug]/page.tsx       # post detail (ISR + on-demand revalidation)
        (app)/                    # behind auth, dynamic
          dashboard/page.tsx
          profile/page.tsx
          posts/new/page.tsx
          posts/[id]/edit/page.tsx
        (auth)/                   # login/signup, minimal chrome
          login/page.tsx
        api/
          auth/[...all]/route.ts  # Better Auth catch-all
          revalidate/route.ts     # Sanity webhook for cache invalidation
      lib/
        auth.ts                   # Better Auth server config
        auth-client.ts            # Better Auth client
        sanity/client.ts          # sanityFetch with Next.js cache tags
        sanity/queries.ts         # typed GROQ queries
        db/schema.ts              # Drizzle: users, sessions, comments, likes
      features/
        comments/                 # CommentList (RSC), CommentForm (client), actions.ts
        posts/                    # PostCard (RSC), PostEditor (client)
      components/                 # blog-specific composed components (not in @mine/ui)
        Navbar.tsx
        Footer.tsx
        Providers.tsx
    studio/                       # Sanity Studio (optional, or use hosted)
```

---

## Data Architecture

| Data | Storage | Reason |
|------|---------|--------|
| Posts, authors, categories, tags | **Sanity** | Editorial content, rich media, preview workflow |
| Comments, likes, bookmarks | **Postgres (Drizzle)** | User-generated, high write volume, relational |
| User profiles, sessions | **Postgres (Drizzle)** | Better Auth manages this |

---

## Data Fetching Strategy

- **RSC by default.** Client components only where interactivity is required (forms, editors, toggles).
- Blog posts: `sanityFetch()` with ISR (`revalidate: 3600`) + on-demand revalidation via Sanity webhook calling `revalidateTag()`.
- Comments: Drizzle query in RSC, revalidated via `revalidateTag("comments-{postId}")` after Server Action mutations.
- Comment form: Server Action with `useOptimistic` for instant feedback.
- Post editor: client component with Tiptap, Server Action for save.
- Dashboard stats: TanStack Query for polling — the only place we use client-side data fetching.

---

## Component Library (`@mine/ui` — external dependency)

- Consumed as an npm dependency, not a workspace package. Install via `pnpm add @mine/ui`.
- Tailwind classes exposed to the blog app via `@source "@mine/ui"` in `globals.css`.
- Blog-specific composed components (Navbar, Footer, PostCard) live in `apps/web/components/` — they import primitives from `@mine/ui`.
- If new shared primitives are needed, add them to `@mine/ui` in the separate repo and publish a new version.
- Future improvement: add `server.ts` / `client.ts` entry points to `@mine/ui` for proper RSC boundaries (tracked separately).

---

## Auth: Better Auth + Social OAuth

- Database sessions on Postgres (via Drizzle adapter). No JWT — we have a DB anyway.
- Google + GitHub OAuth providers.
- `middleware.ts`: lightweight cookie-presence check for `/(app)` routes; redirect to `/login` if missing. Full session validation in route server components / Server Actions.
- Session: 7-day expiry, daily refresh.

---

## Performance

- **Images**: Next.js `<Image>` + Sanity CDN transforms (automatic WebP/AVIF, blur placeholders).
- **Fonts**: `next/font/google` with one variable font (Inter or Geist), self-hosted, `display: 'swap'`.
- **Bundle**: Turbopack (default in Next.js 16), React Compiler enabled, `@next/bundle-analyzer` in CI with budget (first-load JS < 90kB for marketing routes).
- **Edge runtime**: for `(marketing)` routes where no Node APIs are needed.
- **PPR (Partial Prerendering)**: blog post page — static content shell + streamed dynamic comments via `<Suspense>`.
- **Dynamic imports**: for heavy client components (Tiptap editor, syntax highlighter).

---

## Implementation Phases

### Phase 1: Project Skeleton
1. Pin Node 24 via Volta: `volta install node@24 && volta pin node@24` (writes `"volta": { "node": "24.x.x" }` to root `package.json`)
2. Init root: `package.json`, `pnpm-workspace.yaml`, `turbo.json` (based on `@mine` config)
3. Scaffold `apps/web` with Next.js 16 App Router + Tailwind v4
4. Install `@mine/ui` as npm dependency, configure `@source` in `globals.css`
5. Verify `@mine/ui` components render correctly in the Next.js app

### Phase 2: Auth + Database
1. Route group structure: `(marketing)`, `(app)`, `(auth)`
2. Set up Drizzle + Neon (schema: users, sessions, comments, likes, bookmarks)
3. Integrate Better Auth with Google + GitHub OAuth
4. Middleware for protected routes
5. Basic layouts for each route group

### Phase 3: CMS + Content
1. Init Sanity project (schemas: post, author, category, tag)
2. Build `lib/sanity/` — client, typed GROQ queries, image helpers
3. Blog index page (paginated, ISR)
4. Blog post detail page (ISR + on-demand revalidation webhook)
5. Dynamic OG image generation per post (`opengraph-image.tsx`)
6. SEO: `sitemap.ts`, `robots.ts`, metadata API

### Phase 4: User Features
1. Login/signup with social OAuth
2. User profiles (view + edit)
3. Comment system (Server Actions + optimistic UI)
4. Like/bookmark functionality
5. Post creation/editing (Tiptap editor)
6. Dashboard

### Phase 5: Polish + Production
1. PPR for blog post pages
2. Bundle analysis + performance budgets in CI
3. Error boundaries, not-found pages, loading states
4. Lighthouse CI integration
5. GitHub Actions: build, type-check, test

---

## Verification

- **Phase 1**: `turbo build` succeeds, `@mine/ui` components render in the Next.js app, Tailwind classes from the library apply correctly.
- **Phase 2**: `/login` redirects to OAuth provider, session persists, `/(app)` routes are protected, `/(marketing)` routes are public.
- **Phase 3**: Blog posts render with SSR (view source shows content), ISR works (stale content updates after revalidation), OG images generate correctly.
- **Phase 4**: Full user flow — login, create post, comment, like, view profile.
- **Phase 5**: Lighthouse scores > 90 on all metrics for marketing pages, bundle budget holds, CI pipeline green.

---

## Risks

| Risk | Mitigation |
|------|------------|
| Better Auth is newer than Auth.js | Active development, Auth.js's own team recommends it for greenfield. Test OAuth flows thoroughly with both providers. |
| Sanity costs at scale | ISR + on-demand revalidation means most requests never hit Sanity API. Monitor CDN usage. |
| Drizzle migration story less polished than Prisma | Review generated SQL diffs manually in CI. Use `drizzle-kit generate` + `drizzle-kit migrate`. |
| `@mine/ui` missing RSC entry points | Blog-specific components wrap `@mine/ui` primitives. Add `server.ts`/`client.ts` exports to `@mine/ui` when needed. |
