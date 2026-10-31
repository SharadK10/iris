# Iris visual revamp — design

Date: 2026-10-31 · Branch: `feature/iris-revamp` (cut from `master`)

Reference mockups (open in a browser):
- `2026-10-31-iris-revamp-mockup.html` — every screen in light and dark. **This is the approved target.**
- `2026-10-31-iris-revamp-logo-options.html` — logo options; **option B (Geometric)** was chosen.

**How to read the mockup:** it is the reference for *look and mood* only: palette, type, botanicals, shapes, motion, and where sunflower vs iris appear. It is **not** a reference for structure, controls or copy. Where it differs from today's app (e.g. a "Dear you," line instead of To/From fields, a "Pick a bloom" button instead of inline search, invented labels like "Now in Bloom", "picked by", "3 waiting", an echo name chip, missing conductor controls, Copy invite, Leave, move/remove buttons, the always-visible bouquet and sign-off when reading), **the current app wins**. Keep every existing element, control, step and string, and restyle it in the mockup's language. *(Builder-check clarification; follows from the owner putting UX changes out of scope.)*

## Intent

Iris is "a quiet shared listening space": Echo rooms for listening together live, and Letters as an async gift of songs. Today it has a warm stationery look (cream paper, iris violet, sunflower gold, hand-drawn botanicals) that feels pretty but static, a bit like a wedding invitation. The owner wants to change the look and feel without losing that soul, and to add a dark mode.

The new look blends three directions:
- **Light mode — "Pressed Flowers":** paper grain, herbarium-like botanicals, the current Bloom framed like a pressed specimen.
- **Dark mode — "Night Garden":** deep ink background, the Bloom's colours glowing softly behind the room, botanicals as moonlit silhouettes, a few fireflies.
- **"Soft Neon" playfulness, in both modes:** springy hover/press motion, drifting elements, soft rounded shapes. Only as motion and touches — never neon colours or a louder tone.

## Goals

1. Restyle **every screen**: Home, Echo room, Write a letter, Letter arrival (envelope + seal), Reading a letter, plus shared pieces (Shell/header, NameGate, Discover/search, Garden, Listeners, error/empty states).
2. Ship a **light and a dark mode** that both feel like the same Iris.
3. Introduce the new **logo** and use it consistently.
4. Keep everything **botanical** and keep the existing hand-drawn feel.

## Non-goals

- **No user-experience/flow changes.** Same screens, same steps, same features, same copy. Explicitly out of scope for this revamp.
- **No backend changes.**
- **Reactions are not changed**: same set (`🌻 🌸 💜 ❤️ 🔥 🥹` from `types.ts`), same small round buttons, same rise-with-nickname behaviour. They may pick up the new colour tokens so they fit both modes, nothing more.

## Anti-goals (would be a failure even if it "works")

- Losing the current hand-drawn botanical feel, or replacing it with generic/flat illustration.
- Geometric shapes anywhere except the logo.
- Sunflower used as branding.
- Letter copy or visuals drifting romantic — Letters must stay tone-neutral (friend, family, anyone).
- Breaking the botanical vocabulary (Echo, Bloom, Garden, Ripples, Conductor, Bouquet, Note, Pick, Seal & send).
- Dark mode that feels like a different app, or light mode that loses the warmth.

## Decided by the owner

### Branding = the iris only
- **Logo:** the geometric iris (option B): seen from above, three deep-violet falls (`#5a4ecf`), three lighter standards (`#a79cff`, slightly translucent), three gold beard bars and a gold centre (`#e8b23a`). It is the **only geometric element** in the product. Exact SVG is the `logo` symbol in the mockup file.
- Used for: header wordmark lockup ("Iris" in italic serif beside the mark), favicon, OG image.
- Other brand marks also use the iris, but drawn **botanically** (the head of the existing illustrated iris), not geometric:
  - the golden **wax seal** is stamped with the iris (the existing `WaxSeal` already embosses an iris — keep that idea, restyle to match),
  - the small mark beside **"Now in Bloom"**,
  - the **Pressed** badge, later (see the pressed-letters section below).

### Sunflower = canvas only
Sunflowers appear only as decoration in the canvas, never as a brand mark:
- the large illustrations (Home hero, background botanicals at screen edges),
- a sunflower tucked under the Bloom artwork in the Echo room (light mode),
- a sunflower tucked under the wax seal on the envelope,
- the progress bar's **playhead** (a small sunflower head that slowly turns, on a green "stem" bar with a couple of leaves).

### Everything else is botanical
- Reuse and extend the existing illustrations in `components/botanical/Iris.tsx` and `Sunflower.tsx` — same translucent fills, fine strokes, palette. New ornaments (leaf, small sprig, vine divider) follow the same drawing style.
- Bouquet numbers are plain gold italic serif numerals (not on flower heads — that was unreadable).
- Notes in Letters sit beside a small leaf, in italic serif.

### Per-screen look (see mockup)
- **Home:** illustrated iris and sunflower leaning toward each other above "Listen, together." (swaying slowly); primary "Create an Echo"; "Have a code?" divider with vine ornaments; code field + "Join an Echo"; a quiet card linking to "Write a letter".
- **Echo room:** Bloom artwork as a taped pressed specimen (light) / glowing gold-violet (dark); "Now in Bloom" kicker; stem progress bar with sunflower playhead; unchanged reactions; Garden and Listeners in soft cards with a sprig in the heading; Ripples in italic serif.
- **Write a letter:** a page of a letter, not a form — "Dear you," in large serif, dashed italic fields for opening words and notes, numbered bouquet, "— Your name" sign-off, "Seal & send".
- **Letter arrival:** "A letter has arrived." / "for {name}", envelope with iris-stamped gold seal that gently pulses, sunflower tucked beside it, "Open the letter".
- **Reading a letter:** "Dear {name}," and opening in serif, current bloom card with stem bar, its note beside a leaf, remaining bouquet with gold numerals, "— {sender}" and "sealed {date}" in italic serif.

### Visual system
- **Palette** (keep the brand colours, add dark equivalents):

  | Token | Light | Dark |
  |---|---|---|
  | background (`ground`) | `#f8f3e8` + paper grain + faint gold/violet washes | `#121019` + breathing gold/violet glow |
  | card | `rgba(255,253,248,.78)` + 1px line | `rgba(255,255,255,.045)` + 1px line, frosted |
  | ink | `#2b2722` | `#f0eadf` |
  | muted | `#8b8275` | `#a69db2` |
  | line | `#e2d8c4` | `rgba(255,255,255,.1)` |
  | accent (iris) | `#6d5ef8` (white text) | `#a79cff` (dark text) |
  | gold (kickers, numerals) | `#b07f17` | `#f3d68a` |
  | leaf | `#8c925a` | `#9aa066` |

- **Type:** Fraunces (serif, incl. italics) for anything poetic — wordmark, headings, song titles, letters, notes, Ripples, chips; Inter for UI text. This **replaces Cormorant Garamond**.
- **Shape:** pill buttons, ~18px card radius, 1px hairline borders, soft shadows in light / inner hairlines in dark.
- **Motion:** slow sway on illustrations, springy hover on buttons, breathing glow (dark), fireflies (dark), pulsing seal, turning playhead. All of it must respect `prefers-reduced-motion` (the codebase already does this for existing animations).

## Constraints

- Stack stays as is: React 18, TypeScript, Vite, Tailwind 3. No new UI framework.
- Colours go through CSS variables on `:root` and are already mapped into `tailwind.config.js` — dark mode should be a second set of values for the same tokens, so components don't need per-mode classes where avoidable.
- Mobile-first: the mockups are phone width; desktop should feel like the same room, not a stretched phone.
- Accessibility: text contrast must hold in both modes (WCAG AA); decorative SVGs stay `aria-hidden`. In light mode, `#b07f17` gold (~3.2:1) and `#8b8275` muted (~3.4:1) fail AA for small text on cream. **My call:** keep those values for decorative and large uses, and add darker text-only tokens (e.g. `gold-text`, `muted-text`) tuned just enough to pass AA for small text. Brand colours don't drift.
- "Geometric only in the logo" applies to brand marks and decoration. **My call:** functional UI keeps its normal shapes: play/pause/next/restart icons in `icons.tsx` (recoloured only), round reaction buttons, avatars, inputs.
- Copy stays exactly as it is today.

### Layout frame (owner decision)
- **Full-screen canvas:** drop today's framed paper card in `Shell.tsx`. The background, grain, glow, fireflies and edge botanicals fill the viewport, as in the mockups. The header is the logo mark plus the "Iris" wordmark.
- **Keep the "powered by liv2code" footer** as a quiet footer, legible in both modes. The current PNG may need a dark-mode treatment or variant.

## Relationship to `feature/pressed-letters` (owner decision: keep them separate)

The revamp is built from `master` as it is now, independent of `feature/pressed-letters` (pushed, not merged). That branch also changes `WriteLetter.tsx` (press-and-pay on the "Sealed." screen), `LetterPage.tsx`, `index.html` (OG/Twitter tags, `theme-color`), `public/favicon.svg`, and adds `public/og-image.png` and the Pressed badge.
- Don't build or style anything pressed-letters adds: no Pressed badge, no press-and-pay UI. The Pressed badge in the mockup is for later reference only.
- Build the new favicon and OG image and the meta tags (including light/dark `theme-color`) here from the logo, on `master`'s `index.html`.
- Whichever branch merges second resolves the conflicts in those files. The press flow and badge get styled in the new language at that point.

## Left to the builder

- How dark mode is switched on (system preference, a toggle, or both) and where any toggle lives.
- How to structure components/tokens, and whether the botanical ornaments become shared components.
- Exact sizes, spacing and breakpoints beyond what the mockup shows, and the desktop layout.
- Paper grain and glow implementation (CSS vs. SVG), as long as it's light on performance.
- Favicon and OG image production from the logo SVG.
- The order screens are restyled in.
