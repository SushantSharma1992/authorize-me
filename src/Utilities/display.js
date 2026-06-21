const PALETTE = ["#4285F4", "#1DB954", "#E01E5A", "#A259FF", "#FF9900", "#3FA9F5"];

export function avatarColor(name) {
  const s = String(name || "");
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

export function hexToRgba(hex, a) {
  const h = String(hex).replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(f, 16);
  return "rgba(" + ((n >> 16) & 255) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a + ")";
}

export function passwordStrength(pw) {
  const p = String(pw || "");
  let s = 0;
  if (p.length >= 8) s++;
  if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  if (s <= 1) return { label: "Weak", color: "#E5675F", pct: "25%" };
  if (s === 2) return { label: "Fair", color: "#E0A93C", pct: "55%" };
  if (s === 3) return { label: "Good", color: "#3FA9F5", pct: "80%" };
  return { label: "Strong", color: "#4FB477", pct: "100%" };
}

export function maskPassword(pw) {
  const len = Math.min(Math.max(String(pw || "").length, 6), 14);
  return "•".repeat(len);
}

export function relativeTime(value) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  const ms = d.getTime();
  if (Number.isNaN(ms)) return "";
  const diff = Date.now() - ms;
  if (diff < 0) return "Just now";
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return min + (min === 1 ? " minute ago" : " minutes ago");
  const hr = Math.floor(min / 60);
  if (hr < 24) return hr + (hr === 1 ? " hour ago" : " hours ago");
  const day = Math.floor(hr / 24);
  if (day < 7) return day + (day === 1 ? " day ago" : " days ago");
  const wk = Math.floor(day / 7);
  if (day < 30) return wk + (wk === 1 ? " week ago" : " weeks ago");
  const mo = Math.floor(day / 30);
  return mo + (mo === 1 ? " month ago" : " months ago");
}
