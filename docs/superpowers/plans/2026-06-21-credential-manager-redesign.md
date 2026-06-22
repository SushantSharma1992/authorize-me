# Credential Manager Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Recreate the Claude Design "Vault / Credentials" comp pixel-perfectly by restyling the existing React components in place.

**Architecture:** Keep the current architecture — `AppContext`, `useModifyCred`, `useSearch`, `useToastNotification`, and the encryption/lock screen. Convert the comp's inline styles into real CSS classes/variables in `src/Styles/Styles.css`, adapt each component's JSX to the comp's structure, and add small presentational pieces (`Avatar`, `StrengthMeter`) plus a pure helper module (`display.js`). No data migration — per-item `color`/`updated` are derived.

**Tech Stack:** React 18 (Create React App / react-scripts 5), plain CSS, Jest + React Testing Library + `@testing-library/user-event` v13.

## Global Constraints

- **Theme tokens (verbatim):** `--bg:#14151a`, `--card:#1c1e26`, `--accent:#E3B23C`, `--text:#ECECEE`, `--muted:#6B6E78`, `--card-border:rgba(255,255,255,0.06)`, surface `#23262f`.
- **Fonts:** Manrope (UI), JetBrains Mono (credential values), from Google Fonts.
- **Card menu:** Edit + Delete only (no "Copy password" item). Copy stays as the inline row icon.
- **Add/Edit form fields:** Website, Username, Password, Notes. Derive `url` = `service.toLowerCase().replace(/\s+/g,'') + '.com'` when blank. No tags input; preserve existing tag data by spreading the original item.
- **Strength palette (verbatim):** score ≤1 → Weak `#E5675F` 25%; 2 → Fair `#E0A93C` 55%; 3 → Good `#3FA9F5` 80%; 4 → Strong `#4FB477` 100%.
- **Avatar palette (verbatim):** `['#4285F4','#1DB954','#E01E5A','#A259FF','#FF9900','#3FA9F5']`.
- **No new runtime dependencies.** Icons are inline SVG (as in the comp), not a new icon package. (`react-icons` is already a dependency and may stay where already used.)
- **Keep encryption untouched.** Don't change `crypto.js`, `vault.js`, or `Context.js` logic.
- **Test command:** `npm test -- --watchAll=false <path>` (single run, no watch mode).
- **Comp source of truth:** `docs/card-based-react-design/project/Credential Manager.dc.html`.

---

### Task 1: Theme foundation (fonts + tokens + base layout)

**Files:**
- Modify: `public/index.html` (add font links, title)
- Modify: `src/Styles/Styles.css` (top of file: tokens + base)
- Modify: `src/App.css` (neutralize the old dark `.App-header` box)

**Interfaces:**
- Consumes: nothing.
- Produces: CSS variables `--bg --card --accent --text --muted --card-border --surface`; global dark background + Manrope font; `toastIn` keyframe; styled scrollbars. Later tasks rely on these tokens and on the page filling the viewport with no centered/`aqua` legacy styling.

- [ ] **Step 1: Add Google Fonts to `public/index.html`**

In `public/index.html`, replace the `<title>React App</title>` line and the lines just above it so the `<head>` includes the fonts and a real title:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <title>Vault — Credentials</title>
```

- [ ] **Step 2: Replace the top of `src/Styles/Styles.css` with tokens + base**

Replace lines 1–32 of `src/Styles/Styles.css` (the `html body { … }` block, the `:root::-webkit-scrollbar` blocks, and the existing `:root { … }` block) with:

```css
:root {
  --bg: #14151a;
  --card: #1c1e26;
  --surface: #23262f;
  --accent: #E3B23C;
  --text: #ECECEE;
  --muted: #6B6E78;
  --card-border: rgba(255, 255, 255, 0.06);
  --border-curve: 12px;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  background: var(--bg);
  color: var(--text);
  font-family: "Manrope", system-ui, -apple-system, sans-serif;
}

input::placeholder, textarea::placeholder { color: #5c5f68; }

@keyframes toastIn {
  from { opacity: 0; transform: translate(-50%, 8px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

::-webkit-scrollbar { width: 10px; }
::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.09); border-radius: 5px; }
::-webkit-scrollbar-track { background: transparent; }
```

Leave the rest of `Styles.css` (existing component classes) in place for now; later tasks replace the relevant ones.

- [ ] **Step 3: Neutralize the legacy app shell in `src/App.css`**

Replace the `.App-header` rule (lines 17–21) in `src/App.css` with a no-op-friendly version so the old `#282c34` box and white text don't fight the new theme:

```css
.App-header {
  width: 100%;
  height: 100%;
}
```

Also change `.App` (lines 1–4) to drop the centered text:

```css
.App {
  height: 100dvh;
}
```

- [ ] **Step 4: Verify the suite still passes**

Run: `npm test -- --watchAll=false`
Expected: PASS — 6 suites, 22 tests (no behavior changed; CSS/markup only).

- [ ] **Step 5: Commit**

```bash
git add public/index.html src/Styles/Styles.css src/App.css
git commit -m "feat: dark/gold theme foundation (fonts, tokens, base layout)"
```

---

### Task 2: Display helpers (`display.js`)

**Files:**
- Create: `src/Utilities/display.js`
- Test: `src/Utilities/display.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `avatarColor(name: string): string` — hex from the palette, deterministic per name.
  - `hexToRgba(hex: string, a: number): string`
  - `passwordStrength(pw: string): { label: string, color: string, pct: string }`
  - `maskPassword(pw: string): string`
  - `relativeTime(value: string | Date | undefined): string` — `""` for missing/invalid.

- [ ] **Step 1: Write the failing tests**

Create `src/Utilities/display.test.js`:

```js
import {
  avatarColor,
  hexToRgba,
  passwordStrength,
  maskPassword,
  relativeTime,
} from "./display";

const PALETTE = ["#4285F4", "#1DB954", "#E01E5A", "#A259FF", "#FF9900", "#3FA9F5"];

test("avatarColor returns a palette color and is deterministic", () => {
  const a = avatarColor("Google");
  expect(PALETTE).toContain(a);
  expect(avatarColor("Google")).toBe(a);
});

test("hexToRgba converts a 6-digit hex with alpha", () => {
  expect(hexToRgba("#4285F4", 0.16)).toBe("rgba(66,133,244,0.16)");
});

test("passwordStrength scores weak to strong", () => {
  expect(passwordStrength("abc").label).toBe("Weak");        // score <= 1
  expect(passwordStrength("abcd1234").label).toBe("Fair");   // len>=8 + digit = 2
  expect(passwordStrength("Abcd1234").label).toBe("Good");   // + mixed case = 3
  expect(passwordStrength("Abcd1234!").label).toBe("Strong");// + symbol = 4
});

test("passwordStrength returns matching color and pct", () => {
  expect(passwordStrength("Abcd1234!")).toEqual({
    label: "Strong",
    color: "#4FB477",
    pct: "100%",
  });
});

test("maskPassword clamps bullet count between 6 and 14", () => {
  expect(maskPassword("ab")).toBe("•".repeat(6));
  expect(maskPassword("a".repeat(20))).toBe("•".repeat(14));
  expect(maskPassword("a".repeat(10))).toBe("•".repeat(10));
});

test("relativeTime returns empty string for missing or invalid input", () => {
  expect(relativeTime(undefined)).toBe("");
  expect(relativeTime("")).toBe("");
  expect(relativeTime("not-a-date")).toBe("");
});

test("relativeTime returns 'Just now' for the current time", () => {
  expect(relativeTime(new Date().toISOString())).toBe("Just now");
});

test("relativeTime returns days ago", () => {
  const threeDays = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  expect(relativeTime(threeDays)).toBe("3 days ago");
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --watchAll=false src/Utilities/display.test.js`
Expected: FAIL — `Cannot find module './display'`.

- [ ] **Step 3: Implement `display.js`**

Create `src/Utilities/display.js`:

```js
const PALETTE = ["#4285F4", "#1DB954", "#E01E5A", "#A259FF", "#FF9900", "#3FA9F5"];

export function avatarColor(name) {
  const s = String(name || "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function hexToRgba(hex, a) {
  const h = String(hex).replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

export function passwordStrength(pw) {
  const p = String(pw || "");
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return { label: "Weak", color: "#E5675F", pct: "25%" };
  if (s === 2) return { label: "Fair", color: "#E0A93C", pct: "55%" };
  if (s === 3) return { label: "Good", color: "#3FA9F5", pct: "80%" };
  return { label: "Strong", color: "#4FB477", pct: "100%" };
}

export function maskPassword(pw) {
  const len = Math.min(Math.max(String(pw || "").length, 6), 14);
  return "•".repeat(len);
}

export function relativeTime(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  const ms = d.getTime();
  if (Number.isNaN(ms)) return "";
  const diff = Date.now() - ms;
  if (diff < 0) return "Just now";
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return min + (min === 1 ? " minute ago" : " minutes ago");
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + (hr === 1 ? " hour ago" : " hours ago");
  const day = Math.floor(hr / 24);
  if (day < 7) return day + (day === 1 ? " day ago" : " days ago");
  const wk = Math.floor(day / 7);
  if (day < 30) return wk + (wk === 1 ? " week ago" : " weeks ago");
  const mo = Math.floor(day / 30);
  return mo + (mo === 1 ? " month ago" : " months ago");
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --watchAll=false src/Utilities/display.test.js`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/Utilities/display.js src/Utilities/display.test.js
git commit -m "feat: add display helpers (avatar color, strength, mask, relative time)"
```

---

### Task 3: Card row pieces — Avatar, StrengthMeter, restyled Username/PasswordField/Notes

**Files:**
- Create: `src/Components/Card/Avatar.js`
- Create: `src/Components/Card/StrengthMeter.js`
- Modify: `src/Components/Card/Username.js` (full rewrite)
- Modify: `src/Components/Card/PasswordField.js` (full rewrite)
- Modify: `src/Components/Card/Notes.js` (full rewrite — drop accordion + tags)
- Modify: `src/Styles/Styles.css` (append card-field CSS)

**Interfaces:**
- Consumes: `avatarColor`, `hexToRgba`, `passwordStrength`, `maskPassword`, `relativeTime` from `../../Utilities/display` (Task 2); `useToastNotification` (existing).
- Produces:
  - `Avatar({ name })` — colored initial badge.
  - `StrengthMeter({ password, updated })` — bar + label + relative-time on one row.
  - `Username({ label, value, mono })` — labelled boxed value with inline copy.
  - `PasswordField({ password })` — labelled masked value with reveal + copy.
  - `Notes({ content })` — muted note block, renders nothing when empty.

- [ ] **Step 1: Append card-field CSS to `src/Styles/Styles.css`**

Append to the end of `src/Styles/Styles.css`:

```css
/* ---- Card field rows / avatar / strength ---- */
.cred-avatar {
  width: 42px; height: 42px; border-radius: 12px; flex: none;
  display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 18px;
}
.cred-field { display: flex; flex-direction: column; gap: 6px; }
.cred-field__label {
  font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--muted); font-weight: 700;
}
.cred-field__value {
  display: flex; align-items: center; gap: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--card-border);
  border-radius: 10px; padding: 9px 10px;
}
.cred-field__text {
  font-family: "JetBrains Mono", monospace; font-size: 13px; color: #D6D7DC;
  flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cred-field__text--pass { letter-spacing: 1.5px; }
.cred-icon-btn {
  width: 30px; height: 30px; flex: none; display: flex; align-items: center;
  justify-content: center; background: transparent; border: none; border-radius: 8px;
  color: #8A8F98; cursor: pointer; transition: background .12s, color .12s;
}
.cred-icon-btn:hover { background: rgba(255, 255, 255, 0.08); color: var(--accent); }
.cred-note {
  font-size: 12.5px; color: #9A9DA6; line-height: 1.5;
  background: rgba(255, 255, 255, 0.03); border-radius: 10px; padding: 8px 11px;
}
.cred-foot {
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; margin-top: 2px;
}
.cred-strength { display: flex; align-items: center; gap: 9px; flex: 1; min-width: 0; }
.cred-strength__track {
  height: 5px; flex: 1; max-width: 96px; background: rgba(255, 255, 255, 0.08);
  border-radius: 3px; overflow: hidden;
}
.cred-strength__fill { height: 100%; border-radius: 3px; }
.cred-strength__label { font-size: 11px; font-weight: 700; }
.cred-updated { font-size: 11px; color: var(--muted); white-space: nowrap; }
```

(Inline SVG icons reused below: COPY = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>`.)

- [ ] **Step 2: Create `Avatar.js`**

Create `src/Components/Card/Avatar.js`:

```jsx
import React from "react";
import { avatarColor, hexToRgba } from "../../Utilities/display";

function Avatar({ name }) {
  const color = avatarColor(name);
  const initial = (String(name || "?")[0] || "?").toUpperCase();
  return (
    <div
      className="cred-avatar"
      style={{ background: hexToRgba(color, 0.16), color }}
    >
      {initial}
    </div>
  );
}

export default Avatar;
```

- [ ] **Step 3: Create `StrengthMeter.js`**

Create `src/Components/Card/StrengthMeter.js`:

```jsx
import React from "react";
import { passwordStrength, relativeTime } from "../../Utilities/display";

function StrengthMeter({ password, updated }) {
  const s = passwordStrength(password);
  const when = relativeTime(updated);
  return (
    <div className="cred-foot">
      <div className="cred-strength">
        <div className="cred-strength__track">
          <div
            className="cred-strength__fill"
            style={{ width: s.pct, background: s.color }}
          />
        </div>
        <span className="cred-strength__label" style={{ color: s.color }}>
          {s.label}
        </span>
      </div>
      {when && <span className="cred-updated">{when}</span>}
    </div>
  );
}

export default StrengthMeter;
```

- [ ] **Step 4: Rewrite `Username.js`**

Replace the entire contents of `src/Components/Card/Username.js`:

```jsx
import React from "react";
import useToastNotification from "../../Utilities/CustomHooks/useToastNotification";

function Username({ label, value }) {
  const { notify } = useToastNotification();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      notify("Copied");
    } catch (error) {
      notify("Copied Failed");
    }
  };

  return (
    <div className="cred-field">
      <div className="cred-field__label">{label}</div>
      <div className="cred-field__value">
        <span className="cred-field__text">{value}</span>
        <button
          type="button"
          aria-label={`Copy ${label.toLowerCase()}`}
          className="cred-icon-btn"
          onClick={copy}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        </button>
      </div>
    </div>
  );
}

export default Username;
```

- [ ] **Step 5: Rewrite `PasswordField.js`**

Replace the entire contents of `src/Components/Card/PasswordField.js`:

```jsx
import React, { useState } from "react";
import useToastNotification from "../../Utilities/CustomHooks/useToastNotification";
import { maskPassword } from "../../Utilities/display";

function PasswordField({ password }) {
  const { notify } = useToastNotification();
  const [revealed, setRevealed] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      notify("Copied");
    } catch (error) {
      notify("Copied Failed");
    }
  };

  return (
    <div className="cred-field">
      <div className="cred-field__label">Password</div>
      <div className="cred-field__value">
        <span className="cred-field__text cred-field__text--pass">
          {revealed ? password : maskPassword(password)}
        </span>
        <button
          type="button"
          aria-label={revealed ? "Hide password" : "Show password"}
          className="cred-icon-btn"
          onClick={() => setRevealed((p) => !p)}
        >
          {revealed ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="2" y1="2" x2="22" y2="22"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
        <button
          type="button"
          aria-label="Copy password"
          className="cred-icon-btn"
          onClick={copy}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
        </button>
      </div>
    </div>
  );
}

export default PasswordField;
```

- [ ] **Step 6: Rewrite `Notes.js`**

Replace the entire contents of `src/Components/Card/Notes.js`:

```jsx
import React from "react";

function Notes({ content }) {
  if (!content) return null;
  return <div className="cred-note">{content}</div>;
}

export default Notes;
```

- [ ] **Step 7: Verify the suite still passes**

Run: `npm test -- --watchAll=false`
Expected: PASS — existing 22 + 8 new (display) = 30 tests. (These component rewrites are not yet rendered by `Card` until Task 4; `src/Components/Card/Tags.js` is now unused — leave it; CLAUDE.md's dead-code list can note it later.)

- [ ] **Step 8: Commit**

```bash
git add src/Components/Card/Avatar.js src/Components/Card/StrengthMeter.js src/Components/Card/Username.js src/Components/Card/PasswordField.js src/Components/Card/Notes.js src/Styles/Styles.css
git commit -m "feat: restyle card field rows; add avatar and strength meter"
```

---

### Task 4: Card + dropdown menu

**Files:**
- Modify: `src/Components/Card/Card.js` (full rewrite)
- Modify: `src/Components/Menu.js` (full rewrite — kebab + comp dropdown)
- Modify: `src/Components/MenuItem.js` (full rewrite — icon + danger variant)
- Modify: `src/Styles/Styles.css` (append card + menu CSS; replace old `.dropdown*`/`.menu-component` rules)
- Test: `src/Components/Card/Card.test.js`

**Interfaces:**
- Consumes: `Avatar`, `Username`, `PasswordField`, `Notes`, `StrengthMeter` (Task 3); `CardMenu`→`Menu`/`MenuItem`; `useModifyCred` (existing, `deleteItem`).
- Produces: `Card({ data, editItem })` rendering the full comp card; `Menu({ children })`; `MenuItem`/`MenuItems({ options })` where each option is `{ name, onClick, icon?, danger? }`.

- [ ] **Step 1: Write the failing test**

Create `src/Components/Card/Card.test.js`:

```js
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Card from "./Card";

// Card uses useModifyCred -> AppContext; provide a minimal context.
jest.mock("../../Utilities/CustomHooks/useModifyCred", () => ({
  __esModule: true,
  default: () => ({ deleteItem: jest.fn() }),
}));
jest.mock("../../Utilities/CustomHooks/useToastNotification", () => ({
  __esModule: true,
  default: () => ({ notify: jest.fn() }),
}));

const item = {
  id: 1,
  service: "Google",
  url: "accounts.google.com",
  username: "alex@gmail.com",
  password: "Abcd1234!",
  notes: "Personal",
  updateOn: new Date().toISOString(),
};

test("renders the service, url and username", () => {
  render(<Card data={item} editItem={() => {}} />);
  expect(screen.getByText("Google")).toBeInTheDocument();
  expect(screen.getByText("accounts.google.com")).toBeInTheDocument();
  expect(screen.getByText("alex@gmail.com")).toBeInTheDocument();
});

test("password is masked until revealed", async () => {
  render(<Card data={item} editItem={() => {}} />);
  expect(screen.queryByText("Abcd1234!")).not.toBeInTheDocument();
  await act(async () => {
    await userEvent.click(screen.getByLabelText("Show password"));
  });
  expect(screen.getByText("Abcd1234!")).toBeInTheDocument();
});

test("shows the password strength label", () => {
  render(<Card data={item} editItem={() => {}} />);
  expect(screen.getByText("Strong")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --watchAll=false src/Components/Card/Card.test.js`
Expected: FAIL — current `Card` renders the old markup (no "Strong" label, password not masked the same way, `Show password` label absent).

- [ ] **Step 3: Append card + menu CSS, and replace the old dropdown rules**

In `src/Styles/Styles.css`, **replace** the existing `.menu-component` rule (≈ lines 97–102) and the `.dropdownContainer` / `.dropdownPanel` / `.dropdownItem` / `.openDropdown` / `.openDropUp` rules (≈ lines 211–240) with the block below, and append the card rules:

```css
/* ---- Card ---- */
.cred-card {
  background: var(--card);
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  transition: border-color .15s, box-shadow .15s, transform .15s;
}
.cred-card:hover {
  border-color: rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  transform: translateY(-2px);
}
.cred-card__head { display: flex; align-items: center; gap: 12px; }
.cred-site-wrap { min-width: 0; flex: 1; }
.cred-site {
  font-size: 16px; font-weight: 700; color: var(--accent);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.cred-site a { color: var(--accent); text-decoration: none; }
.cred-url {
  font-size: 12px; color: var(--muted);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* ---- Kebab + dropdown ---- */
.menu-component { position: relative; display: flex; }
.cred-kebab {
  width: 34px; height: 34px; flex: none; display: flex; align-items: center;
  justify-content: center; background: transparent; border: none; border-radius: 9px;
  color: #8A8F98; cursor: pointer; transition: background .12s, color .12s;
}
.cred-kebab:hover { background: rgba(255, 255, 255, 0.08); color: var(--text); }
.dropdownPanel {
  display: none; position: absolute; top: 40px; right: 0;
  background: var(--surface); border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px; padding: 6px; box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
  z-index: 6; min-width: 148px;
}
.dropdownPanel.openDropdown { display: block; }
.dropdownItem {
  display: flex; align-items: center; gap: 10px; width: 100%;
  background: none; border: none; color: #D6D7DC; font-family: inherit;
  font-size: 13px; font-weight: 600; padding: 9px 10px; border-radius: 8px;
  cursor: pointer; text-align: left;
}
.dropdownItem:hover { background: rgba(255, 255, 255, 0.06); }
.dropdownItem--danger { color: #E5675F; }
.dropdownItem--danger:hover { background: rgba(229, 83, 75, 0.12); }
```

- [ ] **Step 4: Rewrite `Menu.js`**

Replace the entire contents of `src/Components/Menu.js`:

```jsx
import React, { useState } from "react";

function Menu({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="menu-component"
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label="Card menu"
        className="cred-kebab"
        onClick={() => setOpen((p) => !p)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>
      </button>
      <div className={`dropdownPanel ${open ? "openDropdown" : ""}`}>
        {children}
      </div>
    </span>
  );
}

export default Menu;
```

- [ ] **Step 5: Rewrite `MenuItem.js`**

Replace the entire contents of `src/Components/MenuItem.js`:

```jsx
import React from "react";

const ICONS = {
  edit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  ),
  delete: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
  ),
};

export default function MenuItems({ options }) {
  return (
    <>
      {options.map((item) => (
        <button
          key={item.name}
          type="button"
          className={`dropdownItem${item.danger ? " dropdownItem--danger" : ""}`}
          onClick={item.onClick}
        >
          {item.icon && ICONS[item.icon]}
          {item.name}
        </button>
      ))}
    </>
  );
}
```

- [ ] **Step 6: Rewrite `Card.js`**

Replace the entire contents of `src/Components/Card/Card.js`:

```jsx
import React from "react";
import useModifyCred from "../../Utilities/CustomHooks/useModifyCred";
import Avatar from "./Avatar";
import CardMenu from "./CardMenu";
import Notes from "./Notes";
import PasswordField from "./PasswordField";
import StrengthMeter from "./StrengthMeter";
import Username from "./Username";

function Card({ data, editItem }) {
  const { deleteItem } = useModifyCred();

  const options = [
    { name: "Edit", icon: "edit", onClick: () => editItem(data) },
    { name: "Delete", icon: "delete", danger: true, onClick: () => deleteItem(data) },
  ];

  return (
    <div className="cred-card">
      <div className="cred-card__head">
        <Avatar name={data.service} />
        <div className="cred-site-wrap">
          <div className="cred-site">
            {data.url ? (
              <a target="_blank" rel="noreferrer" href={data.url}>
                {data.service}
              </a>
            ) : (
              data.service
            )}
          </div>
          <div className="cred-url">{data.url}</div>
        </div>
        <CardMenu options={options} />
      </div>

      <Username label="Username" value={data.username} />
      <PasswordField password={data.password} />
      <Notes content={data.notes} />
      <StrengthMeter password={data.password} updated={data.updateOn || data.createdOn} />
    </div>
  );
}

export default Card;
```

(`CardMenu.js` is unchanged — it already wraps `<Menu><MenuItems options={options} /></Menu>`.)

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test -- --watchAll=false src/Components/Card/Card.test.js`
Expected: PASS (3 tests).

- [ ] **Step 8: Run the full suite**

Run: `npm test -- --watchAll=false`
Expected: PASS — 33 tests, pristine output.

- [ ] **Step 9: Commit**

```bash
git add src/Components/Card/Card.js src/Components/Menu.js src/Components/MenuItem.js src/Components/Card/Card.test.js src/Styles/Styles.css
git commit -m "feat: restyle credential card and dropdown menu"
```

---

### Task 5: Home shell + bottom bar (search / add / settings)

**Files:**
- Modify: `src/Pages/Home.js` (full rewrite of the layout)
- Modify: `src/Components/Search.js` (full rewrite)
- Modify: `src/Pages/AddItem.js` (full rewrite)
- Modify: `src/Pages/Settings.js` (restyle trigger button only)
- Modify: `src/Styles/Styles.css` (append page + bar CSS)
- Test: `src/Pages/Home.test.js`

**Interfaces:**
- Consumes: `useSearch` → `[searchResults, findQuery]` (existing); `Card`, `Modal`, `AddItemForm`, `Toast`, `Search`, `AddItem`, `Settings`; `obj` from `../Utilities/Constants`; `AppContext` for `credentials` count.
- Produces: `Home` page shell with header count, grid, empty state, fixed bottom bar; `Search({ findQuery })` input; `AddItem({ handleClick })` gold button.

- [ ] **Step 1: Write the failing test**

Create `src/Pages/Home.test.js`:

```js
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "./Home";

// Drive useSearch so the grid is empty after a query.
let results = [{ id: 1, service: "Google", url: "g.com", username: "a", password: "p", notes: "" }];
jest.mock("../Utilities/CustomHooks/useSearch", () => ({
  __esModule: true,
  default: () => [results, jest.fn()],
}));
jest.mock("../Utilities/CustomHooks/useModifyCred", () => ({
  __esModule: true,
  default: () => ({ deleteItem: jest.fn(), editCred: jest.fn() }),
}));
jest.mock("../Utilities/CustomHooks/useToastNotification", () => ({
  __esModule: true,
  default: () => ({ notify: jest.fn() }),
}));
jest.mock("../GlobalStore/Context", () => ({
  __esModule: true,
  AppContext: require("react").createContext({ credentials: [], showToast: false, toastNotification: "" }),
}));

test("shows the empty state when there are no results", () => {
  results = [];
  render(<Home />);
  expect(screen.getByText("No matches found")).toBeInTheDocument();
});

test("renders a card when there are results", () => {
  results = [{ id: 1, service: "Google", url: "g.com", username: "a@b.com", password: "p", notes: "" }];
  render(<Home />);
  expect(screen.getByText("Google")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --watchAll=false src/Pages/Home.test.js`
Expected: FAIL — current `Home` has no "No matches found" empty state.

- [ ] **Step 3: Append page + bar CSS to `src/Styles/Styles.css`**

Append:

```css
/* ---- Vault page ---- */
.vault-page { height: 100vh; display: flex; flex-direction: column; background: var(--bg); color: var(--text); overflow: hidden; }
.vault-header { padding: 22px 28px 8px; width: 100%; max-width: 1240px; margin: 0 auto; display: flex; align-items: flex-end; justify-content: space-between; }
.vault-eyebrow { font-size: 12px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.vault-title { font-size: 25px; font-weight: 800; letter-spacing: -0.6px; margin-top: 3px; }
.vault-count { font-size: 13px; color: #888B94; font-weight: 600; }
.vault-scroll { flex: 1; overflow-y: auto; padding: 18px 28px 124px; }
.vault-inner { max-width: 1240px; margin: 0 auto; }
.cred-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(312px, 1fr)); gap: 16px; }
.vault-empty { text-align: center; padding: 96px 20px; }
.vault-empty__icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(255, 255, 255, 0.05); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: var(--muted); }
.vault-empty__title { font-size: 16px; font-weight: 700; color: #C7C9D1; }
.vault-empty__sub { font-size: 13px; color: var(--muted); margin-top: 5px; }

/* ---- Bottom bar ---- */
.vault-bar { position: fixed; left: 0; right: 0; bottom: 0; background: rgba(20, 21, 26, 0.85); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-top: 1px solid rgba(255, 255, 255, 0.07); padding: 14px 28px; z-index: 20; }
.vault-bar__inner { max-width: 1240px; margin: 0 auto; display: flex; align-items: center; gap: 12px; }
.vault-search { position: relative; flex: 1; }
.vault-search__icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--muted); display: flex; pointer-events: none; }
.vault-search__input { width: 100%; background: var(--surface); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 13px 14px 13px 44px; color: var(--text); font-family: "Manrope", sans-serif; font-size: 15px; outline: none; transition: border-color .12s; }
.vault-search__input:focus { border-color: var(--accent); }
.vault-add { display: flex; align-items: center; gap: 8px; background: var(--accent); color: #1a1408; border: none; border-radius: 12px; padding: 0 22px; height: 48px; font-family: "Manrope", sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; white-space: nowrap; transition: filter .12s; }
.vault-add:hover { filter: brightness(1.08); }
.vault-icon-btn { width: 48px; height: 48px; flex: none; display: flex; align-items: center; justify-content: center; background: var(--surface); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; color: #8A8F98; cursor: pointer; transition: color .12s, border-color .12s; }
.vault-icon-btn:hover { color: var(--accent); border-color: rgba(255, 255, 255, 0.18); }
```

- [ ] **Step 4: Rewrite `Home.js`**

Replace the entire contents of `src/Pages/Home.js`:

```jsx
import React, { useContext, useState } from "react";
import Card from "../Components/Card/Card";
import Modal from "../Components/Modal";
import Search from "../Components/Search";
import Toast from "../Components/Toast";
import { AppContext } from "../GlobalStore/Context";
import { obj } from "../Utilities/Constants";
import useSearch from "../Utilities/CustomHooks/useSearch";
import AddItem from "./AddItem";
import AddItemForm from "./AddItemForm";
import Settings from "./Settings";

function Home() {
  const { credentials } = useContext(AppContext);
  const [searchResults, findQuery] = useSearch();
  const [openForm, setOpenForm] = useState(false);
  const [editCred, setEditCred] = useState(obj);

  const toggleForm = () => setOpenForm((prev) => !prev);
  const editItem = (item) => {
    setEditCred(item);
    setOpenForm(true);
  };

  return (
    <div className="vault-page">
      <Modal isOpen={openForm} onClose={toggleForm}>
        <AddItemForm item={editCred} editItem={setEditCred} onClose={toggleForm} />
      </Modal>

      <div className="vault-header">
        <div>
          <div className="vault-eyebrow">Vault</div>
          <div className="vault-title">Credentials</div>
        </div>
        <div className="vault-count">
          {searchResults.length} of {credentials.length} items
        </div>
      </div>

      <div className="vault-scroll">
        <div className="vault-inner">
          {searchResults.length > 0 ? (
            <div className="cred-grid">
              {searchResults.map((cred) => (
                <Card key={cred.id} data={cred} editItem={editItem} />
              ))}
            </div>
          ) : (
            <div className="vault-empty">
              <div className="vault-empty__icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <div className="vault-empty__title">No matches found</div>
              <div className="vault-empty__sub">Try a different search term.</div>
            </div>
          )}
        </div>
      </div>

      <div className="vault-bar">
        <div className="vault-bar__inner">
          <Search findQuery={findQuery} />
          <AddItem handleClick={() => editItem(obj)} />
          <Settings />
        </div>
      </div>

      <Toast />
    </div>
  );
}

export default Home;
```

- [ ] **Step 5: Rewrite `Search.js`**

Replace the entire contents of `src/Components/Search.js`:

```jsx
import React from "react";

function Search({ findQuery }) {
  return (
    <div className="vault-search">
      <span className="vault-search__icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
      </span>
      <input
        type="search"
        className="vault-search__input"
        placeholder="Search credentials…"
        onChange={findQuery}
      />
    </div>
  );
}

export default Search;
```

- [ ] **Step 6: Rewrite `AddItem.js`**

Replace the entire contents of `src/Pages/AddItem.js`:

```jsx
import React from "react";

const AddItem = ({ handleClick }) => (
  <button type="button" className="vault-add" onClick={handleClick}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
    Add
  </button>
);

export default AddItem;
```

- [ ] **Step 7: Restyle the `Settings.js` trigger button**

In `src/Pages/Settings.js`, change the trigger `div` (the one with `className="padding-md flex_horizontal"` and the `onClick` that sets `isOpen` true) to a button with the new class, and remove the outer `margin-auto` wrapper class. Replace the returned JSX's opening wrapper and trigger so it reads:

```jsx
  return (
    <>
      <button
        type="button"
        aria-label="Settings"
        className="vault-icon-btn"
        onClick={() => setIsOpen(true)}
      >
        <FiSettings />
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="list_container">
          <Options />
        </div>
      </Modal>
    </>
  );
```

(Keep the existing imports and `useState`. The `FiSettings` icon import stays.)

- [ ] **Step 8: Run the Home test to verify it passes**

Run: `npm test -- --watchAll=false src/Pages/Home.test.js`
Expected: PASS (2 tests).

- [ ] **Step 9: Run the full suite**

Run: `npm test -- --watchAll=false`
Expected: PASS — 35 tests, pristine.

- [ ] **Step 10: Commit**

```bash
git add src/Pages/Home.js src/Components/Search.js src/Pages/AddItem.js src/Pages/Settings.js src/Styles/Styles.css src/Pages/Home.test.js
git commit -m "feat: restyle home shell, search, add and settings into the vault layout"
```

---

### Task 6: Modal shell + Add/Edit form + Options

**Files:**
- Modify: `src/Components/Modal.js` (full rewrite — div overlay instead of `<dialog>`)
- Modify: `src/Pages/AddItemForm.js` (full rewrite — 4 fields, derive url)
- Modify: `src/Pages/Options.js` (restyle markup only)
- Modify: `src/Styles/Styles.css` (append modal + form + options CSS; replace old `.modal_styles`/`.closeButton`/`.options_container`/`.option_row`/`.input_class`/`.button_primary` usages via new classes)
- Test: `src/Pages/AddItemForm.test.js`

**Interfaces:**
- Consumes: `useModifyCred` → `editCred(data)` (existing); `AppContext` for `credentials` (Options export); `mergeProductList`, `serializeForExport` (existing, Options).
- Produces: `Modal({ isOpen, onClose, children })` overlay (renders `null` when closed); `AddItemForm({ item, editItem, onClose })`.

- [ ] **Step 1: Write the failing test**

Create `src/Pages/AddItemForm.test.js`:

```js
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddItemForm from "./AddItemForm";

const editCred = jest.fn();
jest.mock("../Utilities/CustomHooks/useModifyCred", () => ({
  __esModule: true,
  default: () => ({ editCred }),
}));

const blank = { service: "", url: "", username: "", password: "", tags: [""], notes: "" };

beforeEach(() => editCred.mockClear());

test("saving derives url from the website when url is blank", async () => {
  render(<AddItemForm item={blank} editItem={() => {}} onClose={() => {}} />);
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Website"), "My Site");
    await userEvent.type(screen.getByLabelText("Username"), "me@x.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret");
    await userEvent.click(screen.getByText("Save credential"));
  });

  expect(editCred).toHaveBeenCalledTimes(1);
  const saved = editCred.mock.calls[0][0];
  expect(saved.service).toBe("My Site");
  expect(saved.url).toBe("mysite.com");
  expect(saved.username).toBe("me@x.com");
});

test("does not save when website is empty", async () => {
  render(<AddItemForm item={blank} editItem={() => {}} onClose={() => {}} />);
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Username"), "me@x.com");
    await userEvent.click(screen.getByText("Save credential"));
  });
  expect(editCred).not.toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --watchAll=false src/Pages/AddItemForm.test.js`
Expected: FAIL — current `AddItemForm` is schema-driven and has no `aria-label="Website"` / "Save credential" with the derive-url behavior.

- [ ] **Step 3: Append modal + form + options CSS**

Append to `src/Styles/Styles.css`:

```css
/* ---- Modal ---- */
.vault-modal__backdrop { position: fixed; inset: 0; background: rgba(8, 9, 12, 0.62); backdrop-filter: blur(3px); -webkit-backdrop-filter: blur(3px); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 24px; }
.vault-modal { width: 100%; max-width: 440px; background: var(--card); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 18px; padding: 24px; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6); }
.vault-modal__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.vault-modal__title { font-size: 18px; font-weight: 800; }
.vault-modal__close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; border-radius: 8px; color: #8A8F98; cursor: pointer; }
.vault-modal__close:hover { background: rgba(255, 255, 255, 0.08); color: var(--text); }

/* ---- Form ---- */
.vault-form { display: flex; flex-direction: column; gap: 14px; }
.vault-field2 { display: flex; flex-direction: column; gap: 6px; }
.vault-field2__label { font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: var(--muted); font-weight: 700; }
.vault-input, .vault-textarea { width: 100%; background: var(--surface); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 11px 12px; color: var(--text); font-family: "Manrope", sans-serif; font-size: 14px; outline: none; }
.vault-input--mono { font-family: "JetBrains Mono", monospace; font-size: 13px; }
.vault-textarea { resize: none; }
.vault-input:focus, .vault-textarea:focus { border-color: var(--accent); }
.vault-form__actions { display: flex; gap: 10px; margin-top: 6px; }
.vault-btn--ghost { flex: 1; background: transparent; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 11px; padding: 12px; color: #C7C9D1; font-family: "Manrope", sans-serif; font-size: 14px; font-weight: 700; cursor: pointer; }
.vault-btn--ghost:hover { background: rgba(255, 255, 255, 0.05); }
.vault-btn--primary { flex: 1; background: var(--accent); border: none; border-radius: 11px; padding: 12px; color: #1a1408; font-family: "Manrope", sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; }
.vault-btn--primary:hover { filter: brightness(1.08); }

/* ---- Settings list (Options) ---- */
.list_container { min-width: 320px; }
.options_container { display: flex; flex-direction: column; background: transparent; color: var(--text); }
.option_row { background: transparent; padding: 12px 4px; display: flex; align-items: center; gap: 12px; justify-content: flex-start; border-bottom: 1px solid rgba(255, 255, 255, 0.07); color: var(--text); }
.option_description { font-size: 15px; font-weight: 600; padding: 0; text-align: left; }
.option_image { color: var(--accent); }
```

- [ ] **Step 4: Rewrite `Modal.js`**

Replace the entire contents of `src/Components/Modal.js`:

```jsx
import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="vault-modal__backdrop" onClick={onClose}>
      <div className="vault-modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;
```

(The old `<dialog>`/`dialogRef`/`showModal` logic is removed; this also resolves the jsdom `dialog.close` limitation. `Toast` is no longer rendered inside `Modal` — `Home` already renders one `Toast`.)

- [ ] **Step 5: Rewrite `AddItemForm.js`**

Replace the entire contents of `src/Pages/AddItemForm.js`:

```jsx
import React, { useEffect, useState } from "react";
import useModifyCred from "../Utilities/CustomHooks/useModifyCred";

const AddItemForm = ({ item, editItem, onClose }) => {
  const { editCred } = useModifyCred();
  const [form, setForm] = useState({ service: "", username: "", password: "", notes: "" });

  useEffect(() => {
    setForm({
      service: item.service || "",
      username: item.username || "",
      password: item.password || "",
      notes: item.notes || "",
    });
  }, [item]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.service.trim()) return;
    const url =
      (item.url || "").trim() ||
      form.service.trim().toLowerCase().replace(/\s+/g, "") + ".com";
    editCred({
      ...item,
      service: form.service.trim(),
      url,
      username: form.username.trim(),
      password: form.password,
      notes: form.notes.trim(),
    });
    if (editItem) editItem({ service: "", url: "", username: "", password: "", tags: [""], notes: "" });
    if (onClose) onClose();
  };

  return (
    <>
      <div className="vault-modal__head">
        <div className="vault-modal__title">
          {item.id ? "Edit credential" : "New credential"}
        </div>
        <button type="button" className="vault-modal__close" aria-label="Close" onClick={onClose}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <form className="vault-form" onSubmit={onSubmit}>
        <div className="vault-field2">
          <label className="vault-field2__label" htmlFor="f-site">Website</label>
          <input id="f-site" className="vault-input" placeholder="e.g. Google" value={form.service} onChange={set("service")} autoFocus />
        </div>
        <div className="vault-field2">
          <label className="vault-field2__label" htmlFor="f-user">Username</label>
          <input id="f-user" className="vault-input vault-input--mono" placeholder="email or username" value={form.username} onChange={set("username")} />
        </div>
        <div className="vault-field2">
          <label className="vault-field2__label" htmlFor="f-pass">Password</label>
          <input id="f-pass" className="vault-input vault-input--mono" placeholder="password" value={form.password} onChange={set("password")} />
        </div>
        <div className="vault-field2">
          <label className="vault-field2__label" htmlFor="f-notes">Notes</label>
          <textarea id="f-notes" className="vault-textarea" rows="2" placeholder="Add a note…" value={form.notes} onChange={set("notes")} />
        </div>
        <div className="vault-form__actions">
          <button type="button" className="vault-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="vault-btn--primary">Save credential</button>
        </div>
      </form>
    </>
  );
};

export default AddItemForm;
```

(`<label htmlFor>` + matching `id` makes `getByLabelText("Website")` resolve in tests.)

- [ ] **Step 6: Restyle `Options.js` markup**

In `src/Pages/Options.js`, the `OptionItem` rows render via `src/Pages/OptionItem.jsx`. Open `src/Pages/OptionItem.jsx` and ensure its row uses the restyled classes — replace its returned wrapper so each row is:

```jsx
    <div className="option_row" onClick={onClick}>
      {image}
      <span className="option_description">{description}</span>
      {hiddenElement}
    </div>
```

(Keep the component's props/imports. No logic change — Export/Import/Delete still work; only classes/markup change. `Options.js` itself needs no change beyond what it already passes.)

- [ ] **Step 7: Run the form test to verify it passes**

Run: `npm test -- --watchAll=false src/Pages/AddItemForm.test.js`
Expected: PASS (2 tests).

- [ ] **Step 8: Run the full suite**

Run: `npm test -- --watchAll=false`
Expected: PASS — 37 tests, pristine. (The old `src/App.test.js` already renders `<App/>` locked → LockScreen, so the Modal change doesn't affect it.)

- [ ] **Step 9: Commit**

```bash
git add src/Components/Modal.js src/Pages/AddItemForm.js src/Pages/OptionItem.jsx src/Styles/Styles.css src/Pages/AddItemForm.test.js
git commit -m "feat: overlay modal, redesigned add/edit form, restyled settings list"
```

---

### Task 7: Toast + LockScreen restyle

**Files:**
- Modify: `src/Components/Toast.js` (className only)
- Modify: `src/Components/LockScreen.js` (className/markup only — no logic change)
- Modify: `src/Styles/Styles.css` (append toast + lockscreen CSS; replace old `.lockscreen-*` rules)

**Interfaces:**
- Consumes: `AppContext` (`showToast`, `toastNotification`) — Toast; `AppContext` lock actions — LockScreen (unchanged logic).
- Produces: themed toast pill + themed lock screen.

- [ ] **Step 1: Append toast + lockscreen CSS, replacing the old lockscreen rules**

In `src/Styles/Styles.css`, **replace** the existing `.lockscreen-container` / `.lockscreen-form` / `.lockscreen-error` / `.lockscreen-reset` rules (the last block in the file) with:

```css
/* ---- Toast ---- */
.vault-toast {
  position: fixed; bottom: 94px; left: 50%; transform: translateX(-50%);
  background: #2a2d37; color: var(--text); border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 18px; border-radius: 10px; font-size: 13px; font-weight: 600;
  z-index: 40; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5); animation: toastIn .2s ease;
}

/* ---- Lock screen ---- */
.lockscreen-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--bg); padding: 24px; }
.lockscreen-form { display: flex; flex-direction: column; gap: 14px; width: 340px; max-width: 90vw; background: var(--card); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 18px; padding: 28px; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5); }
.lockscreen-form h2 { margin: 0 0 4px; font-size: 20px; font-weight: 800; color: var(--text); }
.lockscreen-input { width: 100%; background: var(--surface); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 10px; padding: 12px; color: var(--text); font-family: "Manrope", sans-serif; font-size: 15px; outline: none; }
.lockscreen-input:focus { border-color: var(--accent); }
.lockscreen-submit { background: var(--accent); border: none; border-radius: 11px; padding: 13px; color: #1a1408; font-family: "Manrope", sans-serif; font-size: 15px; font-weight: 800; cursor: pointer; }
.lockscreen-submit:hover { filter: brightness(1.08); }
.lockscreen-error { color: #E5675F; font-size: 13px; }
.lockscreen-reset { background: none; border: none; color: var(--muted); text-decoration: underline; cursor: pointer; font-size: 12px; }
```

- [ ] **Step 2: Rewrite `Toast.js`**

Replace the entire contents of `src/Components/Toast.js`:

```jsx
import React, { useContext } from "react";
import { AppContext } from "../GlobalStore/Context";

function Toast() {
  const { showToast, toastNotification } = useContext(AppContext);
  if (!showToast) return null;
  return <div className="vault-toast">{toastNotification}</div>;
}

export default Toast;
```

- [ ] **Step 3: Update `LockScreen.js` classNames**

In `src/Components/LockScreen.js`, change only the className attributes (leave all logic/handlers as-is):
- both `<input>` elements: `className="input_class padding-md font-xl"` → `className="lockscreen-input"`
- submit `<button>`: `className="button_primary full-width font-xl"` → `className="lockscreen-submit"`
- the reset `<button>` keeps `className="lockscreen-reset"` (unchanged).

- [ ] **Step 4: Run the full suite**

Run: `npm test -- --watchAll=false`
Expected: PASS — 37 tests, pristine. (LockScreen tests query by `aria-label`/text, which are unchanged; Toast has no dedicated test.)

- [ ] **Step 5: Commit**

```bash
git add src/Components/Toast.js src/Components/LockScreen.js src/Styles/Styles.css
git commit -m "feat: theme the toast and lock screen to match the vault design"
```

---

## Self-Review Notes

- **Spec coverage:** theme + fonts (Task 1); derived helpers avatarColor/hexToRgba/passwordStrength/maskPassword/relativeTime (Task 2); Avatar + StrengthMeter + restyled rows, notes-without-tags (Task 3); Card + Edit/Delete dropdown (Task 4); Home shell/header count/grid/empty-state/bottom bar + Search/Add/Settings (Task 5); overlay Modal + 4-field Add/Edit form with derived URL + restyled Options (Task 6); Toast + LockScreen restyle (Task 7). Encryption untouched throughout. YAGNI items (configurable accent/showStrength/revealAll) intentionally omitted.
- **Type/name consistency:** `Username({label,value})`, `PasswordField({password})`, `Notes({content})`, `Avatar({name})`, `StrengthMeter({password,updated})`, `Menu({children})`, `MenuItems({options})` with `{name,onClick,icon?,danger?}`, `Modal({isOpen,onClose,children})`, `AddItemForm({item,editItem,onClose})` are defined and consumed consistently across Tasks 3–6. `Card` passes `value={data.username}` (matches new `Username`), `password={data.password}`, `updated={data.updateOn||data.createdOn}`.
- **No placeholders:** every code/test step contains complete content; CSS values are transcribed verbatim from the comp.
- **Behavioral note:** `Home` now owns the single `Toast`; `Modal` no longer renders one (avoids double toasts). The Modal switch from `<dialog>` to an overlay div is intentional and removes the jsdom dialog limitation.
