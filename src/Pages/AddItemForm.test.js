import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddItemForm from "./AddItemForm";

const mockEditCred = jest.fn();
jest.mock("../Utilities/CustomHooks/useModifyCred", () => ({
  __esModule: true,
  default: () => ({ editCred: mockEditCred }),
}));

const blank = { service: "", url: "", username: "", password: "", tags: [""], notes: "" };

beforeEach(() => mockEditCred.mockClear());

test("saving derives url from the website when url is blank", async () => {
  render(<AddItemForm item={blank} editItem={() => {}} onClose={() => {}} />);
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Website"), "My Site");
    await userEvent.type(screen.getByLabelText("Username"), "me@x.com");
    await userEvent.type(screen.getByLabelText("Password"), "secret");
    await userEvent.click(screen.getByText("Save credential"));
  });

  expect(mockEditCred).toHaveBeenCalledTimes(1);
  const saved = mockEditCred.mock.calls[0][0];
  expect(saved.service).toBe("My Site");
  expect(saved.url).toBe("mysite.com");
  expect(saved.username).toBe("me@x.com");
});

test("does not save when website is empty", async () => {
  render(<AddItemForm item={blank} editItem={() => {}} onClose={() => {}} />);
  await act(async () => {
    await userEvent.type(screen.getByLabelText("Username"), "me@x.com");
    await userEvent.click(screen.getByText("Save credential"));
  });
  expect(mockEditCred).not.toHaveBeenCalled();
});
