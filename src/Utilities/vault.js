export const VAULT_KEY = "authorize-me-vault";
export const LEGACY_KEY = "credentials";

export function isVaultInitialized() {
  return localStorage.getItem(VAULT_KEY) !== null;
}

export function readEnvelope() {
  const raw = localStorage.getItem(VAULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
