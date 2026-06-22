import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Context from "../GlobalStore/Context";
import LockScreen from "./LockScreen";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

function renderLockScreen() {
  render(
    <Context>
      <LockScreen />
    </Context>
  );
}

async function createVault() {
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Master password"), "pw123");
  });
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Confirm password"), "pw123");
  });
  await act(async () => {
    await userEvent.click(screen.getByText("Create vault"));
  });
}

test("first run shows the set-password form and creates a vault", async () => {
  renderLockScreen();
  expect(screen.getByText("Set a master password")).toBeInTheDocument();
  await createVault();
  await waitFor(() =>
    expect(localStorage.getItem("authorize-me-vault")).not.toBeNull()
  );
});

test("mismatched passwords show an error", async () => {
  renderLockScreen();
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Master password"), "pw123");
  });
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Confirm password"), "different");
  });
  await act(async () => {
    await userEvent.click(screen.getByText("Create vault"));
  });
  expect(
    await screen.findByText("Passwords do not match.")
  ).toBeInTheDocument();
});

test("a wrong password on unlock shows an error", async () => {
  renderLockScreen();
  await createVault();
  const unlockBtn = await screen.findByText("Unlock");
  const input = screen.getByLabelText("Master password");
  await act(async () => {
    await userEvent.clear(input);
  });
  await act(async () => {
    await userEvent.type(input, "wrong");
  });
  await act(async () => {
    await userEvent.click(unlockBtn);
  });
  expect(await screen.findByText("Incorrect password.")).toBeInTheDocument();
});

test("reset vault clears storage and returns to setup", async () => {
  renderLockScreen();
  await createVault();
  await screen.findByText("Unlock");
  jest.spyOn(window, "confirm").mockReturnValue(true);
  await act(async () => {
    await userEvent.click(screen.getByText("Reset vault (erase all data)"));
  });
  expect(
    await screen.findByText("Set a master password")
  ).toBeInTheDocument();
  expect(localStorage.getItem("authorize-me-vault")).toBeNull();
});

test("password shorter than 4 characters shows an error", async () => {
  renderLockScreen();
  expect(screen.getByText("Set a master password")).toBeInTheDocument();
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Master password"), "abc");
  });
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Confirm password"), "abc");
  });
  await act(async () => {
    await userEvent.click(screen.getByText("Create vault"));
  });
  expect(
    await screen.findByText("Password must be at least 4 characters.")
  ).toBeInTheDocument();
});
