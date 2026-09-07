/**
 * Optional live menu extract for Cloudflare Pages.
 * Requires an ANTHROPIC_API_KEY Pages secret. The Island Fish fixture
 * and baked-in Greenville menus work without this endpoint.
 */

const MODEL = "claude-sonnet-4-6";

const EXTRACT_PROMPT = `Extract every menu item from the attached restaurant menu photo(s) or PDF pages.

Return ONLY JSON with this shape:
{
  "restaurantName": string,
  "sectionOrder": string[],
  "sectionNotes": [{ "section": string, "note": string }],
  "items": [{ "name": string, "description": string, "priceText": string, "section": string }]
}

Rules:
- One item per dish. Combine size variants on one item (priceText like "$14 / $18 / $20").
- Keep printed names (do not "correct" spelling).
- priceText should match the menu ("$16", "MP", "$17 / $18").
- description may be empty.
- Multi-photo / multi-page is ONE restaurant. Deduplicate obvious repeats.
- Include section notes (add-ons, "served with fries", raw-bar callouts).
- Do not invent items that are cut off or illegible.`;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function isolateJson(raw) {
  const trimmed = String(raw || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Extractor response was not JSON.");
  return candidate.slice(start, end + 1);
}

function parseExtractedMenu(raw, fallbackName) {
  const parsed = JSON.parse(isolateJson(raw));
  if (!Array.isArray(parsed.items)) throw new Error("Extractor returned no items array.");
  const items = parsed.items
    .map((item) => ({
      name: String(item.name || "").trim(),
      description: String(item.description || "").trim(),
      priceText: String(item.priceText || "").trim() || "MP",
      section: String(item.section || "Menu").trim() || "Menu",
    }))
    .filter((item) => item.name.length > 0);
  if (!items.length) throw new Error("Extractor returned zero named items.");
  const sectionOrder =
    Array.isArray(parsed.sectionOrder) && parsed.sectionOrder.length
      ? parsed.sectionOrder.map(String)
      : [...new Set(items.map((item) => item.section))];
  return {
    restaurantName: String(parsed.restaurantName || fallbackName).trim() || fallbackName,
    sectionOrder,
    sectionNotes: Array.isArray(parsed.sectionNotes)
      ? parsed.sectionNotes.map((note) => ({
          section: String(note.section || ""),
          note: String(note.note || ""),
        }))
      : [],
    items,
    sources: [],
    extractionNotes: [
      "UNVERIFIED: live vision extract. Review names, prices, and missing items against the photo.",
    ],
  };
}

async function handleExtract(request, env) {
  if (!env.ANTHROPIC_API_KEY) {
    return json(
      {
        error: "no_api_key",
        message:
          "Live extract needs ANTHROPIC_API_KEY. Load the Island Fish fixture or use a baked-in menu — no key required.",
        unverified: true,
      },
      501,
    );
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "bad_request", message: "Expected JSON body." }, 400);
  }

  const files = payload.files || [];
  if (!files.length) {
    return json({ error: "bad_request", message: "Attach at least one photo or PDF." }, 400);
  }

  const content = [{ type: "text", text: EXTRACT_PROMPT }];
  for (const file of files.slice(0, 8)) {
    if (file.mimeType === "application/pdf") {
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: file.base64 },
      });
    } else if (file.mimeType && file.mimeType.startsWith("image/")) {
      content.push({
        type: "image",
        source: { type: "base64", media_type: file.mimeType, data: file.base64 },
      });
    }
  }

  if (content.length === 1) {
    return json({ error: "bad_request", message: "Only image or PDF uploads are supported." }, 400);
  }

  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      messages: [{ role: "user", content }],
    }),
  });

  const result = await anthropicResponse.json();
  if (!anthropicResponse.ok) {
    return json(
      {
        error: "upstream",
        message: (result.error && result.error.message) || "Anthropic request failed.",
        unverified: true,
      },
      502,
    );
  }

  const text = (result.content || []).find((block) => block.type === "text");
  try {
    const menu = parseExtractedMenu(text && text.text, (payload.restaurantName || "").trim() || "Untitled restaurant");
    menu.sources = files.map((file) => ({ filename: file.filename, pageLabel: file.filename }));
    return json(menu);
  } catch (error) {
    return json(
      {
        error: "parse_failed",
        message: error instanceof Error ? error.message : "Could not parse extractor JSON.",
        unverified: true,
      },
      502,
    );
  }
}

export async function onRequestPost(context) {
  return handleExtract(context.request, { ANTHROPIC_API_KEY: context.env.ANTHROPIC_API_KEY });
}
