import { render, screen } from "@testing-library/react";
import Modal from "./Modal";

test("renders nothing when closed", () => {
  render(
    <Modal isOpen={false} onClose={() => {}}>
      <div>modal body</div>
    </Modal>
  );
  expect(screen.queryByText("modal body")).not.toBeInTheDocument();
});

test("portals to document.body so it escapes a filtered/transformed ancestor", () => {
  // Regression: when the modal is rendered inside an element that creates a
  // containing block for fixed positioning (e.g. the .vault-bar with
  // backdrop-filter), a non-portaled fixed backdrop is trapped in that box
  // and can't center on the viewport. Portaling to document.body fixes it.
  const { container } = render(
    <div style={{ backdropFilter: "blur(14px)" }}>
      <Modal isOpen={true} onClose={() => {}}>
        <div>modal body</div>
      </Modal>
    </div>
  );

  // The backdrop must NOT live inside the filtered wrapper...
  expect(container.querySelector(".vault-modal__backdrop")).toBeNull();
  // ...it must be portaled out to the document.
  expect(document.querySelector(".vault-modal__backdrop")).not.toBeNull();
  expect(screen.getByText("modal body")).toBeInTheDocument();
});
