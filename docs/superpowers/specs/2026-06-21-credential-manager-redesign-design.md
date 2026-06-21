# Credential Manager Redesign — Design

**Date:** 2026-06-21
**Status:** Approved
**Source:** Claude Design handoff — `docs/card-based-react-design/project/Credential Manager.dc.html`

## Problem

A Claude Design comp specifies a new "Vault / Credentials" look for the
`authorize-me` app: a dark theme with a gold accent, a card grid, per-service
avatars, a password-strength meter, a refined dropdown menu, a styled add modal,
and a fixed bottom action bar. The current UI is functional but visually plain.
Goal: recreate the comp **pixel-perfectly** in the existing React app.

## Approach

**Restyle the existing components in place.** Keep the current architecture —
`AppContext`, `useModifyCred`, `useSearch`, `useToastNotification`, and the
encryption/lock screen shipped earlier. No data migration. The prototype's
inline styles become real CSS classes/variables; component structure is adapted
to the comp where it differs.

## Key Decisions

| Decision | Choice |
|----------|--------|
| Implementation | Restyle existing components; keep Context + hooks + encryption |
| Card menu | **Edit + Delete** (no "Copy password" item — copy is the inline row icon) |
| Add/Edit form | Website, Username, Password, Notes. URL derived from site when blank. **No tags input** (existing tag data left untouched in storage) |
| Lock screen | Restyle to match the dark/gold theme |
| Per-item `color`/`updated` | **Derived**, not stored (no migration) |
| Global `revealAll` / configurable `accentColor` / `showStrength` props | Out of scope (YAGNI) — hardcode accent, always-on strength, per-card reveal |

## Theme & Fonts

- Add Google Fonts to `public/index.html`: Manrope (400–800) and JetBrains Mono (400,500).
- Theme tokens as CSS variables in `src/Styles/Styles.css`:
  - `--bg: #14151a`, `--card: #1c1e26`, `--accent: #E3B23C`, `--text: #ECECEE`,
    `--muted: #6B6E78`, `--card-border: rgba(255,255,255,0.06)`.
  - Card values (username/password) use JetBrains Mono; everything else Manrope.
- Exact colors/spacing/radii are taken from the comp (cards: `#1c1e26`,
  16px radius, 18px padding, 16px grid gap, `auto-fill minmax(312px,1fr)`).

## Component Mapping (existing → comp region)

- **`Pages/Home.js`** — page shell: header (`VAULT` eyebrow / **Credentials** title /
  "{count} of {total} items"), scrollable card grid, empty-search state, fixed
  bottom bar. Renders `searchResults` (already wired via `useSearch`).
- **`Components/Card/Card.js`** — avatar + site/url header, kebab→dropdown,
  username row, password row, optional notes, strength meter + "updated".
- **`Components/Card/Username.js`** — restyled label+boxed-value row with inline
  copy (used for the username row; keeps copy-to-clipboard via `useToastNotification`).
- **`Components/Card/PasswordField.js`** — restyled password row: masked mono
  value, reveal toggle (eye), inline copy. Per-card reveal state stays local.
- **`Components/Card/Notes.js`** — restyled optional note block (rendered only
  when notes present). Tags no longer displayed.
- **New `Components/Card/Avatar.js`** — square initial badge (color + tinted bg).
- **New `Components/Card/StrengthMeter.js`** — bar + label + "updated" timestamp row.
- **`Components/Card/CardMenu.js` / `Components/Menu.js` / `Components/MenuItem.js`** —
  styled dropdown: Edit (default) + Delete (red), with icons; outside-click closes.
- **`Components/Search.js`** — search input with leading icon, dark styling.
- **`Pages/AddItem.js`** — gold "+ Add" button.
- **`Pages/Settings.js`** — 48×48 gear button opening the settings modal.
- **`Components/Modal.js`** — dark, blurred-backdrop modal shell (Add + Settings).
- **`Pages/AddItemForm.js`** — "New credential" / "Edit credential" form with the
  four fields; derives URL; calls `useModifyCred.editCred`. Edit prefills from the item.
- **`Components/Toast.js`** — bottom-center dark pill.
- **`Pages/Options.js`** — Export / Import / Delete settings list, restyled.
- **`Components/LockScreen.js`** — dark/gold restyle (matches vault view).

## Derived Display Helpers (new `src/Utilities/display.js`)

Pure, React-free, unit-testable:

- `avatarColor(name)` → hex from a fixed palette via a deterministic hash of the
  service name (stable per service across reloads). Palette from the comp:
  `['#4285F4','#1DB954','#E01E5A','#A259FF','#FF9900','#3FA9F5']`.
- `hexToRgba(hex, a)` → tinted avatar background (`alpha 0.16`).
- `passwordStrength(pw)` → `{ label, color, pct }` from a 0–4 score
  (length≥8, mixed case, digit, symbol). Mapping per comp:
  ≤1 Weak `#E5675F` 25%, 2 Fair `#E0A93C` 55%, 3 Good `#3FA9F5` 80%, 4 Strong `#4FB477` 100%.
- `maskPassword(pw)` → `'•' * clamp(pw.length, 6, 14)`.
- `relativeTime(iso)` → "Just now" / "N minutes/hours/days ago" / "N weeks ago" /
  "N months ago"; returns `""` for missing/invalid dates (old mock entries that
  have no `createdOn`/`updateOn`).

`item.initial` is `(service[0] || '?').toUpperCase()` computed in `Card`.

## Data Flow (unchanged)

`App → Context → VaultGate → (LockScreen | Home)`. Credentials still live in
`AppContext`, are searched via `useSearch`, mutated via `useModifyCred`
(`editCred`, `deleteItem`), and persisted encrypted. The redesign only changes
presentation and the add/edit form fields. `editCred` already stamps
`createdOn`/`updateOn`, which feeds `relativeTime`.

## Add/Edit Form Behavior

- Fields: Website (`service`), Username, Password, Notes.
- On save: if `url` is blank, derive `service.toLowerCase().replace(/\s+/g,'') + '.com'`.
- Tags: not shown; when editing an item that has tags, they are preserved in the
  saved object (spread the original item) but not editable here.
- Add → blank form, title "New credential". Edit (from card menu) → prefilled,
  title "Edit credential". Validation: Website required (existing behavior).

## Error Handling

- Clipboard copy keeps the existing try/catch → toast ("Copied" / "Copied Failed").
- Empty search → "No matches found" empty state (comp).
- Missing date → blank "updated" (no crash).
- No change to encryption error handling.

## Testing

- Unit-test `display.js`: `passwordStrength` boundaries (Weak/Fair/Good/Strong),
  `avatarColor` determinism + palette membership, `maskPassword` clamping,
  `relativeTime` ("Just now", days-ago, and `""` for missing/invalid input).
- Component-test `Card`: renders site + username, masked vs revealed password,
  strength label; `Home`: empty-search state shows "No matches found".
- Keep the existing 22-test suite green; tests use the jsdom Web Crypto polyfill
  already in `setupTests.js`.

## Affected Files

- New: `src/Utilities/display.js` (+ test), `src/Components/Card/Avatar.js`,
  `src/Components/Card/StrengthMeter.js`.
- Modified: `public/index.html`, `src/Styles/Styles.css`, `src/Pages/Home.js`,
  `src/Pages/AddItemForm.js`, `src/Pages/Settings.js`, `src/Pages/AddItem.js`,
  `src/Pages/Options.js`, `src/Components/Card/Card.js`,
  `src/Components/Card/Username.js`, `src/Components/Card/PasswordField.js`,
  `src/Components/Card/Notes.js`, `src/Components/Card/CardMenu.js`,
  `src/Components/Menu.js`, `src/Components/MenuItem.js`,
  `src/Components/Search.js`, `src/Components/Modal.js`,
  `src/Components/Toast.js`, `src/Components/LockScreen.js`.

## Out of Scope (YAGNI)

- Configurable `accentColor` / `showStrength` / `revealAll` props from the comp.
- Any change to the encryption model, storage shape, or hooks' logic.
- Unrelated refactors of the dead-code files documented in CLAUDE.md.
