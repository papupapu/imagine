# Deploy on Vercel

## Prerequisites

- Vercel account linked to your Git provider
- Production database on [Neon](https://neon.tech) (separate from local/dev)
- Sanity project configured at [sanity.io](https://sanity.io)
- GitHub OAuth app with production callback URL
- Google OAuth app with production callback URL
- GitHub PAT with `read:packages` scope (for `@papupapu/ui` from GitHub Packages)

---

## 1. Node version

Vercel does **not** read Volta pins. Set the Node version explicitly.

Add to `apps/web/package.json`:

```json
"engines": {
  "node": ">=20.9.0"
}
```

Or set `VERCEL_NODE_VERSION=24` in the Vercel project environment variables.

---

## 2. Project setup on Vercel

1. Import the Git repository on Vercel
2. Set **Root Directory** to `apps/web`
3. Framework preset: **Next.js** (auto-detected)
4. Build command: `next build` (default)
5. Output directory: `.next` (default)

> The monorepo root has a `turbo.json`, but since Vercel is pointed at `apps/web` directly, Turborepo is not involved in the Vercel build.

---

## 3. GitHub Packages authentication

`@papupapu/ui` and `@papupapu/tailwind-config` are hosted on GitHub Packages, which requires auth even for read access. Vercel needs your PAT to install them.

**Step 1** — Generate a GitHub PAT:
- Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Required scope: `read:packages`

**Step 2** — Add it as an environment variable in Vercel:

| Variable | Value |
|----------|-------|
| `GITHUB_PACKAGES_TOKEN` | Your GitHub PAT |

> Do **not** name it `NPM_TOKEN` — Vercel intercepts that name and wires it to the public npm registry, breaking GitHub Packages auth.

**Step 3** — The `.npmrc` at the repo root already contains the auth line:

```
@papupapu:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
```

pnpm expands `${GITHUB_PACKAGES_TOKEN}` from the environment at install time. No further changes needed.

> Make sure `.npmrc` is committed to the repo. Do **not** put the token value directly in `.npmrc`.

---

## 4. Environment variables

Set all of these in **Vercel → Project → Settings → Environment Variables**.

### GitHub Packages

| Variable | Value |
|----------|-------|
| `GITHUB_PACKAGES_TOKEN` | GitHub PAT with `read:packages` scope (see section 3) |

### Database

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon connection string, e.g. `postgresql://user:pass@host/dbname?sslmode=require` |

Use the **production** Neon branch, not the dev one.

### Auth

| Variable | Value |
|----------|-------|
| `BETTER_AUTH_SECRET` | Random 32-byte hex — generate with `openssl rand -hex 32` |
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://imagine.yourdomain.com` |

### GitHub OAuth

| Variable | Value |
|----------|-------|
| `GITHUB_CLIENT_ID` | From [github.com/settings/developers](https://github.com/settings/developers) |
| `GITHUB_CLIENT_SECRET` | From the same OAuth app |

Callback URL to register in GitHub:
```
https://your-production-domain.com/api/auth/callback/github
```

### Google OAuth

| Variable | Value |
|----------|-------|
| `GOOGLE_CLIENT_ID` | From [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| `GOOGLE_CLIENT_SECRET` | From the same OAuth credential |

Authorized redirect URI to register in Google:
```
https://your-production-domain.com/api/auth/callback/google
```

### Sanity

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Your Sanity project ID (currently `45ehuc21`) |
| `NEXT_PUBLIC_SANITY_DATASET` | `production` |
| `SANITY_REVALIDATE_SECRET` | Random hex — generate with `openssl rand -hex 16` |

---

## 5. Sanity webhook

To enable on-demand ISR when content changes in Sanity:

1. Go to [sanity.io/manage](https://sanity.io/manage) → your project → **API → Webhooks**
2. Create a new webhook:
   - **URL**: `https://your-production-domain.com/api/revalidate?secret=<SANITY_REVALIDATE_SECRET>`
   - **Trigger on**: `create`, `update`, `delete`
   - **Filter**: `_type == "post"` (optional, reduces noise)
   - **HTTP method**: `POST`

---

## 6. Middleware deprecation

`src/middleware.ts` uses the old convention deprecated in Next.js 16. Rename it to `src/proxy.ts` to eliminate the build warning:

```bash
mv apps/web/src/middleware.ts apps/web/src/proxy.ts
```

The exported `config` matcher and the function signature stay identical — only the filename changes.

---

## 7. Slug routes and static generation

`/[slug]` is currently dynamic (`ƒ`). `generateStaticParams` is defined but slugs are rendered on-demand at runtime. If you want unknown slugs to 404 instead of attempting a server render, add to `[slug]/page.tsx`:

```ts
export const dynamicParams = false;
```

---

## 8. Post-deploy checklist

- [ ] Home page loads and posts are visible
- [ ] A slug page (`/some-post-slug`) renders correctly
- [ ] Login with GitHub redirects and creates a session
- [ ] Login with Google redirects and creates a session
- [ ] Protected routes (`/dashboard`, `/profile`) redirect to `/login` when unauthenticated
- [ ] Publish or update a post in Sanity → webhook fires → page revalidates within seconds
- [ ] Check Vercel Function logs for any runtime errors
