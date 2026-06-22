import {
  generateSalt,
  deriveKey,
  deriveLegacyKey,
  encrypt,
  decrypt,
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
  await expect(decrypt(envelope, wrongKey)).rejects.toThrow();
});

test("each encryption uses a unique IV", async () => {
  const key = await deriveKey("pw", generateSalt());
  const a = await encrypt({ x: 1 }, key);
  const b = await encrypt({ x: 1 }, key);
  expect(a.iv).not.toEqual(b.iv);
});

test("deriveLegacyKey decrypts data encrypted with a legacy PBKDF2 key", async () => {
  // Migration path: old vaults were encrypted with a PBKDF2-derived key.
  const salt = generateSalt();
  const legacyKey = await deriveLegacyKey("pw", salt);
  const envelope = await encrypt({ v: 42 }, legacyKey);
  expect(await decrypt(envelope, await deriveLegacyKey("pw", salt))).toEqual({
    v: 42,
  });
});

test("Argon2id and legacy PBKDF2 derive distinct keys from the same input", async () => {
  // Proves the new KDF is genuinely different — data sealed under one KDF
  // cannot be opened with the other, so the version flag must drive derivation.
  const salt = generateSalt();
  const argonKey = await deriveKey("pw", salt);
  const legacyKey = await deriveLegacyKey("pw", salt);
  const envelope = await encrypt({ secret: 1 }, argonKey);
  await expect(decrypt(envelope, legacyKey)).rejects.toThrow();
});

test("base64 round-trips bytes", () => {
  const bytes = generateSalt();
  expect([...base64ToBytes(bytesToBase64(bytes))]).toEqual([...bytes]);
});
