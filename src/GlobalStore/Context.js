import { createContext, useEffect, useRef, useState } from "react";
import mockData from "../Assets/mockData.json";
import * as cryptoUtil from "../Utilities/crypto";
import * as vault from "../Utilities/vault";

export const AppContext = createContext();

const Context = ({ children }) => {
  const [credentials, setCredentials] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastNotification, setToastNotification] = useState("");
  const [isInitialized, setIsInitialized] = useState(vault.isVaultInitialized());
  const [isLocked, setIsLocked] = useState(true);
  const keyRef = useRef(null);

  // Auto-unlock from a cached session key (refresh within the same tab).
  useEffect(() => {
    const restore = async () => {
      const cached = vault.readSessionKey();
      const envelope = vault.readEnvelope();
      if (!cached || !envelope) return;
      try {
        const key = await cryptoUtil.importRawKey(cached);
        const data = await cryptoUtil.decrypt(
          { iv: envelope.iv, ciphertext: envelope.ciphertext },
          key
        );
        keyRef.current = key;
        setCredentials(data);
        setIsLocked(false);
      } catch {
        vault.clearSessionKey();
      }
    };
    restore();
  }, []);

  // Persist credentials (encrypted) whenever they change while unlocked.
  useEffect(() => {
    if (isLocked || !keyRef.current) return;
    let cancelled = false;
    const persist = async () => {
      try {
        const envelope = vault.readEnvelope();
        if (!envelope) return;
        const { iv, ciphertext } = await cryptoUtil.encrypt(
          credentials,
          keyRef.current
        );
        if (!cancelled) {
          vault.writeEnvelope({ version: 1, salt: envelope.salt, iv, ciphertext });
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
    const key = await cryptoUtil.deriveKey(password, salt);
    const initial = vault.readLegacyPlaintext() || mockData.myCredentials;
    const { iv, ciphertext } = await cryptoUtil.encrypt(initial, key);
    vault.writeEnvelope({
      version: 1,
      salt: cryptoUtil.bytesToBase64(salt),
      iv,
      ciphertext,
    });
    vault.clearLegacyPlaintext();
    keyRef.current = key;
    setCredentials(initial);
    setIsInitialized(true);
    setIsLocked(false);
    vault.cacheSessionKey(await cryptoUtil.exportRawKey(key));
  };

  const unlock = async (password) => {
    const envelope = vault.readEnvelope();
    if (!envelope) return false;
    try {
      const key = await cryptoUtil.deriveKey(
        password,
        cryptoUtil.base64ToBytes(envelope.salt)
      );
      const data = await cryptoUtil.decrypt(
        { iv: envelope.iv, ciphertext: envelope.ciphertext },
        key
      );
      keyRef.current = key;
      setCredentials(data);
      setIsLocked(false);
      vault.cacheSessionKey(await cryptoUtil.exportRawKey(key));
      return true;
    } catch {
      return false;
    }
  };

  const lock = () => {
    keyRef.current = null;
    vault.clearSessionKey();
    setCredentials([]);
    setIsLocked(true);
  };

  const resetVault = () => {
    vault.clearVault();
    vault.clearSessionKey();
    keyRef.current = null;
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
