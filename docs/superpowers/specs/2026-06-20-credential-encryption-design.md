# Credential Encryption — Design

**Date:** 2026-06-20
**Status:** Approved
**Topic:** Encrypt stored credentials in `authorize-me`

## Problem

`authorize-me` is a client-only password manager with no backend. Credentials are
currently stored as **plaintext JSON** in `localStorage` under the `credentials`
key (loaded/persisted by `src/GlobalStore/Context.js`, seeded from
`src/Assets/mockData.json`). Anyone with access to the browser profile can read
every saved password. The README lists "encrypt everything" as a goal.

## Goals

- Encrypt all credentials at rest so `localStorage` never contains plaintext.
- Provide **zero-knowledge** protection: the encryption key is derived from a
  user-supplied master password and is never written to `localStorage`. The
  derived key is cached only in `sessionStorage` for the lifetime of the tab
  session (the disclosed "remember for session" tradeoff); closing the tab
  clears it. The master password itself is never stored.
- Preserve existing features (search, add/edit/delete, import/export, toasts).
- Migrate existing users' plaintext data on first setup with no data loss.

## Non-Goals (YAGNI)

- Changing the master password after it is set.
- Idle / inactivity auto-lock.
- Multi-vault or multi-user support.
- Server-side sync or recovery (a forgotten master password means data is
  unrecoverable — this is inherent to zero-knowledge and accepted).

## Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Key source | **Master password** | Only design where `localStorage` holds no usable key. True zero-knowledge. |
| Lock policy | **Remember for session** | Derived key cached in `sessionStorage`; refresh in the same tab stays unlocked, closing the tab / new tab re-locks. |
| Backup format | **Decrypted plaintext JSON** | Export/Import stay human-readable and password-independent; the exported file is sensitive and treated as such. |
| Crypto library | **Native Web Crypto (`crypto.subtle`)** | Zero dependencies, audited primitives, async fits the unlock flow. |

## Crypto Parameters

- **Cipher:** AES-GCM, 256-bit. GCM is authenticated, so decrypting with the
  wrong key throws — no separate password verifier is required.
- **Key derivation:** PBKDF2 with SHA-256, **210,000 iterations** (OWASP floor).
- **Salt:** random 16 bytes, generated once at setup, stored in the envelope.
- **IV:** random 12 bytes, generated fresh for **every** encryption, stored
  alongside the ciphertext.
- **Envelope (stored in `localStorage`):**

  ```json
  {
    "version": 1,
    "salt": "<base64>",
    "iv": "<base64>",
    "ciphertext": "<base64>"
  }
  ```

  Stored under a new key `authorize-me-vault`. The legacy plaintext
  `credentials` key is deleted after migration.

## Architecture

Module breakdown (each unit has one purpose and is testable in isolation):

### `src/Utilities/crypto.js` — pure crypto, no React
- `generateSalt()` → `Uint8Array` (16 bytes)
- `deriveKey(password, salt)` → `CryptoKey` (PBKDF2 → AES-GCM key)
- `encrypt(plaintextObj, key)` → `{ iv, ciphertext }` (base64), fresh IV each call
- `decrypt({ iv, ciphertext }, key)` → original object (throws on wrong key)
- `exportRawKey(key)` / `importRawKey(base64)` → for the session cache
- Only place that touches `window.crypto.subtle`.

### `src/Utilities/vault.js` — storage layer
- Knows the `authorize-me-vault` storage key and envelope shape.
- `isVaultInitialized()` → boolean (envelope present?)
- `readEnvelope()` / `writeEnvelope(envelope)`
- `readLegacyPlaintext()` → parses old `credentials` key (or `null`)
- `clearLegacyPlaintext()` → removes old `credentials` key
- `cacheSessionKey(base64)` / `readSessionKey()` / `clearSessionKey()` → wrap
  `sessionStorage` for the "remember for session" behavior.

### Lock state — extend `AppContext` (`src/GlobalStore/Context.js`)
Adds to the existing central context:
- State: `isLocked`, `isInitialized`, in-memory `CryptoKey` (held in a ref, not
  rendered).
- `setupPassword(password)` — first-run: derive key, encrypt current data
  (migrated or empty), write envelope, cache session key, unlock.
- `unlock(password)` — derive key from stored salt, decrypt envelope, populate
  `credentials`, cache session key, unlock. Returns failure on wrong password.
- `lock()` — drop the in-memory key, clear the session key, set `isLocked`.
- On mount: if a session key exists, auto-unlock (decrypt with it); else stay
  locked.

The existing `useEffect` that persists `credentials` is changed: while unlocked,
it encrypts `credentials` with the in-memory key and writes the envelope, instead
of writing plaintext JSON. It must not run while locked (no key, no data).

### `src/Components/LockScreen.js` — gate UI
- First run (`!isInitialized`): "Set a master password" (with confirm field).
- Returning (`isInitialized && isLocked`): "Enter master password".
- Shows "Incorrect password" on a failed unlock; no app crash.

## Data Flow

```
App → Context → (isLocked ? LockScreen : Home)
```

- **First run** (no envelope): set-password screen → `setupPassword()` →
  derive key → encrypt current data → write envelope → unlock → `Home`.
- **Unlock**: enter password → `unlock()` → derive key from stored salt →
  decrypt → populate `credentials` → cache raw key in `sessionStorage` → `Home`.
- **Persist**: edit/add/delete updates `credentials` → `useEffect` encrypts →
  writes envelope.
- **Refresh same tab**: session key present → import key → decrypt → skip prompt.
- **New tab / closed tab**: no session key → locked → prompt.

## Migration

On first `setupPassword()`:
1. If `vault.readLegacyPlaintext()` returns an array, use it as the initial
   credential set (this covers real users with saved data).
2. Otherwise start from the existing mock-data/empty fallback.
3. Encrypt the chosen set into the envelope.
4. `vault.clearLegacyPlaintext()` to remove the old plaintext key.

Result: storage contains only the ciphertext envelope; no plaintext remains.

## Import / Export (`src/Pages/Options.js`)

- **Export**: decrypt current vault in memory → download plaintext JSON in the
  current format. Requires an unlocked vault.
- **Import**: read plaintext JSON file → `mergeProductList(credentials, parsed)`
  (existing util) → set `credentials` → `useEffect` re-encrypts. Requires an
  unlocked vault.
- **Delete Data**: clears `credentials`; the envelope is rewritten as an
  encrypted empty list (vault stays initialized).

## Error Handling

- **Wrong password**: GCM `decrypt` throws → caught in `unlock()` → LockScreen
  shows "Incorrect password". App does not crash.
- **Corrupt / unparseable envelope**: surfaced as an error on the LockScreen
  with an explicit "Reset vault" action (wipes the vault and starts first-run
  setup). Destructive, so it is explicit and confirmed.
- **Clipboard / import parse errors**: keep using the existing toast system.

## Testing

- **`crypto.js` (unit):** round-trip `encrypt`→`decrypt` returns the original
  object; decrypting with a key derived from the wrong password throws; each
  `encrypt` produces a distinct IV.
- **`vault.js` (unit):** envelope read/write, legacy detection/clearing, and
  session-key cache against a mocked `localStorage` / `sessionStorage`.
- **Web Crypto in tests:** jsdom under `react-scripts` may lack
  `crypto.subtle`; if so, wire a polyfill (e.g. Node's `webcrypto`) in
  `src/setupTests.js`. Confirm during implementation.

## Affected Files

- New: `src/Utilities/crypto.js`, `src/Utilities/vault.js`,
  `src/Components/LockScreen.js`.
- Changed: `src/GlobalStore/Context.js` (lock state + encrypted persistence),
  `src/Pages/Home.js` or `src/App.js` (render gate), `src/Pages/Options.js`
  (decrypt on export, re-encrypt on import), `src/setupTests.js` (polyfill if
  needed), `README.md` (mark "encrypt everything" done).
