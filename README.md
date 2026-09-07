# Greenville Dining Guide

Personal dining guide for restaurants Chip actually uses in Greenville, SC: staff you know, baked-in menus, ratings, and now **per-dish rankings**.

This is a static site (`index.html`). Rankings and any uploaded/replaced menus live in the browser (`localStorage`). There is no app backend.

## Run locally

Any static server from the repo root works:

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`. Opening `index.html` as a `file://` URL also works for the fixture/ranking path.

## Demo: menu + dish ranking

Island Fish Beach Company is included as a **beach-trip** card (not a Greenville restaurant) with Chip’s four menu photos already transcribed. **No API key.**

1. Search **Island Fish** (or scroll — it sits with the restaurant cards and has a BEACH TRIP badge).
2. Expand the card. Staff is omitted (none recorded). Tap **Menu →**.
3. Confirm sections from Salads & Dips through Temaki, with jump chips.
4. Rank a few dishes **Order / Maybe / Skip**. Add an optional note on a ranked item.
5. Open **What to order**. Order items appear first, then Maybe. Skip and unranked stay off this list.
6. Close the menu. The card’s **What to order** line and the Menu button count should match.
7. Refresh. Reopen Island Fish — rankings and notes should still be there.

Restaurants that already had in-app menus (Jones, Soby’s, Coral, …) get the same ranking controls. Cork & Cleaver and South Main Social still have no baked-in menu: expand the card → **Add menu →** → **Load Island Fish fixture** or upload photos/PDF.

Photo map used for the fixture (same as the standalone Menu Rank experiment):

1. Salads & Dips / Sandwiches / Pizza
2. Fried / Small Plates / Raw Bar
3. Sushi/Sashimi / Specialty Rolls
4. Apps / Sushi Rolls / Temaki

The JSON lives at [`fixtures/island-fish-beach-company.json`](fixtures/island-fish-beach-company.json) and is also embedded in `index.html` so the demo works offline.

## Optional live extract

Upload on **Add / replace** will `POST /api/extract` when that endpoint exists.

| Mode | When |
| --- | --- |
| **Fixture / baked-in menus (required)** | Always available. No key. |
| **Live AI (optional)** | Cloudflare Pages Function at [`functions/api/extract.js`](functions/api/extract.js) if `ANTHROPIC_API_KEY` is set. |

Treat any live extract as a draft. Vision models misread prices and skip lines.

## Deploy

The live site is a static host (currently [greenville-dining-guide.com](https://greenville-dining-guide.com)). Push `main` / this branch the same way you already publish `index.html`.

If you publish with **Cloudflare Pages** (no build command; output is the repo root):

1. Pages will serve `index.html` as today.
2. To enable live extract, add a Pages secret named `ANTHROPIC_API_KEY`. The Function under `functions/api/extract.js` is picked up automatically.
3. Custom domains that need Chip’s DNS stay out of scope here.

No new deploy is required to try rankings or the Island Fish fixture on a local static server.

## Persistence

| Key | What |
| --- | --- |
| `gvl.order` | Existing drag-to-reorder / top-five favorites |
| `gvl.ranks` | Per-restaurant dish ranks (`order` / `maybe` / `skip`) and notes |
| `gvl.customMenus` | Menus loaded from the fixture or a live extract (overrides the baked-in menu for that restaurant) |

Clearing site data resets rankings and custom menus. Baked-in Greenville menus and the Island Fish fixture remain in the page.
