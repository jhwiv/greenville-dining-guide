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
4. Rank **Fried Green Tomatoes** Order, **Crab Cakes** Maybe, **Seasonal Vegetable Plate** Skip. Add an optional note on the tomatoes.
5. Open **What to order**. Fried Green Tomatoes first, then Crab Cakes. The skip stays off this list.
6. Close the menu. The card’s **What to order** line and the Menu button count should match.
7. Refresh. Reopen Soby’s — rankings and notes should still be there.

The same Order / Maybe / Skip controls are on every Greenville restaurant that already had an in-app menu (Jones, Coral, Jianna, …).

Cork & Cleaver and South Main Social still have no baked-in menu: expand the card → **Add menu →** → upload photos or a PDF. Do not invent dishes for those places. Live extract needs an API key on deploy; treat any extract as **UNVERIFIED**.

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
| `gvl.ranks` | Per-restaurant dish ranks (`order` / `maybe` / `skip`) and notes |
| `gvl.customMenus` | Menus from a live extract (overrides the baked-in menu for that restaurant) |

Clearing site data resets rankings and custom menus. Baked-in Greenville menus remain in the page.
