---
name: browser-verify
description: Verify a feature works in the browser using Chrome DevTools MCP. Use this when asked to check, test, or verify UI changes visually, or when confirming SSR output, CSS, network requests, or console errors.
---

## Prerequisites check

Before using any `mcp__chrome-devtools__*` tool, verify both the dev server and Chrome debug instance are running:

```bash
# 1. Check dev server
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000
# Expected: 200. If not, run: pnpm dev

# 2. Check Chrome debug port
curl -s http://127.0.0.1:9222/json/version | grep Browser
# Expected: Chrome version string. If not, run: pnpm chrome
```

If either is down, tell the user to run `pnpm dev:all` from the project root, or `Cmd+Shift+B` in VSCode to trigger the "Dev: Start All" task.

## Dev server port

Next.js picks the first available port starting at 3000. Other apps on this machine use 3000 (idealista dev server). The imagine app typically lands on **3001** or **3002**. Always check with `list_pages` or curl before navigating.

## Standard verification workflow

1. **Check prerequisites** (above)
2. **List open pages** — `mcp__chrome-devtools__list_pages`
3. **Navigate to the app** — `mcp__chrome-devtools__navigate_page` with `type: "url"`
4. **Take a screenshot** — `mcp__chrome-devtools__take_screenshot` to confirm visual state
5. **Take a snapshot** — `mcp__chrome-devtools__take_snapshot` for a11y tree / element inspection
6. **Check console** — `mcp__chrome-devtools__list_console_messages` for errors/warnings
7. **Check network** — `mcp__chrome-devtools__list_network_requests` for API calls, cache headers, SSR data

## Verify SSR (SEO check)

Use `evaluate_script` to read the raw HTML and confirm content is server-rendered:

```js
() => document.documentElement.outerHTML.substring(0, 2000)
```

If the content is in the initial HTML (not injected by JS), SSR is working.

## Common tools

| Task | Tool |
|------|------|
| See what's open | `list_pages` |
| Navigate | `navigate_page` |
| Visual check | `take_screenshot` |
| Inspect elements / a11y | `take_snapshot` |
| JS errors | `list_console_messages` with `types: ["error"]` |
| Network / API calls | `list_network_requests` |
| Run JS in page | `evaluate_script` |
| Lighthouse audit | `lighthouse_audit` |
| Performance trace | `performance_start_trace` + `performance_stop_trace` |

## Chrome debug profile

Chrome is launched with `--user-data-dir=$HOME/.chrome-debug-imagine` — a dedicated profile separate from your main Chrome. Safe to use alongside your regular browser session.
