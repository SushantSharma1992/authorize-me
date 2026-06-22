import { render, screen } from "@testing-library/react";
import Home from "./Home";

// Drive useSearch so the grid is empty after a query.
let mockResults = [{ id: 1, service: "Google", url: "g.com", username: "a", password: "p", notes: "" }];
jest.mock("../Utilities/CustomHooks/useSearch", () => ({
  __esModule: true,
  default: () => [mockResults, jest.fn()],
}));
jest.mock("../Utilities/CustomHooks/useModifyCred", () => ({
  __esModule: true,
  default: () => ({ deleteItem: jest.fn(), editCred: jest.fn() }),
}));
jest.mock("../Utilities/CustomHooks/useToastNotification", () => ({
  __esModule: true,
  default: () => ({ notify: jest.fn() }),
}));
jest.mock("../GlobalStore/Context", () => ({
  __esModule: true,
  AppContext: require("react").createContext({ credentials: [], showToast: false, toastNotification: "" }),
}));

test("shows the empty state when there are no results", () => {
  mockResults = [];
  render(<Home />);
  expect(screen.getByText("No matches found")).toBeInTheDocument();
});

test("renders a card when there are results", () => {
  mockResults = [{ id: 1, service: "Google", url: "g.com", username: "a@b.com", password: "p", notes: "" }];
  render(<Home />);
  expect(screen.getByText("Google")).toBeInTheDocument();
});
