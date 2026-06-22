import { createContext, useEffect, useRef, useState } from "react";
import mockData from "../Assets/mockData.json";
import * as cryptoUtil from "../Utilities/crypto";
import * as vault from "../Utilities/vault";

export const AppContext = createContext();

// Build the persisted envelope for the currently held key/salt. The key is
// always Argon2id-derived, so every write is a v2 envelope.
function buildEnvelope(saltB64, iv, ciphertext) {
  return {
    version: 2,
    kdf: "argon2id",
    params: cryptoUtil.ARGON2_PARAMS,
    salt: saltB64,
    iv,
    ciphertext,
  };
}

const Context = ({ children }) => {
  const [credentials, setCredentials] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState("");
  const [isInitialized, setIsInitialized] = useState(vault.isVaultInitialized());
  const [isLocked, setIsLocked] = useState(true);
  const keyRef = useRef(null);
  // Base64 salt that keyRef was derived from; the persist effect re-uses it so
  // the written envelope always matches the in-memory key.
  const saltRef = useRef(null);

  // No session-key cache: the derived key lives only in memory, so a refresh
  // re-locks the vault and the master password must be re-entered.

  // Persist credentials (encrypted) whenever they change while unlocked.
  useEffect(() => {
    if (isLocked || !keyRef.current || !saltRef.current) return;
    let cancelled = false;
    const persist = async () => {
      try {
        const { iv, ciphertext } = await cryptoUtil.encrypt(
          credentials,
          keyRef.current
        );
        if (!cancelled) {
          vault.writeEnvelope(buildEnvelope(saltRef.current, iv, ciphertext));
        }
      } catch (err) {
        console.error("persist failed:", err);
      }
    };
    persist();
    return () => {
      cancelled = true;
    };
  }, [credentials, isLocked]);

  const setupPassword = async (password) => {
    const salt = cryptoUtil.generateSalt();
    const saltB64 = cryptoUtil.bytesToBase64(salt);
    const key = await cryptoUtil.deriveKey(password, salt);
    const initial = vault.readLegacyPlaintext() || mockData.myCredentials;
    const { iv, ciphertext } = await cryptoUtil.encrypt(initial, key);
    vault.writeEnvelope(buildEnvelope(saltB64, iv, ciphertext));
    vault.clearLegacyPlaintext();
    keyRef.current = key;
    saltRef.current = saltB64;
    setCredentials(initial);
    setIsInitialized(true);
    setIsLocked(false);
  };

  // Re-seal the decrypted data under a fresh Argon2id key. Used to migrate a
  // legacy (PBKDF2) vault the first time it is unlocked.
  const reseal = async (password, data) => {
    const salt = cryptoUtil.generateSalt();
    const saltB64 = cryptoUtil.bytesToBase64(salt);
    const key = await cryptoUtil.deriveKey(password, salt);
    const { iv, ciphertext } = await cryptoUtil.encrypt(data, key);
    vault.writeEnvelope(buildEnvelope(saltB64, iv, ciphertext));
    keyRef.current = key;
    saltRef.current = saltB64;
  };

  const unlock = async (password) => {
    const envelope = vault.readEnvelope();
    if (!envelope) return false;
    try {
      const sealed = { iv: envelope.iv, ciphertext: envelope.ciphertext };
      const saltBytes = cryptoUtil.base64ToBytes(envelope.salt);

      if (envelope.version >= 2 && envelope.kdf === "argon2id") {
        const key = await cryptoUtil.deriveKey(
          password,
          saltBytes,
          envelope.params
        );
        const data = await cryptoUtil.decrypt(sealed, key);
        keyRef.current = key;
        saltRef.current = envelope.salt;
        setCredentials(data);
      } else {
        // Legacy v1 vault: decrypt with PBKDF2, then upgrade to Argon2id.
        const legacyKey = await cryptoUtil.deriveLegacyKey(password, saltBytes);
        const data = await cryptoUtil.decrypt(sealed, legacyKey);
        await reseal(password, data);
        setCredentials(data);
      }

      setIsLocked(false);
      return true;
    } catch {
      return false;
    }
  };

  const lock = () => {
    keyRef.current = null;
    saltRef.current = null;
    setCredentials([]);
    setIsLocked(true);
  };

  const resetVault = () => {
    vault.clearVault();
    keyRef.current = null;
    saltRef.current = null;
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
