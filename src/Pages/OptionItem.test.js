import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OptionItem from "./OptionItem";

test("clicking the row triggers its onClick", async () => {
  const onClick = jest.fn();
  render(
    <OptionItem description="Export Data" image={null} onClick={onClick} hiddenElement={null} />
  );
  await act(async () => {
    await userEvent.click(screen.getByText("Export Data"));
  });
  expect(onClick).toHaveBeenCalledTimes(1);
});

test("a programmatic click on the hidden element does NOT bubble to the row onClick", async () => {
  // Regression: the hidden <a download> / <input type=file> must not be inside the
  // clickable row, or export/import re-trigger themselves (and preventDefault cancels
  // the download). Simulate the hidden element being clicked programmatically.
  const onClick = jest.fn();
  render(
    <OptionItem
      description="Export Data"
      image={null}
      onClick={onClick}
      hiddenElement={<button data-testid="hidden-el">hidden</button>}
    />
  );
  await act(async () => {
    await userEvent.click(screen.getByTestId("hidden-el"));
  });
  expect(onClick).not.toHaveBeenCalled();
});
