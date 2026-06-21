import React from "react";
import { createPortal } from "react-dom";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  // Portal to document.body so the fixed-position backdrop is never trapped by
  // an ancestor that establishes a containing block (e.g. the bottom bar's
  // backdrop-filter), which would stop it centering on the viewport.
  return createPortal(
    <div className="vault-modal__backdrop" onClick={onClose}>
      <div className="vault-modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
