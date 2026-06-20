import { serializeForExport } from "./Utilities";

test("serializeForExport produces parseable plaintext JSON of the credentials", () => {
  const creds = [{ id: 1, service: "Google", password: "xyz" }];
  const output = serializeForExport(creds);
  expect(typeof output).toBe("string");
  expect(JSON.parse(output)).toEqual(creds);
});
