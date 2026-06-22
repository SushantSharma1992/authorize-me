import { argon2id } from "hash-wasm";

const enc = new TextEncoder();
const dec = new TextDecoder();

// Iterations for the legacy PBKDF2 key. Only used to read v1 vaults so they
// can be re-encrypted under Argon2id (see deriveLegacyKey / vault migration).
const LEGACY_PBKDF2_ITERATIONS = 210000;

// Argon2id parameters for new (and upgraded) vaults. Memory-hard, which
// resists GPU/ASIC cracking far better than PBKDF2. These are persisted in the
// vault envelope so a vault can always be re-derived with the params it used.
export const ARGON2_PARAMS = {
  parallelism: 1,
  iterations: 3,
  memorySize: 65536, // KiB == 64 MiB
  hashLength: 32, // 256-bit AES key
};

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

// Import raw key bytes as a non-extractable AES-GCM key. Non-extractable means
// the key cannot be exported from memory (even by injected script), so it is
// never cached anywhere — the vault re-derives it from the master password.
async function importAesKey(rawBytes) {
  return crypto.subtle.importKey(
    "raw",
    rawBytes,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function deriveKey(password, salt, params = ARGON2_PARAMS) {
  const raw = await argon2id({
    password,
    salt,
    parallelism: params.parallelism,
    iterations: params.iterations,
    memorySize: params.memorySize,
    hashLength: params.hashLength,
    outputType: "binary",
  });
  return importAesKey(raw);
}

// Legacy PBKDF2 derivation. Retained solely to decrypt pre-Argon2id (v1)
// vaults during migration; never used to write new data.
export async function deriveLegacyKey(password, salt) {
  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: LEGACY_PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
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
