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

test("the note is not printed inline; it opens in a modal from the header button", async () => {
  render(<Card data={item} editItem={() => {}} />);
  // The note text is not shown on the card itself.
  expect(screen.queryByText("Personal")).not.toBeInTheDocument();
  // The header note button reveals it in a modal.
  await act(async () => {
    await userEvent.click(screen.getByLabelText("View note"));
  });
  expect(screen.getByText("Personal")).toBeInTheDocument();
});

test("hides the note button when there is no note", () => {
  render(<Card data={{ ...item, notes: "" }} editItem={() => {}} />);
  expect(screen.queryByLabelText("View note")).not.toBeInTheDocument();
});

test("the card menu offers Edit and Delete", () => {
  render(<Card data={item} editItem={() => {}} />);
  expect(screen.getByText("Edit")).toBeInTheDocument();
  expect(screen.getByText("Delete")).toBeInTheDocument();
});
