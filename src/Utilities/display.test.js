import { avatarColor, hexToRgba, maskPassword, shade } from "./display";

const PALETTE = ["#4285F4", "#1DB954", "#E01E5A", "#A259FF", "#FF9900", "#3FA9F5"];

test("avatarColor returns a palette color and is deterministic", () => {
  const a = avatarColor("Google");
  expect(PALETTE).toContain(a);
  expect(avatarColor("Google")).toBe(a);
});

test("hexToRgba converts a 6-digit hex with alpha", () => {
  expect(hexToRgba("#4285F4", 0.16)).toBe("rgba(66,133,244,0.16)");
});

test("maskPassword clamps bullet count between 6 and 14", () => {
  expect(maskPassword("ab")).toBe("•".repeat(6));
  expect(maskPassword("a".repeat(20))).toBe("•".repeat(14));
  expect(maskPassword("a".repeat(10))).toBe("•".repeat(10));
});

test("shade darkens a hex color by a negative amount, clamping at 0", () => {
  // 66-28=38 (0x26), 133-28=105 (0x69), 244-28=216 (0xd8)
  expect(shade("#4285F4", -28)).toBe("#2669d8");
  // clamps each channel into [0,255]
  expect(shade("#000000", -50)).toBe("#000000");
});
