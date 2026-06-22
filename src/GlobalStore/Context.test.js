import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContext } from "react";
import Context, { AppContext } from "./Context";
import {
  isVaultInitialized,
  readEnvelope,
  writeEnvelope,
  LEGACY_KEY,
} from "../Utilities/vault";
import {
  generateSalt,
  deriveLegacyKey,
  encrypt,
  bytesToBase64,
} from "../Utilities/crypto";

function Harness() {
  const { isLocked, credentials, setupPassword, unlock, lock } =
    useContext(AppContext);
  return (
    <div>
      <span data-testid="locked">{String(isLocked)}</span>
      <span data-testid="count">{credentials.length}</span>
      <button onClick={() => setupPassword("pw123")}>setup</button>
      <button onClick={() => unlock("pw123")}>unlock-right</button>
      <button onClick={() => unlock("nope")}>unlock-wrong</button>
      <button onClick={() => lock()}>lock</button>
    </div>
  );
}

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test("setupPassword initializes an encrypted vault and unlocks", async () => {
  render(
    <Context>
      <Harness />
    </Context>
  );
  expect(screen.getByTestId("locked").textContent).toBe("true");
  await userEvent.click(screen.getByText("setup"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("false")
  );
  expect(isVaultInitialized()).toBe(true);
  // Envelope must hold ciphertext, not plaintext service names.
  expect(JSON.stringify(readEnvelope())).not.toContain("Google");
});

test("setupPassword migrates and erases legacy plaintext", async () => {
  localStorage.setItem(
    LEGACY_KEY,
    JSON.stringify([{ id: 9, service: "Legacy" }])
  );
  render(
    <Context>
      <Harness />
    </Context>
  );
  await userEvent.click(screen.getByText("setup"));
  await waitFor(() =>
    expect(screen.getByTestId("count").textContent).toBe("1")
  );
  expect(localStorage.getItem(LEGACY_KEY)).toBeNull();
});

test("unlock upgrades a legacy PBKDF2 vault to Argon2id", async () => {
  // Seed a v1 envelope exactly as the pre-Argon2id app would have written it.
  const salt = generateSalt();
  const legacyKey = await deriveLegacyKey("pw123", salt);
  const sealed = await encrypt(
    [{ id: 1, service: "Old", password: "p" }],
    legacyKey
  );
  writeEnvelope({
    version: 1,
    salt: bytesToBase64(salt),
    iv: sealed.iv,
    ciphertext: sealed.ciphertext,
  });

  render(
    <Context>
      <Harness />
    </Context>
  );

  await userEvent.click(screen.getByText("unlock-right"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("false")
  );
  expect(screen.getByTestId("count").textContent).toBe("1");

  // The vault must be transparently re-sealed under Argon2id.
  const upgraded = readEnvelope();
  expect(upgraded.version).toBe(2);
  expect(upgraded.kdf).toBe("argon2id");
});

test("unlock succeeds with the right password and fails with the wrong one", async () => {
  render(
    <Context>
      <Harness />
    </Context>
  );
  await userEvent.click(screen.getByText("setup"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("false")
  );

  await act(async () => {
    await userEvent.click(screen.getByText("lock"));
  });
  expect(screen.getByTestId("locked").textContent).toBe("true");

  await userEvent.click(screen.getByText("unlock-wrong"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("true")
  );

  await userEvent.click(screen.getByText("unlock-right"));
  await waitFor(() =>
    expect(screen.getByTestId("locked").textContent).toBe("false")
  );
});
