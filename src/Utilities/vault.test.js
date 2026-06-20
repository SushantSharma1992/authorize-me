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
