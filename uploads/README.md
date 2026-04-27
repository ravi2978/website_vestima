# Vestima Design Tokens

## What's in this package

| File | Load Order | Purpose |
|---|---|---|
| `Vestima_UI_Collection.tokens.json` | 1 — Base | Raw primitives: color palettes, font families, font weights, spacing scale |
| `Alias.tokens.json` | 2 — Alias | Maps primitives to semantic role names (Primary, Secondary, Alert, etc.) |
| `Mapped_Dark.tokens.json` | 3 — Semantic | Final tokens for **dark mode UI** (Text, Icon, Surface) |
| `Mapped_Light.tokens.json` | 3 — Semantic | Final tokens for **light mode UI** (Text, Icon, Surface) |
| `Responsive.tokens.json` | 4 — Typography | Full type scale: headings h1–h6, paragraph sizes with font-family, weight, line-height |

---

## Load order

Always load in this sequence — each layer depends on the one before it:

```
Vestima UI Collection  →  Alias  →  Mapped (Dark or Light)  →  Responsive
```

Loading out of order will produce unresolved `$ref` values.

---

## Dark mode vs Light mode

Use **`Mapped_Dark.tokens.json`** when building a dark UI.  
Use **`Mapped_Light.tokens.json`** when building a light UI.

Both files have identical token names (`Text.Heading`, `Surface.Page`, etc.) but different hex values. Never load both at once — pick one based on the target mode.

```
Dark mode:   Surface.Page = #132B3C  (deep navy)
Light mode:  Surface.Page = #FFFFFF  (white)
```

---

## Token format

All tokens use the **W3C Design Token Community Group (DTCG)** format:

```json
"Heading": {
  "$type": "color",
  "$value": "#FFFFFF",
  "$ref": "Secondary.100"
}
```

- `$type` — the token type (`color`, `number`, `string`)
- `$value` — the **resolved hex value** — use this directly in code
- `$ref` — the source token this value comes from (for traceability, not required at runtime)

**For colors: always use `$value` directly.** It is already a plain hex string — no parsing needed.

---

## Token categories

### Colors (Vestima UI Collection)
Six palettes, each with 8 stops (100–800):

| Palette | Usage |
|---|---|
| `Color.Vestima Blue` | Primary brand color |
| `Color.Vestima White` | Light surfaces and text |
| `Color.Vestima Grey` | Neutral, disabled states |
| `Color.Warning Yellow` | Warning states |
| `Color.Alert Red` | Error and alert states |
| `Color.Success Green` | Success states |

### Alias roles
Semantic wrappers around the palettes above:

`Primary` → Vestima Blue  
`Secondary` → Vestima White  
`Tertiary` → Vestima Grey  
`Alert` → Alert Red  
`Warning` → Warning Yellow  
`Success` → Success Green  

Each role exposes stops `100–800` plus a `Default` (the mid-range value).

### Border & Corner Radius (in Alias)
Two sets — use `Corner Radius` for UI components:

| Token | Value |
|---|---|
| `Corner Radius.XXS` | 2px |
| `Corner Radius.Extra Small` | 4px |
| `Corner Radius.Small` | 8px |
| `Corner Radius.Medium` | 12px |
| `Corner Radius.Large` | 20px |
| `Corner Radius.Extra Large` | 32px |

### Typography (Responsive)
Each heading and paragraph size includes `font-size`, `font-family`, `font-weight`, and `line-height`:

| Token | Font size | Family | Weight |
|---|---|---|---|
| `Heading.h1` | 60px | Inter Tight | SemiBold |
| `Heading.h2` | 48px | Inter Tight | SemiBold |
| `Heading.h3` | 40px | Inter Tight | SemiBold |
| `Heading.h4` | 32px | Inter Tight | Medium |
| `Heading.h5` | 24px | Inter Tight | Medium |
| `Heading.h6` | 20px | Inter Tight | Medium |
| `Paragraph.Large` | 16px | DM Sans | Regular |
| `Paragraph.Medium` | 12px | DM Sans | Regular |
| `Paragraph.Small` | 8px | DM Sans | Regular |
| `Paragraph.Extra Small` | 4px | DM Sans | Regular |

---

## Using with Cursor / AI coding agents

When providing these files to Cursor or another AI agent:

1. **Provide files in load order** — share `Vestima_UI_Collection` and `Alias` as background context, then the relevant `Mapped_` file for the mode you're building.
2. **Specify the mode upfront** — tell the agent "use dark mode tokens" or "use light mode tokens" so it picks the right Mapped file.
3. **`$value` is the hex** — all color values are plain hex strings, ready to use as CSS custom properties or Tailwind config values.
4. **`$ref` is for traceability only** — the agent does not need to resolve references; every token is already a flat resolved value.

### Example: generating CSS custom properties

Ask Cursor:
> "Convert `Mapped_Dark.tokens.json` into CSS custom properties under a `.dark` selector, and `Mapped_Light.tokens.json` under a `.light` selector. Use the `$value` field directly."

Expected output:
```css
.dark {
  --text-heading: #FFFFFF;
  --text-body: #FFFFFF;
  --surface-page: #132B3C;
  /* … */
}

.light {
  --text-heading: #132B3C;
  --text-body: #132B3C;
  --surface-page: #FFFFFF;
  /* … */
}
```

### Example: applying typography

Ask Cursor:
> "Use `Responsive.tokens.json` to create a typography utility class for each heading level."

---

## Known design decisions

- **`Alert Red.400` and `.500` share the same hex** (`#CC3F3D`) — this is intentional from the original Figma source.
- **Heading font** is Inter Tight; **body font** is DM Sans. Make sure both are loaded before applying the type tokens.
- The original Figma export had a typo — `Cornor Radius` — this has been corrected to `Corner Radius` in these cleaned files.
