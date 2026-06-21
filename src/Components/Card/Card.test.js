import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Card from "./Card";

// Card uses useModifyCred -> AppContext; provide a minimal context.
jest.mock("../../Utilities/CustomHooks/useModifyCred", () => ({
  __esModule: true,
  default: () => ({ deleteItem: jest.fn() }),
}));
jest.mock("../../Utilities/CustomHooks/useToastNotification", () => ({
  __esModule: true,
  default: () => ({ notify: jest.fn() }),
}));

const item = {
  id: 1,
  service: "Google",
  url: "accounts.google.com",
  username: "alex@gmail.com",
  password: "Abcd1234!",
  notes: "Personal",
  updateOn: new Date().toISOString(),
};

test("renders the service, url and username", () => {
  render(<Card data={item} editItem={() => {}} />);
  expect(screen.getByText("Google")).toBeInTheDocument();
  expect(screen.getByText("accounts.google.com")).toBeInTheDocument();
  expect(screen.getByText("alex@gmail.com")).toBeInTheDocument();
});

test("password is masked until revealed", async () => {
  render(<Card data={item} editItem={() => {}} />);
  expect(screen.queryByText("Abcd1234!")).not.toBeInTheDocument();
  await act(async () => {
    await userEvent.click(screen.getByLabelText("Show password"));
  });
  expect(screen.getByText("Abcd1234!")).toBeInTheDocument();
});

test("shows the password strength label", () => {
  render(<Card data={item} editItem={() => {}} />);
  expect(screen.getByText("Strong")).toBeInTheDocument();
});
