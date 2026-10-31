# Iris Visual Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every Iris screen into the botanical light ("Pressed Flowers") / dark ("Night Garden") look with the geometric iris logo, without changing any flow, control or copy.

**Architecture:** All colour goes through CSS variables in `src/index.css` stored as RGB channels, with a light set on `:root` and a dark set applied by system preference or an explicit `data-theme` on `<html>`. Tailwind maps the same token names, so components restyle once and work in both modes. Brand marks (logo, seal stamp, "In Bloom" mark) are iris-only components; sunflowers appear only as canvas decoration.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind 3. Adds Vitest + Testing Library (dev only).

**Spec:** `docs/superpowers/specs/2026-10-31-iris-revamp-design.md`. Visual target: `docs/superpowers/specs/2026-10-31-iris-revamp-mockup.html`. Logo SVG: the `logo` symbol in that file.

## Global Constraints

- The mockup sets the **look only**. Every existing element, control, step and string stays exactly as it is in the current app. Don't add or remove UI, and don't rename labels.
- Reactions unchanged: `REACTIONS` in `src/types.ts` (`🌻 🌸 💜 ❤️ 🔥 🥹`), same buttons, same rise-with-nickname. Token recolouring only.
- Geometric shapes only in the logo. Brand marks use the iris only. Sunflower appears only as canvas decoration (illustrations, edge botanicals, tucked flowers, progress playhead).
- Functional UI keeps normal shapes (icons in `icons.tsx`, round buttons, avatars, inputs), recoloured only.
- Fonts: Fraunces (serif, with italics) replaces Cormorant Garamond. Inter for UI text.
- Every new animation has a `prefers-reduced-motion: reduce` rule that stops it or shortens it to ≤0.5s.
- Decorative SVGs are `aria-hidden="true"`.
- Small text passes WCAG AA (≥4.5:1) in both modes. This is pinned by the contrast test in Task 1.
- Nothing from `feature/pressed-letters` (Pressed badge, press-and-pay, its OG tags) is built here.
- No new runtime dependencies.
- **Visual check (used by several tasks):** run the backend locally per `README.md` and `npm run dev` in `frontend/`. Then screenshot a route in both modes at phone size:
  ```bash
  CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  for s in 1 0; do "$CH" --headless=new --hide-scrollbars --window-size=390,844 --virtual-time-budget=3000 \
    --blink-settings=preferredColorScheme=$s --screenshot=/tmp/iris-$s.png "http://localhost:5173$ROUTE"; done
  ```
  (`1` = light, `0` = dark.) Compare against the matching screen in the mockup file.

## Review Focus

1. **Theme persistence and first paint:** someone who chose dark should see no light flash on reload. Pinned by the `index.html` pre-paint script (Task 2) and `theme.test.ts`.
2. **Copy or controls lost while restyling:** every screen keeps its existing strings and buttons. Pinned by the copy-preservation tests in Tasks 5–8.
3. **Opacity utilities break after the token change** (`bg-sunflower-soft/30`, `border-line/70`, `bg-ground/85`): they must still render. Pinned by the `rgb(var(--x) / <alpha-value>)` mapping and a check in `tokens.test.ts` (Task 1).
4. **Inline `var(--paper)` style usages** in `Envelope.tsx` and `BloomBurst.tsx` break once tokens become channels. Pinned by `tokens.test.ts`, which fails if any `.tsx` uses a bare `var(--token)` outside `rgb(...)`.
5. **The liv2code footer logo vanishes in dark mode** (dark PNG on dark ground). Pinned by the Shell test asserting the footer image has the `footer-logo` class, plus its dark-mode CSS rule (Task 4).

---

### Task 1: Test harness and theme tokens

**Files:**
- Modify: `frontend/package.json` (dev deps and a `test` script)
- Create: `frontend/vitest.config.ts`, `frontend/src/test/setup.ts`
- Modify: `frontend/src/index.css` (`:root` tokens + dark sets)
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/index.html` (font link)
- Modify: `frontend/src/components/Envelope.tsx`, `frontend/src/components/BloomBurst.tsx` (inline `var()` usages)
- Modify: the 7 `text-iris` usages (`grep -rn "text-iris\b" src`) to `text-iris-text`
- Test: `frontend/src/theme/tokens.test.ts`

**Interfaces:**
- Produces Tailwind colours: `ground`, `paper`, `paper-dark`, `ink`, `muted` (AA text), `muted-soft` (decorative), `line`, `iris`, `iris-soft`, `iris-text`, `on-iris`, `sunflower`, `sunflower-soft`, `gold` (AA text: kickers and numerals), `leaf`. All support `/<alpha>`.
- Produces `fontFamily.serif = ['Fraunces', 'Georgia', 'serif']`.
- CSS selectors later tasks rely on: light = `:root`; dark = `:root[data-theme='dark']` and `@media (prefers-color-scheme: dark) { :root:not([data-theme='light']) }`.

- [ ] **Step 1: Add dev deps and the script.** Add `vitest@2.1.8`, `@testing-library/react@16.1.0`, `@testing-library/jest-dom@6.6.3`, `jsdom@25.0.1`, and `"test": "vitest run"`. Vitest config: `environment: 'jsdom'`, `setupFiles: ['src/test/setup.ts']` (which imports `@testing-library/jest-dom/vitest`). Run `npm install`.

- [ ] **Step 2: Write the failing test `src/theme/tokens.test.ts`.** It reads `src/index.css` with `fs`, extracts the light block (`:root {`) and the explicit dark block (`:root[data-theme='dark'] {`), parses `--name: R G B;` triplets, and asserts:
  ```ts
  // WCAG contrast ≥ 4.5 in BOTH modes:
  const pairs = [['ink','ground'],['muted-text','ground'],['muted-text','paper'],['gold-text','ground'],['gold-text','paper'],['iris-text','ground'],['on-iris','iris']]
  // the @media dark block declares exactly the same variable set as the [data-theme='dark'] block
  // tailwind.config.js colours use `rgb(var(--…) / <alpha-value>)`
  // no file under src/**/*.tsx contains /var\(--[a-z-]+\)/ unless wrapped as rgb(var(--…))
  ```

- [ ] **Step 3: Run it and confirm it fails.** Run `npm test -- tokens`. Expected: FAIL (the tokens are hex and the dark blocks are missing).

- [ ] **Step 4: Implement the tokens.** Values (light → dark), as RGB channels:
  | var | light | dark |
  |---|---|---|
  | `--ground` | `248 243 232` | `18 16 25` |
  | `--paper` | `255 253 248` | `29 25 40` |
  | `--paper-dark` | `244 238 226` | `38 33 52` |
  | `--ink` | `43 39 34` | `240 234 223` |
  | `--muted` (decorative) | `139 130 117` | `166 157 178` |
  | `--muted-text` | `111 103 92` | `166 157 178` |
  | `--line` | `226 216 196` | `41 39 48` |
  | `--iris` | `109 94 248` | `167 156 255` |
  | `--iris-soft` | `167 156 255` | `196 188 255` |
  | `--iris-text` | `91 76 230` | `167 156 255` |
  | `--on-iris` | `255 255 255` | `23 19 31` |
  | `--sunflower` | `224 169 46` | `224 169 46` |
  | `--sunflower-soft` | `243 214 138` | `243 214 138` |
  | `--gold-text` | `138 98 16` | `243 214 138` |
  | `--leaf` | `140 146 90` | `154 160 102` |

  Tailwind: `muted` → `--muted-text`, `muted-soft` → `--muted`, `gold` → `--gold-text`. Set `color-scheme: light` / `dark` in the matching blocks. Swap the Google Fonts link to `Fraunces:ital,opsz,wght@0,9..144,300..600;1,9..144,300..500` + Inter. Convert the inline `var(--x)` in Envelope/BloomBurst to `rgb(var(--x))`, and the `text-iris` usages to `text-iris-text`.

- [ ] **Step 5: Run the tests and the build.** Run `npm test && npm run build`. Expected: PASS, and the build succeeds.

- [ ] **Step 6: Visual check** of `/` in both modes (Global Constraints). Light should look like today with the new serif; dark should be readable, even if not yet styled.

- [ ] **Step 7: Commit:** `git commit -m "Adding light/dark theme tokens and test harness"`

---

### Task 2: Theme mode (system default + toggle)

**Files:**
- Create: `frontend/src/theme/theme.ts`, `frontend/src/theme/useTheme.ts`, `frontend/src/components/ThemeToggle.tsx`
- Modify: `frontend/index.html` (pre-paint script, two `theme-color` metas)
- Test: `frontend/src/theme/theme.test.ts`, `frontend/src/components/ThemeToggle.test.tsx`

**Interfaces:**
- `type ThemeChoice = 'light' | 'dark' | 'system'`
- `const THEME_KEY = 'iris-theme'`
- `readChoice(): ThemeChoice`. Reads localStorage and returns `'system'` when the value is missing or invalid, or when storage throws.
- `writeChoice(choice: ThemeChoice): void`. `'system'` removes the key; it never throws.
- `resolveTheme(choice: ThemeChoice, prefersDark: boolean): 'light' | 'dark'`
- `applyChoice(choice: ThemeChoice): void`. Sets `document.documentElement.dataset.theme` for light or dark, and deletes it for system.
- `useTheme(): { resolved: 'light' | 'dark'; toggle: () => void }`. `toggle` flips to the opposite of `resolved`, then writes and applies it. It follows `matchMedia('(prefers-color-scheme: dark)')` changes while the choice is `'system'`.
- `<ThemeToggle />`: a button with `aria-label` "Switch to dark mode" or "Switch to light mode". Shows a moon or sun glyph (functional icon, normal shape).

- [ ] **Step 1: Write the failing tests.**
  - `readChoice` returns `'system'` for a missing value, for `'blue'`, and when `localStorage.getItem` throws.
  - `writeChoice('dark')` stores `'dark'`; `writeChoice('system')` removes the key; neither throws when `setItem` throws.
  - `resolveTheme('system', true) === 'dark'`; `resolveTheme('light', true) === 'light'`.
  - `applyChoice('dark')` sets `data-theme="dark"`; `applyChoice('system')` removes it.
  - ThemeToggle with `matchMedia` mocked to light: shows "Switch to dark mode". After a click, `<html data-theme="dark">` is set, `localStorage['iris-theme'] === 'dark'`, and the label becomes "Switch to light mode".
- [ ] **Step 2: Run them and confirm they fail.** Run `npm test -- theme ThemeToggle`. Expected: FAIL (modules missing).
- [ ] **Step 3: Implement** `theme.ts`, `useTheme.ts` and `ThemeToggle.tsx`. In `index.html`, add an inline `<script>` in `<head>`, before CSS, that applies the stored choice inside try/catch (the same logic as `applyChoice`, inlined so there is no flash). Add `<meta name="theme-color" content="#f8f3e8" media="(prefers-color-scheme: light)">` and the dark equivalent `#121019`.
- [ ] **Step 4: Run the tests.** Run `npm test`. Expected: PASS.
- [ ] **Step 5: Commit:** `git commit -m "Adding theme mode with system default and toggle"`

---

### Task 3: Brand marks and botanical ornaments

**Files:**
- Create: `frontend/src/components/brand/Logo.tsx`
- Modify: `frontend/src/components/botanical/Iris.tsx` (export `FALL`, `STANDARD`, `VEIN` path constants)
- Create: `frontend/src/components/botanical/IrisHead.tsx`, `SunflowerHead.tsx`, `Leaf.tsx`, `Sprig.tsx`, `Vine.tsx`
- Modify: `frontend/public/favicon.svg` (the geometric logo)
- Create: `frontend/public/og-image.png` (1200×630, logo + "Iris" + "Listen, together." on the light ground)
- Modify: `frontend/index.html` (OG/Twitter meta: title "Iris — Listen, together.", image `/og-image.png`)
- Test: `frontend/src/components/brand/marks.test.tsx`

**Interfaces:**
- `Logo({ className?: string; title?: string })`: an `<svg role="img" aria-label={title ?? 'Iris'}>` of the geometric iris (exact geometry and colours from the mockup's `logo` symbol: falls `#5a4ecf`, standards `#a79cff` at 0.92 opacity, beards and centre `#e8b23a`). Fixed colours, the same in both modes.
- `IrisHead({ className?: string; variant?: 'color' | 'stamp' })`: the head of the botanical iris, built from the exported Iris paths. `'stamp'` is a single dark-gold fill for the wax seal. `aria-hidden`.
- `SunflowerHead({ className?: string })`: the head of the botanical Sunflower (same petal and stipple maths as `Sunflower.tsx`). `aria-hidden`.
- `Leaf`, `Sprig`, `Vine` (each `{ className?: string }`): small ornaments in the same stroke and fill style as the botanical files, using `rgb(var(--leaf))` for strokes. `aria-hidden`.

- [ ] **Step 1: Write the failing test.** `Logo` renders `getByRole('img', { name: 'Iris' })`. `IrisHead`, `SunflowerHead`, `Leaf`, `Sprig` and `Vine` each render an `svg` with `aria-hidden="true"`. `IrisHead variant="stamp"` contains no `#a79cff`/`#8b7bff` fills.
- [ ] **Step 2: Run it and confirm it fails.** Run `npm test -- marks`. Expected: FAIL.
- [ ] **Step 3: Implement the components.** Write `favicon.svg` from the same geometry. Produce `og-image.png` by rendering a one-off HTML file with headless Chrome at `--window-size=1200,630` (don't commit the HTML). Add the meta tags.
- [ ] **Step 4: Run the tests and the build.** Run `npm test && npm run build`. Expected: PASS.
- [ ] **Step 5: Commit:** `git commit -m "Adding iris logo, brand marks and botanical ornaments"`

---

### Task 4: Full-screen canvas Shell and header

**Files:**
- Modify: `frontend/src/components/Shell.tsx`
- Create: `frontend/src/components/SiteHeader.tsx`, `frontend/src/components/Canvas.tsx`
- Modify: `frontend/src/index.css` (grain, glow, firefly, sway keyframes plus reduced-motion rules; `.footer-logo` dark rule)
- Modify: `frontend/src/pages/EchoPage.tsx:141-143`, `LetterPage.tsx:147-152`, `WriteLetter.tsx:78-83` and the `Sealed` view's "Iris" link at `WriteLetter.tsx:~249`: remove the per-page centred "Iris" links (the header replaces them)
- Test: `frontend/src/components/Shell.test.tsx`

**Interfaces:**
- `SiteHeader()`: a left-aligned `<Link to="/">` holding `<Logo className="h-6 w-6" />` + "Iris" (italic serif, accessible name "Iris"), with `<ThemeToggle />` on the right. On route `/`, the link is not rendered (Home's own `h1` is the brand); the toggle still is.
- `Canvas()`: an `aria-hidden` fixed decoration layer behind content. Light: paper grain plus faint gold/violet washes. Dark: breathing gold/violet glow and 3–4 fireflies. Both: the botanical `Sunflower` and `Iris` at the screen edges, swaying slowly (lower opacity in dark).
- Shell: a full-viewport `bg-ground` with `<Canvas />`, `<SiteHeader />`, content in a centred column (`max-w-canvas`, the existing 820px), and the existing liv2code footer. Its `<img>` gets `className` including `footer-logo`; in dark mode, `.footer-logo` gets a filter that keeps it legible (e.g. `brightness(0) invert(.85)`).

- [ ] **Step 1: Write the failing tests** (render in `MemoryRouter`):
  - At `/write`: `getByRole('link', { name: 'Iris' })` has `href="/"`, and a "Switch to … mode" button exists.
  - At `/`: there is no link named "Iris", but the toggle exists.
  - Footer: `getByAltText('liv2code')` has class `footer-logo`, and the text "powered by" is present.
- [ ] **Step 2: Run them and confirm they fail.** Run `npm test -- Shell`. Expected: FAIL.
- [ ] **Step 3: Implement it.** Remove the framed card (border, rounded canvas, paper bg) from Shell. Remove the per-page "Iris" links listed above, and change nothing else on those pages.
- [ ] **Step 4: Run the tests and the build.** Run `npm test && npm run build`. Expected: PASS.
- [ ] **Step 5: Visual check** of `/write` in both modes against the mockup's backgrounds (grain and washes in light; glow and fireflies in dark; edge botanicals in both).
- [ ] **Step 6: Commit:** `git commit -m "Making the shell a full-screen botanical canvas with header"`

---

### Task 5: Shared UI styles and Home

**Files:**
- Modify: `frontend/src/index.css` (`@layer components`)
- Modify: `frontend/src/pages/Home.tsx`, `frontend/src/components/NameGate.tsx`
- Test: `frontend/src/pages/Home.test.tsx`

**Interfaces:**
- CSS component classes used by Tasks 5–8:
  - `.btn-primary`: pill, `bg-iris text-on-iris`, soft iris shadow, springy hover lift (`cubic-bezier(.34,1.56,.64,1)`)
  - `.btn-ghost`: pill, transparent, 1px `line` border
  - `.field`: 14px radius, 1px `line` border, `paper` bg
  - `.field-note`: dashed border, transparent bg, italic serif
  - `.card`: ~18px radius, 1px `line` border, translucent `paper` bg, `backdrop-filter: blur(8px)`
  - `.kicker`: 11px uppercase, `.16em` tracking, semibold, `text-gold`
  - `.chip`: pill, 1px `line` border, italic serif, `text-muted`
  - `.vine-divider`: flex row with `<Vine>` on both sides of centred italic-serif text, or alone as a rule

- [ ] **Step 1: Write the failing test.** Home renders, unchanged: the heading "Iris", "Listen, together.", buttons "Create an Echo" and "Join an Echo", the placeholder "Enter code", "Have a code?", "Not here to listen together?", the button "Write a letter", "A bouquet of songs, sealed and sent to someone.", and "Different souls, same soundtrack.". It also renders `getByRole('img', { name: 'Iris' })` (the logo above the h1). "Create an Echo" has class `btn-primary`.
- [ ] **Step 2: Run it and confirm it fails.** Run `npm test -- Home`. Expected: FAIL (no logo, no class).
- [ ] **Step 3: Implement it.** Add the component classes. Restyle Home with the same elements and order:
  - a large `<Logo>` above the "Iris" h1, gently swaying
  - an illustrated `Iris` and `Sunflower` leaning together near the hero (decorative, `aria-hidden`)
  - "Have a code?" rendered as a `.vine-divider`
  - the "Write a letter" block as a `.card`
  - error text in `text-gold`
  
  NameGate gets the same treatment (logo above its "Iris" h1, `.field`, `.btn-primary`).
- [ ] **Step 4: Run the tests.** Run `npm test`. Expected: PASS.
- [ ] **Step 5: Visual check** of `/` in both modes against the mockup's Home.
- [ ] **Step 6: Commit:** `git commit -m "Restyling Home and NameGate in the botanical look"`

---

### Task 6: Echo room

**Files:**
- Modify: `frontend/src/pages/EchoPage.tsx` (header block, ripple, `Divider`)
- Modify: `frontend/src/components/Bloom.tsx`, `Discover.tsx`, `Garden.tsx`, `Listeners.tsx`, `SectionTitle.tsx`, `icons.tsx` (colour only)
- Modify: `frontend/src/index.css` (`.stem-range` styles for the progress `<input type="range">`)
- Test: `frontend/src/components/Bloom.test.tsx`

**Interfaces:**
- Consumes: `IrisHead`, `SunflowerHead`, `Sprig`, `Vine`, `Sunflower` and the Task 5 classes.
- `.stem-range`: track is a 2px `leaf`-coloured line (played part) on `line`. The thumb is a ~22px sunflower head (inline SVG data URI in the CSS) that slowly rotates (CSS animation, disabled under reduced motion). Styled for both `::-webkit-slider-thumb` and `::-moz-range-thumb`.

- [ ] **Step 1: Write the failing test** (mock `./YouTubePlayer` with `vi.mock`). Render `Bloom` with a sample bloom, `isConductor` true, and `reactions=[]`:
  - It shows exactly 6 reaction buttons, labelled `React 🌻`, `React 🌸`, `React 💜`, `React ❤️`, `React 🔥`, `React 🥹`, in that order.
  - Buttons "Restart", "Play" and "Next" are present.
  - The range input has class `stem-range`.
  - With `isConductor` false, "Following the Gardener" is shown.
  - The heading "In Bloom" is still rendered.
- [ ] **Step 2: Run it and confirm it fails.** Run `npm test -- Bloom`. Expected: FAIL (no `stem-range`).
- [ ] **Step 3: Implement it.** Keep the same markup and order everywhere.
  - **EchoPage header:** "Echo {code}" as a `.chip`. The listener count, Copy invite, nickname and Leave stay, recoloured.
  - **Ripple:** italic serif.
  - **`Divider`:** becomes a `Vine` rule.
  - **Bloom:**
    - the "In Bloom" `SectionTitle` gets an `IrisHead` beside it in `.kicker` style
    - the existing thumbnail is framed as a pressed specimen in light (paper mat, slight tilt, a small `Sunflower` tucked at one corner) and glows gold/violet in dark
    - the range uses `.stem-range`
    - the controls are recoloured
    - reactions keep their exact markup and only pick up tokens
  - **Discover, Garden, Listeners:** `.card` surfaces with a `Sprig` beside their section titles.
- [ ] **Step 4: Run the tests.** Run `npm test`. Expected: PASS.
- [ ] **Step 5: Visual check** of `/echo/{code}` in both modes (create an echo from Home first), against the mockup's Echo room.
- [ ] **Step 6: Commit:** `git commit -m "Restyling the Echo room"`

---

### Task 7: Write a letter

**Files:**
- Modify: `frontend/src/pages/WriteLetter.tsx` (including the `Sealed` view)
- Test: `frontend/src/pages/WriteLetter.test.tsx`

**Interfaces:**
- Consumes: `Leaf`, `Vine`, `Sunflower` (canvas), the Task 5 classes.

- [ ] **Step 1: Write the failing test.** Render WriteLetter in `MemoryRouter`:
  - Present: the heading "Write a letter", the subtitle "A bouquet of songs, sealed and sent to someone.", the placeholders "Dear…", "Yours…" and "Write something to open with…", "No blooms picked yet.", the counter "0/30 blooms" (from `MAX_BLOOMS`), and the "Seal & send" and "Never mind" controls.
  - "Seal & send" has class `btn-primary`.
  - After adding a bloom via a mocked `Discover` `onAdd`: the "Move up", "Move down" and "Remove" buttons appear, along with "Leave a note (optional)…" as a `.field-note`, and the bouquet number renders with class `text-gold`.
- [ ] **Step 2: Run it and confirm it fails.** Run `npm test -- WriteLetter`. Expected: FAIL.
- [ ] **Step 3: Implement it.** Same structure: the page reads as a letter on a `.card`. To/From use large serif `.field` styling, opening and notes use `.field-note` with a `Leaf` beside each note, and bouquet numbers are gold italic serif numerals. The "The bouquet" heading is a `.kicker` followed by a `Vine`. The Sealed view's "Sealed." and share-link block is restyled (`.card`, `.btn-primary` for "Copy link").
- [ ] **Step 4: Run the tests.** Run `npm test`. Expected: PASS.
- [ ] **Step 5: Visual check** of `/write` with two blooms added, in both modes.
- [ ] **Step 6: Commit:** `git commit -m "Restyling Write a letter"`

---

### Task 8: Letter arrival and reading

**Files:**
- Modify: `frontend/src/components/Envelope.tsx`, `WaxSeal.tsx`, `LetterPlayer.tsx`
- Modify: `frontend/src/pages/LetterPage.tsx`
- Modify: `frontend/src/index.css` (seal pulse keyframe + reduced motion)
- Test: `frontend/src/pages/LetterPage.test.tsx`

**Interfaces:**
- Consumes: `IrisHead` (`variant="stamp"`), `SunflowerHead`/`Sunflower`, `Leaf`, the Task 5 classes.
- `WaxSeal({ className?: string })`: same signature. The embossed motif becomes `IrisHead variant="stamp"`; it keeps the gold wax look and adds a gentle pulse.

- [ ] **Step 1: Write the failing test.** Mock `api.getLetter` (sealed letter) and the YouTube player.
  - Sealed state: "A letter has arrived.", the button "Open the letter", and "Once opened, it can’t be sealed again." are present. The seal contains an svg with `data-mark="iris-stamp"`, and no element with `data-mark="sunflower-head"` is inside the seal.
  - With a mocked opened letter (reading state): "1 of {N}" renders with class `text-gold`, the current note renders with a `Leaf` beside it, and after the last bloom ends, "sealed {date}" still renders in the existing format.
  - Not-found state: "This letter has drifted away." and "The link may be wrong, or the letter has faded." are present.
- [ ] **Step 2: Run it and confirm it fails.** Run `npm test -- LetterPage`. Expected: FAIL.
- [ ] **Step 3: Implement it.** `IrisHead` sets `data-mark="iris-stamp"` for the stamp variant, and `SunflowerHead` sets `data-mark="sunflower-head"`.
  - **Envelope:** gets a dark variant via tokens and keeps its corner watermarks. A small `Sunflower` is tucked beside the seal.
  - **Reading view:** keeps its structure. The greeting and opening are in serif, the current bloom sits on a `.card`, its note is italic serif beside a `Leaf`, and the sign-off and date use italic serif.
  - **BloomBurst:** unchanged except tokens.
- [ ] **Step 4: Run the tests.** Run `npm test`. Expected: PASS.
- [ ] **Step 5: Visual check** of `/letter/{id}`: sealed, opening and reading, in both modes. Create a letter via `/write` first.
- [ ] **Step 6: Commit:** `git commit -m "Restyling letter arrival and reading"`

---

### Task 9: Whole-app pass

**Files:**
- Modify: anything the checks below flag (styles only)

- [ ] **Step 1: Run the full suite and the build.** Run `npm test && npm run build`. Expected: all PASS, no TypeScript errors.
- [ ] **Step 2: Check reduced motion.** Grep `index.css` for every `@keyframes` name and confirm each has a reduced-motion rule. Run `grep -c "@keyframes" src/index.css` and compare against the animation names that appear inside `prefers-reduced-motion` blocks.
- [ ] **Step 3: Leftover check.** `grep -rn "Cormorant\|rounded-canvas border border-line bg-paper" src index.html` returns nothing. `grep -rn "Sunflower\|SunflowerHead" src/components/brand` returns nothing (no sunflower in brand marks).
- [ ] **Step 4: Desktop check.** Screenshot `/`, `/write`, an Echo and a Letter at `--window-size=1280,900` in both modes. The content column is centred, the canvas decoration fills the viewport, and nothing looks like a stretched phone.
- [ ] **Step 5: Commit any fixes:** `git commit -m "Polishing the revamp across screens"`
