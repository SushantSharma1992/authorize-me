# Credential Encryption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Encrypt all stored credentials at rest using a user master password, so `localStorage` never holds plaintext.

**Architecture:** A pure crypto module (Web Crypto: AES-GCM + PBKDF2) and a storage/vault module sit beneath the existing `AppContext`. The context gains lock state (`isLocked`, `isInitialized`) and async `setupPassword`/`unlock`/`lock`/`resetVault` actions; a `VaultGate` renders a `LockScreen` until the vault is unlocked, after which credentials are decrypted into memory and re-encrypted on every change.

**Tech Stack:** React 18 (Create React App / react-scripts 5), native Web Crypto API, Jest + React Testing Library + `@testing-library/user-event` v13.

## Global Constraints

- **No new runtime dependencies** — use the native Web Crypto API (`crypto.subtle`), not a third-party crypto library.
- **Cipher:** AES-GCM, 256-bit. **KDF:** PBKDF2-SHA-256, **210000** iterations. **Salt:** 16 random bytes. **IV:** 12 random bytes, fresh per encryption.
- **Envelope shape (verbatim):** `{ version: 1, salt, iv, ciphertext }` — `salt`/`iv`/`ciphertext` are base64 strings.
- **Storage keys (verbatim):** vault = `authorize-me-vault`; legacy plaintext = `credentials`; session key cache = `authorize-me-session-key`.
- **Zero-knowledge:** the master password is never stored; the derived key is cached only in `sessionStorage` (cleared on tab close / `lock`).
- **Test command:** `npm test -- --watchAll=false <path>` (single run, no watch mode).

---

### Task 1: Crypto primitives (`crypto.js`)

**Files:**
- Create: `src/Utilities/crypto.js`
- Test: `src/Utilities/crypto.test.js`
- Modify: `src/setupTests.js` (Web Crypto + TextEncoder polyfill for jsdom)

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `generateSalt(): Uint8Array` (16 bytes)
  - `deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey>`
  - `encrypt(data: object, key: CryptoKey): Promise<{ iv: string, ciphertext: string }>` (base64)
  - `decrypt(envelope: { iv: string, ciphertext: string }, key: CryptoKey): Promise<object>` (throws on wrong key)
  - `exportRawKey(key: CryptoKey): Promise<string>` (base64)
  - `importRawKey(b64: string): Promise<CryptoKey>`
  - `bytesToBase64(bytes: Uint8Array): string`
  - `base64ToBytes(b64: string): Uint8Array`

- [ ] **Step 1: Add the jsdom Web Crypto polyfill (test infrastructure)**

Replace the contents of `src/setupTests.js` with:

```js
// jest-dom adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// jsdom (jest's test env) has no Web Crypto or TextEncoder. Polyfill from Node.
import { webcrypto } from 'crypto';
import { TextEncoder, TextDecoder } from 'util';

// defineProperty (not plain assignment) in case the env exposes a read-only `crypto`.
if (!global.crypto || !global.crypto.subtle) {
  Object.defineProperty(global, 'crypto', {
    value: webcrypto,
    configurable: true,
    writable: true,
  });
}
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
```

If `crypto.subtle` is still undefined in tests after this, confirm the Node version exposes `webcrypto` (Node 16+) and that the jsdom test environment isn't shadowing the global.

- [ ] **Step 2: Write the failing tests**

Create `src/Utilities/crypto.test.js`:

```js
import {
  generateSalt,
  deriveKey,
  encrypt,
  decrypt,
  exportRawKey,
  importRawKey,
  bytesToBase64,
  base64ToBytes,
} from "./crypto";

test("encrypt then decrypt returns the original object", async () => {
  const key = await deriveKey("hunter2", generateSalt());
  const data = [{ id: 1, service: "Google", password: "xyz" }];
  const envelope = await encrypt(data, key);
  expect(await decrypt(envelope, key)).toEqual(data);
});

test("decrypting with the wrong password throws", async () => {
  const salt = generateSalt();
  const rightKey = await deriveKey("right", salt);
  const wrongKey = await deriveKey("wrong", salt);
  const envelope = await encrypt({ a: 1 }, rightKey);
  await expect(decrypt(envelope, wrongKey)).rejects.toBeDefined();
});

test("each encryption uses a unique IV", async () => {
  const key = await deriveKey("pw", generateSalt());
  const a = await encrypt({ x: 1 }, key);
  const b = await encrypt({ x: 1 }, key);
  expect(a.iv).not.toEqual(b.iv);
});

test("an exported key can be re-imported and still decrypts", async () => {
  const key = await deriveKey("pw", generateSalt());
  const envelope = await encrypt({ v: 42 }, key);
  const reimported = await importRawKey(await exportRawKey(key));
  expect(await decrypt(envelope, reimported)).toEqual({ v: 42 });
});

test("base64 round-trips bytes", () => {
  const bytes = generateSalt();
  expect([...base64ToBytes(bytesToBase64(bytes))]).toEqual([...bytes]);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test -- --watchAll=false src/Utilities/crypto.test.js`
Expected: FAIL — `Cannot find module './crypto'`.

- [ ] **Step 4: Implement `crypto.js`**

Create `src/Utilities/crypto.js`:

```js
const enc = new TextEncoder();
const dec = new TextDecoder();

const PBKDF2_ITERATIONS = 210000;

export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

export function bytesToBase64(bytes) {
  const arr = new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i++) {
    binary += String.fromCharCode(arr[i]);
  }
  return btoa(binary);
}

export function base64ToBytes(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export async function deriveKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true, // extractable: needed to cache the raw key for the tab session
    ["encrypt", "decrypt"]
  );
}

export async function encrypt(data, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(JSON.stringify(data))
  );
  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

export async function decrypt({ iv, ciphertext }, key) {
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(iv) },
    key,
    base64ToBytes(ciphertext)
  );
  return JSON.parse(dec.decode(plain));
}

export async function exportRawKey(key) {
  const raw = await crypto.subtle.exportKey("raw", key);
  return bytesToBase64(new Uint8Array(raw));
}

export async function importRawKey(b64) {
  return crypto.subtle.importKey(
    "raw",
    base64ToBytes(b64),
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test -- --watchAll=false src/Utilities/crypto.test.js`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add src/Utilities/crypto.js src/Utilities/crypto.test.js src/setupTests.js
git commit -m "feat: add Web Crypto encrypt/decrypt primitives"
```

---

### Task 2: Vault storage layer (`vault.js`)

**Files:**
- Create: `src/Utilities/vault.js`
- Test: `src/Utilities/vault.test.js`

**Interfaces:**
- Consumes: nothing (wraps `localStorage` / `sessionStorage`).
- Produces:
  - Constants `VAULT_KEY`, `LEGACY_KEY`, `SESSION_KEY`
  - `isVaultInitialized(): boolean`
  - `readEnvelope(): object | null`
  - `writeEnvelope(envelope: object): void`
  - `clearVault(): void`
  - `readLegacyPlaintext(): Array | null` (non-empty array, else null)
  - `clearLegacyPlaintext(): void`
  - `cacheSessionKey(b64: string): void`
  - `readSessionKey(): string | null`
  - `clearSessionKey(): void`

- [ ] **Step 1: Write the failing tests**

Create `src/Utilities/vault.test.js`:

```js
import {
  LEGACY_KEY,
  isVaultInitialized,
  readEnvelope,
  writeEnvelope,
  clearVault,
  readLegacyPlaintext,
  clearLegacyPlaintext,
  cacheSessionKey,
  readSessionKey,
  clearSessionKey,
} from "./vault";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test("isVaultInitialized reflects presence of an envelope", () => {
  expect(isVaultInitialized()).toBe(false);
  writeEnvelope({ version: 1, salt: "s", iv: "i", ciphertext: "c" });
  expect(isVaultInitialized()).toBe(true);
});

test("writeEnvelope / readEnvelope round-trip", () => {
  const env = { version: 1, salt: "s", iv: "i", ciphertext: "c" };
  writeEnvelope(env);
  expect(readEnvelope()).toEqual(env);
});

test("clearVault removes the envelope", () => {
  writeEnvelope({ version: 1, salt: "s", iv: "i", ciphertext: "c" });
  clearVault();
  expect(isVaultInitialized()).toBe(false);
});

test("readLegacyPlaintext returns a non-empty array or null", () => {
  expect(readLegacyPlaintext()).toBeNull();
  localStorage.setItem(LEGACY_KEY, JSON.stringify([{ id: 1 }]));
  expect(readLegacyPlaintext()).toEqual([{ id: 1 }]);
  localStorage.setItem(LEGACY_KEY, JSON.stringify([]));
  expect(readLegacyPlaintext()).toBeNull();
});

test("clearLegacyPlaintext removes the legacy key", () => {
  localStorage.setItem(LEGACY_KEY, JSON.stringify([{ id: 1 }]));
  clearLegacyPlaintext();
  expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
});

test("session key cache round-trips and clears", () => {
  expect(readSessionKey()).toBeNull();
  cacheSessionKey("abc");
  expect(readSessionKey()).toBe("abc");
  clearSessionKey();
  expect(readSessionKey()).toBeNull();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --watchAll=false src/Utilities/vault.test.js`
Expected: FAIL — `Cannot find module './vault'`.

- [ ] **Step 3: Implement `vault.js`**

Create `src/Utilities/vault.js`:

```js
export const VAULT_KEY = "authorize-me-vault";
export const LEGACY_KEY = "credentials";
export const SESSION_KEY = "authorize-me-session-key";

export function isVaultInitialized() {
  return localStorage.getItem(VAULT_KEY) !== null;
}

export function readEnvelope() {
  const raw = localStorage.getItem(VAULT_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function writeEnvelope(envelope) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(envelope));
}

export function clearVault() {
  localStorage.removeItem(VAULT_KEY);
}

export function readLegacyPlaintext() {
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLegacyPlaintext() {
  localStorage.removeItem(LEGACY_KEY);
}

export function cacheSessionKey(b64) {
  sessionStorage.setItem(SESSION_KEY, b64);
}

export function readSessionKey() {
  return sessionStorage.getItem(SESSION_KEY);
}

export function clearSessionKey() {
  sessionStorage.removeItem(SESSION_KEY);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --watchAll=false src/Utilities/vault.test.js`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/Utilities/vault.js src/Utilities/vault.test.js
git commit -m "feat: add vault storage layer for encrypted envelope"
```

---

### Task 3: Lock state + encrypted persistence in `Context.js`

**Files:**
- Modify: `src/GlobalStore/Context.js` (full rewrite of the provider)
- Test: `src/GlobalStore/Context.test.js`

**Interfaces:**
- Consumes: all exports of `crypto.js` and `vault.js` (Tasks 1–2).
- Produces — `AppContext` value gains:
  - `isLocked: boolean`, `isInitialized: boolean`
  - `setupPassword(password: string): Promise<void>`
  - `unlock(password: string): Promise<boolean>` (true on success, false on wrong password)
  - `lock(): void`
  - `resetVault(): void`
  - (existing `credentials`, `setCredentials`, `showToast`, `setShowToast`, `toastNotification`, `setToastNotification` remain)

- [ ] **Step 1: Write the failing tests**

Create `src/GlobalStore/Context.test.js`:

```js
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";
import Context, { AppContext } from "./Context";
import { isVaultInitialized, readEnvelope, LEGACY_KEY } from "../Utilities/vault";

function Harness() {
  const { isLocked, credentials, setupPassword, unlock, lock } =
    useContext(AppContext);
  return (
    <div>
      <span data-testid="locked">{String(isLocked)}</span>
      <span data-testid="count">{credentials.length}</span>
      <button onClick={() => setupPassword("pw123")}>setup</button>
      <button onClick={() => unlock("pw123")}>unlock-right</button>
      <button onClick={() => unlock("nope")}>unlock-wrong</button>
      <button onClick={() => lock()}>lock</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test("setupPassword initializes an encrypted vault and unlocks", async () => {
  render(
    <Context>
      <Harness />
    </Context>
  );
  expect(screen.getByTestId("locked").textContent).toBe("true");
  await userEvent.click(screen.getByText("setup"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("false")
  );
  expect(isVaultInitialized()).toBe(true);
  // Envelope must hold ciphertext, not plaintext service names.
  expect(JSON.stringify(readEnvelope())).not.toContain("Google");
});

test("setupPassword migrates and erases legacy plaintext", async () => {
  localStorage.setItem(
    LEGACY_KEY,
    JSON.stringify([{ id: 9, service: "Legacy" }])
  );
  render(
    <Context>
      <Harness />
    </Context>
  );
  await userEvent.click(screen.getByText("setup"));
  await waitFor(() =>
    expect(screen.getByTestId("count").textContent).toBe("1")
  );
  expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
});

test("unlock succeeds with the right password and fails with the wrong one", async () => {
  render(
    <Context>
      <Harness />
    </Context>
  );
  await userEvent.click(screen.getByText("setup"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("false")
  );

  await userEvent.click(screen.getByText("lock"));
  expect(screen.getByTestId("locked").textContent).toBe("true");

  await userEvent.click(screen.getByText("unlock-wrong"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("true")
  );

  await userEvent.click(screen.getByText("unlock-right"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("false")
  );
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --watchAll=false src/GlobalStore/Context.test.js`
Expected: FAIL — current `Context` has no `isLocked`/`setupPassword`; `locked` shows `undefined`/`true` mismatch and `setup` button does nothing.

- [ ] **Step 3: Rewrite `Context.js`**

Replace the entire contents of `src/GlobalStore/Context.js` with:

```jsx
import { createContext, useEffect, useRef, useState } from "react";
import mockData from "../Assets/mockData.json";
import * as cryptoUtil from "../Utilities/crypto";
import * as vault from "../Utilities/vault";

export const AppContext = createContext();

const Context = ({ children }) => {
  const [credentials, setCredentials] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState("");
  const [isInitialized, setIsInitialized] = useState(vault.isVaultInitialized());
  const [isLocked, setIsLocked] = useState(true);
  const keyRef = useRef(null);

  // Auto-unlock from a cached session key (refresh within the same tab).
  useEffect(() => {
    const restore = async () => {
      const cached = vault.readSessionKey();
      const envelope = vault.readEnvelope();
      if (!cached || !envelope) return;
      try {
        const key = await cryptoUtil.importRawKey(cached);
        const data = await cryptoUtil.decrypt(
          { iv: envelope.iv, ciphertext: envelope.ciphertext },
          key
        );
        keyRef.current = key;
        setCredentials(data);
        setIsLocked(false);
      } catch {
        vault.clearSessionKey();
      }
    };
    restore();
  }, []);

  // Persist credentials (encrypted) whenever they change while unlocked.
  useEffect(() => {
    if (isLocked || !keyRef.current) return;
    const persist = async () => {
      const envelope = vault.readEnvelope();
      const { iv, ciphertext } = await cryptoUtil.encrypt(
        credentials,
        keyRef.current
      );
      vault.writeEnvelope({ version: 1, salt: envelope.salt, iv, ciphertext });
    };
    persist();
  }, [credentials, isLocked]);

  const setupPassword = async (password) => {
    const salt = cryptoUtil.generateSalt();
    const key = await cryptoUtil.deriveKey(password, salt);
    const initial = vault.readLegacyPlaintext() || mockData.myCredentials;
    const { iv, ciphertext } = await cryptoUtil.encrypt(initial, key);
    vault.writeEnvelope({
      version: 1,
      salt: cryptoUtil.bytesToBase64(salt),
      iv,
      ciphertext,
    });
    vault.clearLegacyPlaintext();
    keyRef.current = key;
    setCredentials(initial);
    setIsInitialized(true);
    setIsLocked(false);
    vault.cacheSessionKey(await cryptoUtil.exportRawKey(key));
  };

  const unlock = async (password) => {
    const envelope = vault.readEnvelope();
    if (!envelope) return false;
    try {
      const key = await cryptoUtil.deriveKey(
        password,
        cryptoUtil.base64ToBytes(envelope.salt)
      );
      const data = await cryptoUtil.decrypt(
        { iv: envelope.iv, ciphertext: envelope.ciphertext },
        key
      );
      keyRef.current = key;
      setCredentials(data);
      setIsLocked(false);
      vault.cacheSessionKey(await cryptoUtil.exportRawKey(key));
      return true;
    } catch {
      return false;
    }
  };

  const lock = () => {
    keyRef.current = null;
    vault.clearSessionKey();
    setCredentials([]);
    setIsLocked(true);
  };

  const resetVault = () => {
    vault.clearVault();
    vault.clearSessionKey();
    keyRef.current = null;
    setCredentials([]);
    setIsInitialized(false);
    setIsLocked(true);
  };

  return (
    <AppContext.Provider
      value={{
        showToast,
        setShowToast,
        toastNotification,
        setToastNotification,
        credentials,
        setCredentials,
        isLocked,
        isInitialized,
        setupPassword,
        unlock,
        lock,
        resetVault,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default Context;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --watchAll=false src/GlobalStore/Context.test.js`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/GlobalStore/Context.js src/GlobalStore/Context.test.js
git commit -m "feat: add lock state and encrypted persistence to context"
```

---

### Task 4: Lock screen UI (`LockScreen.js`)

**Files:**
- Create: `src/Components/LockScreen.js`
- Test: `src/Components/LockScreen.test.js`
- Modify: `src/Styles/Styles.css` (append lock-screen styles)

**Interfaces:**
- Consumes: `AppContext` — `isInitialized`, `setupPassword`, `unlock`, `resetVault` (Task 3).
- Produces: default-exported `LockScreen` React component.

- [ ] **Step 1: Write the failing tests**

Create `src/Components/LockScreen.test.js`:

```js
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Context from "../GlobalStore/Context";
import LockScreen from "./LockScreen";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

function renderLockScreen() {
  render(
    <Context>
      <LockScreen />
    </Context>
  );
}

async function createVault() {
  await userEvent.type(screen.getByLabelText("Master password"), "pw123");
  await userEvent.type(screen.getByLabelText("Confirm password"), "pw123");
  await userEvent.click(screen.getByText("Create vault"));
}

test("first run shows the set-password form and creates a vault", async () => {
  renderLockScreen();
  expect(screen.getByText("Set a master password")).toBeInTheDocument();
  await createVault();
  await waitFor(() =>
    expect(localStorage.getItem("authorize-me-vault")).not.toBeNull()
  );
});

test("mismatched passwords show an error", async () => {
  renderLockScreen();
  await userEvent.type(screen.getByLabelText("Master password"), "pw123");
  await userEvent.type(screen.getByLabelText("Confirm password"), "different");
  await userEvent.click(screen.getByText("Create vault"));
  expect(
    await screen.findByText("Passwords do not match.")
  ).toBeInTheDocument();
});

test("a wrong password on unlock shows an error", async () => {
  renderLockScreen();
  await createVault();
  const unlockBtn = await screen.findByText("Unlock");
  const input = screen.getByLabelText("Master password");
  await userEvent.clear(input);
  await userEvent.type(input, "wrong");
  await userEvent.click(unlockBtn);
  expect(await screen.findByText("Incorrect password.")).toBeInTheDocument();
});

test("reset vault clears storage and returns to setup", async () => {
  renderLockScreen();
  await createVault();
  await screen.findByText("Unlock");
  jest.spyOn(window, "confirm").mockReturnValue(true);
  await userEvent.click(screen.getByText("Reset vault (erase all data)"));
  expect(
    await screen.findByText("Set a master password")
  ).toBeInTheDocument();
  expect(localStorage.getItem("authorize-me-vault")).toBeNull();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- --watchAll=false src/Components/LockScreen.test.js`
Expected: FAIL — `Cannot find module './LockScreen'`.

- [ ] **Step 3: Implement `LockScreen.js`**

Create `src/Components/LockScreen.js`:

```jsx
import React, { useContext, useState } from "react";
import { AppContext } from "../GlobalStore/Context";

const LockScreen = () => {
  const { isInitialized, setupPassword, unlock, resetVault } =
    useContext(AppContext);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isInitialized) {
      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      await setupPassword(password);
    } else {
      const ok = await unlock(password);
      if (!ok) {
        setError("Incorrect password.");
        setPassword("");
      }
    }
  };

  const onReset = () => {
    if (window.confirm("Erase all saved credentials and start over?")) {
      resetVault();
      setPassword("");
      setConfirm("");
      setError("");
    }
  };

  return (
    <div className="lockscreen-container">
      <form onSubmit={onSubmit} className="lockscreen-form">
        <h2>
          {isInitialized ? "Enter master password" : "Set a master password"}
        </h2>
        <input
          type="password"
          aria-label="Master password"
          placeholder="Master password"
          className="input_class padding-md font-xl"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {!isInitialized && (
          <input
            type="password"
            aria-label="Confirm password"
            placeholder="Confirm password"
            className="input_class padding-md font-xl"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        )}
        {error && <div className="lockscreen-error">{error}</div>}
        <button type="submit" className="button_primary full-width font-xl">
          {isInitialized ? "Unlock" : "Create vault"}
        </button>
        {isInitialized && (
          <button
            type="button"
            className="lockscreen-reset"
            onClick={onReset}
          >
            Reset vault (erase all data)
          </button>
        )}
      </form>
    </div>
  );
};

export default LockScreen;
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- --watchAll=false src/Components/LockScreen.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Append lock-screen styles**

Add to the end of `src/Styles/Styles.css`:

```css
.lockscreen-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.lockscreen-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 320px;
  max-width: 90vw;
}
.lockscreen-error {
  color: #d33;
  font-size: 0.9rem;
}
.lockscreen-reset {
  background: none;
  border: none;
  color: #888;
  text-decoration: underline;
  cursor: pointer;
  font-size: 0.8rem;
}
```

- [ ] **Step 6: Commit**

```bash
git add src/Components/LockScreen.js src/Components/LockScreen.test.js src/Styles/Styles.css
git commit -m "feat: add lock screen UI for setup, unlock, and reset"
```

---

### Task 5: Gate the app behind the lock screen (`App.js`)

**Files:**
- Create: `src/Components/VaultGate.js`
- Modify: `src/App.js`
- Modify: `src/App.test.js` (replace the stale CRA "learn react" test)

**Interfaces:**
- Consumes: `AppContext.isLocked` (Task 3), `LockScreen` (Task 4), existing `Home`.
- Produces: default-exported `VaultGate` rendering `LockScreen` when locked, `Home` when unlocked.

- [ ] **Step 1: Write the failing test**

Replace the entire contents of `src/App.test.js` with:

```js
import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test("renders the lock screen when no vault exists", () => {
  render(<App />);
  expect(screen.getByText("Set a master password")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --watchAll=false src/App.test.js`
Expected: FAIL — `App` currently renders `Home` directly, so "Set a master password" is not found.

- [ ] **Step 3: Create the gate and wire it into `App.js`**

Create `src/Components/VaultGate.js`:

```jsx
import React, { useContext } from "react";
import { AppContext } from "../GlobalStore/Context";
import Home from "../Pages/Home";
import LockScreen from "./LockScreen";

const VaultGate = () => {
  const { isLocked } = useContext(AppContext);
  return isLocked ? <LockScreen /> : <Home />;
};

export default VaultGate;
```

Replace the entire contents of `src/App.js` with:

```jsx
import "./App.css";
import VaultGate from "./Components/VaultGate";
import Context from "./GlobalStore/Context";
import "./Styles/Styles.css";

function App() {
  return (
    <div className="App App-header">
      <Context>
        <VaultGate />
      </Context>
    </div>
  );
}

export default App;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --watchAll=false src/App.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/Components/VaultGate.js src/App.js src/App.test.js
git commit -m "feat: gate app behind lock screen until vault is unlocked"
```

---

### Task 6: Plaintext-JSON export from in-memory credentials (`Options.js`)

**Files:**
- Modify: `src/Utilities/Utilities.js` (add `serializeForExport`)
- Modify: `src/Pages/Options.js` (export uses decrypted in-memory credentials)
- Test: `src/Utilities/Utilities.test.js`

**Why:** With encryption, `localStorage` holds ciphertext. Export must serialize the decrypted `credentials` already in context so the backup file stays plaintext JSON. Import is unchanged — `loadCredentials` → `setCredentials` → the Task 3 persistence effect re-encrypts automatically.

**Interfaces:**
- Consumes: `AppContext.credentials` (already decrypted in memory).
- Produces: `serializeForExport(credentials: Array): string` in `Utilities.js`.

- [ ] **Step 1: Write the failing test**

Create `src/Utilities/Utilities.test.js`:

```js
import { serializeForExport } from "./Utilities";

test("serializeForExport produces parseable plaintext JSON of the credentials", () => {
  const creds = [{ id: 1, service: "Google", password: "xyz" }];
  const output = serializeForExport(creds);
  expect(typeof output).toBe("string");
  expect(JSON.parse(output)).toEqual(creds);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --watchAll=false src/Utilities/Utilities.test.js`
Expected: FAIL — `serializeForExport` is not exported.

- [ ] **Step 3: Add `serializeForExport` to `Utilities.js`**

Add this export to `src/Utilities/Utilities.js` (place it above `mergeProductList`):

```js
export const serializeForExport = (credentials) =>
  JSON.stringify(credentials, null, 2);
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- --watchAll=false src/Utilities/Utilities.test.js`
Expected: PASS (1 test).

- [ ] **Step 5: Wire `Options.js` export to in-memory credentials**

In `src/Pages/Options.js`:

1. Update the import from Utilities to include the new helper:

```jsx
import { mergeProductList, serializeForExport } from "../Utilities/Utilities";
```

2. Replace the body of `downloadJsonData` so it serializes the decrypted in-memory `credentials` (which is already destructured from `AppContext` in this file) instead of reading the now-encrypted `localStorage`:

```jsx
  const downloadJsonData = (e) => {
    e.preventDefault();
    const output = serializeForExport(credentials);
    const blob = new Blob([output]);
    fileDownloadURL = URL.createObjectURL(blob);
    setDownloadUrl(fileDownloadURL);
  };
```

3. Remove the now-unused `SavedData` import if nothing else in the file references it (check first: it was only used by the old `downloadJsonData`).

- [ ] **Step 6: Run the full test suite to verify nothing regressed**

Run: `npm test -- --watchAll=false`
Expected: PASS (all suites).

- [ ] **Step 7: Commit**

```bash
git add src/Utilities/Utilities.js src/Utilities/Utilities.test.js src/Pages/Options.js
git commit -m "feat: export decrypted credentials as plaintext JSON"
```

---

### Task 7: Update docs (README + CLAUDE.md)

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

**Interfaces:** none (documentation only).

- [ ] **Step 1: Mark roadmap items done in `README.md`**

Replace the contents of `README.md` with:

```
[] make PWA
[x] encrypt everything
[x] show password
```

- [ ] **Step 2: Update the encryption note in `CLAUDE.md`**

In `CLAUDE.md`, replace the plaintext warning blockquote:

```
> Note: credentials are currently stored in plaintext in `localStorage`. Encryption is a known unfinished goal (see `README.md`).
```

with:

```
> Credentials are encrypted at rest. The vault is unlocked with a master password (see "Encryption" below); `localStorage` holds only the ciphertext envelope.
```

- [ ] **Step 3: Add an "Encryption" subsection to `CLAUDE.md`**

Add this after the Architecture section in `CLAUDE.md`:

```markdown
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
```

- [ ] **Step 4: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: mark encryption done and document the vault"
```

---

## Self-Review Notes

- **Spec coverage:** master-password key source (Tasks 1, 3); remember-for-session via `sessionStorage` key cache + auto-unlock (Tasks 2, 3); plaintext-JSON export/import (Task 6); AES-GCM/PBKDF2/210k/16-byte salt/12-byte IV envelope (Task 1, Global Constraints); migration + legacy deletion (Task 3); LockScreen + error handling + reset-vault escape hatch (Task 4); render gate (Task 5); jsdom Web Crypto polyfill for testing (Task 1); README/CLAUDE.md docs (Task 7). Out-of-scope items (change password, idle auto-lock) intentionally absent.
- **Type consistency:** `crypto.js` and `vault.js` signatures used by `Context.js` match their definitions; envelope shape `{ version, salt, iv, ciphertext }` is identical across `encrypt`/`writeEnvelope`/`readEnvelope`. `unlock` returns `boolean`, consumed as such in `LockScreen`.
- **No placeholders:** every code and test step contains complete content.
