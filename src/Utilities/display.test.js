import {
  avatarColor,
  hexToRgba,
  passwordStrength,
  maskPassword,
  relativeTime,
} from "./display";

const PALETTE = ["#4285F4", "#1DB954", "#E01E5A", "#A259FF", "#FF9900", "#3FA9F5"];

test("avatarColor returns a palette color and is deterministic", () => {
  const a = avatarColor("Google");
  expect(PALETTE).toContain(a);
  expect(avatarColor("Google")).toBe(a);
});

test("hexToRgba converts a 6-digit hex with alpha", () => {
  expect(hexToRgba("#4285F4", 0.16)).toBe("rgba(66,133,244,0.16)");
});

test("passwordStrength scores weak to strong", () => {
  expect(passwordStrength("abc").label).toBe("Weak");        // score <= 1
  expect(passwordStrength("abcd1234").label).toBe("Fair");   // len>=8 + digit = 2
  expect(passwordStrength("Abcd1234").label).toBe("Good");   // + mixed case = 3
  expect(passwordStrength("Abcd1234!").label).toBe("Strong");// + symbol = 4
});

test("passwordStrength returns matching color and pct", () => {
  expect(passwordStrength("Abcd1234!")).toEqual({
    label: "Strong",
    color: "#4FB477",
    pct: "100%",
  });
});

test("maskPassword clamps bullet count between 6 and 14", () => {
  expect(maskPassword("ab")).toBe("•".repeat(6));
  expect(maskPassword("a".repeat(20))).toBe("•".repeat(14));
  expect(maskPassword("a".repeat(10))).toBe("•".repeat(10));
});

test("relativeTime returns empty string for missing or invalid input", () => {
  expect(relativeTime(undefined)).toBe("");
  expect(relativeTime("")).toBe("");
  expect(relativeTime("not-a-date")).toBe("");
});

test("relativeTime returns 'Just now' for the current time", () => {
  expect(relativeTime(new Date().toISOString())).toBe("Just now");
});

test("relativeTime returns days ago", () => {
  const threeDays = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  expect(relativeTime(threeDays)).toBe("3 days ago");
});
