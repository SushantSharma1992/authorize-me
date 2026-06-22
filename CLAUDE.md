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

**Import/export** (`src/Pages/Options.js`): export serializes the in-memory decrypted `credentials` to a plaintext JSON file (via `serializeForExport`) using a Blob URL; import parses an uploaded plaintext JSON file and merges it with `mergeProductList` (`src/Utilities/Utilities.js`), which dedupes by `id` and keeps the item with the newer `updatedOn`.

**UI primitives:** `Modal` wraps the native `<dialog>` element (`showModal()`/`close()` driven by an `isOpen` prop). `Card` shows one credential; clicking a username/password field copies it to the clipboard via `Username` → `navigator.clipboard`. `react-icons` is used throughout for icons.

## Encryption

Credentials are encrypted with AES-GCM (Web Crypto), with the key derived from
the master password via **Argon2id** (memory-hard, `hash-wasm`; params in
`ARGON2_PARAMS`). The crypto primitives live in `src/Utilities/crypto.js` and
the `localStorage` envelope layer in `src/Utilities/vault.js` (v2 envelope
`{ version: 2, kdf: "argon2id", params, salt, iv, ciphertext }` under the
`authorize-me-vault` key). `crypto.js` also keeps `deriveLegacyKey` (PBKDF2,
210k) **solely to read pre-Argon2id v1 vaults** (`{ version: 1, salt, iv,
ciphertext }`); never use it to write new data. `AppContext` owns lock state
(`isLocked`, `isInitialized`) and the `setupPassword` / `unlock` / `lock` /
`resetVault` actions. The derived AES key is **non-extractable and lives only in
a ref — it is never cached**, so a refresh re-locks the vault and the master
password must be re-entered (`saltRef` keeps the persistence effect's envelope
in sync with the in-memory key). `unlock` is version-aware: a v1 vault is
decrypted with PBKDF2 and then **transparently re-sealed as v2 under Argon2id**
(fresh salt) on first unlock. `VaultGate` renders `LockScreen` until unlocked,
then `Home`. The persistence effect in `Context.js` re-encrypts `credentials` on
every change. Export decrypts to plaintext JSON; import parses plaintext JSON
and is re-encrypted on save.

## Gotchas / dead code

- `src/GlobalStore/LoadData.js` is broken, unused scaffolding (references undefined variables). Do not import it.
- In `src/Utilities/Utilities.js`, only `mergeProductList` and `serializeForExport` are wired up. `importData`/`getDownloadURL`/`higlightInList` are dead — `Options.js` defines its own import/export logic.
- `AddItemForm.getObject` still contains leftover `quantity`/`price` cart-like logic that doesn't map to the credential domain; tread carefully when changing form submission.
- `src/Components/SettingsMenu.js` is unused dead code (imported nowhere) and still reads the legacy plaintext `credentials` key directly — do not wire it up without first updating it for the encrypted vault.
