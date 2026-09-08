# Greenville Dining Guide

Personal dining guide for restaurants Chip actually uses in Greenville, SC: staff you know, baked-in menus, ratings, and **per-dish rankings**.

This is a static site (`index.html`). Rankings and any uploaded/replaced menus live in the browser (`localStorage`). There is no app backend.

## Run locally

Any static server from the repo root works:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`. Opening `index.html` as a `file://` URL also works for baked-in menus and ranking.

## Demo: menu + dish ranking (Greenville)

Ranking lives on the restaurants already in this guide — not a beach-trip card. **No API key.**

1. Open the app. Greenville restaurants and staff still show. Search **Todd** or **Soby** to confirm staff search.
2. Search **Soby**. Expand **Soby’s New South Cuisine**. Tap **Menu →**.
3. Confirm baked-in sections (Southern Taste, Soups & Salads, Sides, Entrees, …) with jump chips.
4. Rank **Fried Green Tomatoes** Order, tap **5 stars**, then **Add comment** and type a short note. Rank **Crab Cakes** Maybe with **3 stars**. Rank **Seasonal Vegetable Plate** Skip.
5. Open **What to order**. Fried Green Tomatoes first (with stars + comment), then Crab Cakes. The skip stays off this list.
6. Close the menu. The card’s **What to order** line and the Menu button count should match.
7. Refresh. Reopen Soby’s — rankings, stars, and comments should still be there.

The same Order / Maybe / Skip, 1–5 stars, and optional comment controls are on every Greenville restaurant in the guide, including newly embedded **Cork & Cleaver** (official PDF) and **South Main Social** (official site — names only, no published prices). Uploaded menus use the same rank UI.

Places without a stable public menu stay as they were: BrickTop’s (no good GVL priced HTML), Curean (rotating), Topsoil (prix fixe only). DeMarco’s prices were not re-verified. Live extract remains optional and **UNVERIFIED**.

## Optional QA fixture (not a restaurant)

[`fixtures/island-fish-beach-company.json`](fixtures/island-fish-beach-company.json) is an extract-format sample from Chip’s Island Fish photos. It is **not** a Greenville restaurant and is **not** shown as a card. Keep it only if you need a labeled JSON shape for upload/extract testing.

## Optional live extract

Upload on **Add / replace** will `POST /api/extract` when that endpoint exists.

| Mode | When |
| --- | --- |
| **Baked-in Greenville menus (required)** | Always available. No key. Rank dishes immediately. |
| **Live AI (optional)** | Cloudflare Pages Function at [`functions/api/extract.js`](functions/api/extract.js) if `ANTHROPIC_API_KEY` is set. |

Treat any live extract as a draft. Vision models misread prices and skip lines.

## Deploy

The live site is a static host (currently [greenville-dining-guide.com](https://greenville-dining-guide.com)). Push `main` / this branch the same way you already publish `index.html`.

If you publish with **Cloudflare Pages** (no build command; output is the repo root):

1. Pages will serve `index.html` as today.
2. To enable live extract, add a Pages secret named `ANTHROPIC_API_KEY`. The Function under `functions/api/extract.js` is picked up automatically.
3. Custom domains that need Chip’s DNS stay out of scope here.

No new deploy is required to try rankings on a local static server.

## Persistence

| Key | What |
| --- | --- |
| `gvl.order` | Existing drag-to-reorder / top-five favorites |
| `gvl.ranks` | Per-restaurant dish ranks. Keyed by restaurant name, then `section\|dish name`. Each dish is `{ v, n, s }`: `v` is `order` / `maybe` / `skip`, `n` is the optional comment, `s` is a 1–5 star rating. Older saves without `s` still load. |
| `gvl.customMenus` | Menus from a live extract (overrides the baked-in menu for that restaurant) |

Clearing site data resets rankings and custom menus. Baked-in Greenville menus remain in the page.
