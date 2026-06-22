import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test("renders the lock screen when no vault exists", () => {
  render(<App />);
  expect(screen.getByText("Set a master password")).toBeInTheDocument();
});
