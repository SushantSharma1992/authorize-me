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
  await expect(decrypt(envelope, wrongKey)).rejects.toThrow();
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
