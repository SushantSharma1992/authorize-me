# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`authorize-me` is a client-only (no backend) password/credential manager built with Create React App. All credentials live in the browser's `localStorage` — there is no server, API, or auth layer. The README tracks the intended roadmap: make it a PWA, encrypt stored data, show password (the last is done).

> Credentials are encrypted at rest. The vault is unlocked with a master password (see "Encryption" below); `localStorage` holds only the ciphertext envelope.

## Commands

- `npm start` — dev server. **Runs on port 3001** (the `start` script hardcodes `set PORT=3001`, Windows-only syntax; on a non-Windows shell set `PORT` differently).
- `npm test` — Jest + React Testing Library in watch mode (`react-scripts test`).
- Run a single test: `npm test -- src/App.test.js` (or pass a name pattern: `npm test -- -t "renders learn react"`).
- `npm run build` — production build to `build/`.

There is no lint script; ESLint runs through `react-scripts` (CRA `react-app` config) during start/build.

## Architecture

Single-page app rendered as `App → Context → Home`. There is no router; "pages" under `src/Pages` are just feature sections composed on the Home screen.

**State lives in one React Context** (`src/GlobalStore/Context.js`, exported as `AppContext`). It holds:
- `credentials` / `setCredentials` — the credential list (the app's core data).
- `showToast`, `toastNotification` and their setters — the global toast.

The context seeds `credentials` from `localStorage` on first load, falling back to `src/Assets/mockData.json` when storage is empty, and **persists every change back to `localStorage` via a `useEffect`** keyed on `credentials`. To read or mutate credentials anywhere, consume `AppContext` (usually indirectly through the hooks below) — do not touch `localStorage` directly.

**All credential mutations go through custom hooks** in `src/Utilities/CustomHooks/`:
- `useModifyCred` — the CRUD layer: `editCred` (create vs. update is decided by whether the item has an `id`; new ids are `lastId + 1`), `deleteItem`, `loadCredentials`, `clearCredentials`. Each action also fires a toast. **Prefer adding mutations here** rather than calling `setCredentials` directly.
- `useSearch` — wraps Fuse.js fuzzy search over `["service", "username", "password"]`; returns `[searchResults, findQuery]`. `Home` renders `searchResults`, not the raw credentials.
- `useToastNotification` — `notify(text)` shows the global toast for 2s.

**Forms are schema-driven.** `AddItemForm` generates its input fields by iterating `Object.entries` of the credential shape (`obj` in `src/Utilities/Constants.js`), skipping object-valued and internal keys (`id`, `createdOn`, `updateOn`). To add/remove a credential field, edit `obj` in `Constants.js` — the form follows automatically. A field named `password` is rendered as a password input.

**Import/export** (`src/Pages/Options.js`): export dumps `localStorage` to a JSON file via a Blob URL; import parses an uploaded JSON file and merges it with `mergeProductList` (`src/Utilities/Utilities.js`), which dedupes by `id` and keeps the item with the newer `updatedOn`.

**UI primitives:** `Modal` wraps the native `<dialog>` element (`showModal()`/`close()` driven by an `isOpen` prop). `Card` shows one credential; clicking a username/password field copies it to the clipboard via `Username` → `navigator.clipboard`. `react-icons` is used throughout for icons.

## Encryption

Credentials are encrypted with the Web Crypto API (AES-GCM, key derived from a
master password via PBKDF2). The crypto primitives live in
`src/Utilities/crypto.js` and the `localStorage` envelope layer in
`src/Utilities/vault.js` (envelope `{ version, salt, iv, ciphertext }` under the
`authorize-me-vault` key). `AppContext` owns lock state (`isLocked`,
`isInitialized`) and the `setupPassword` / `unlock` / `lock` / `resetVault`
actions; the derived key lives in a ref and is cached in `sessionStorage` so a
same-tab refresh stays unlocked. `VaultGate` renders `LockScreen` until
unlocked, then `Home`. The persistence effect in `Context.js` re-encrypts
`credentials` on every change. Export decrypts to plaintext JSON; import parses
plaintext JSON and is re-encrypted on save.

## Gotchas / dead code

- `src/GlobalStore/LoadData.js` is broken, unused scaffolding (references undefined variables). Do not import it.
- In `src/Utilities/Utilities.js`, only `mergeProductList` is wired up. `importData`/`getDownloadURL`/`higlightInList`/`readFile`/`writeFile` are dead or stubbed — `Options.js` defines its own import/export logic.
- `AddItemForm.getObject` still contains leftover `quantity`/`price` cart-like logic that doesn't map to the credential domain; tread carefully when changing form submission.
