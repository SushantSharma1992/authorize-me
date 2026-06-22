import React from "react";
import Modal from "../Modal";
import Avatar from "./Avatar";

function NoteModal({ open, onClose, service, notes }) {
  return (
    <Modal isOpen={open} onClose={onClose}>
      <div className="note-modal__head">
        <Avatar name={service} />
        <div className="note-modal__titlewrap">
          <div className="note-modal__title">{service}</div>
          <div className="note-modal__eyebrow">Note</div>
        </div>
        <button
          type="button"
          className="vault-modal__close"
          aria-label="Close note"
          onClick={onClose}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <div className="note-modal__body">{notes}</div>
    </Modal>
  );
}

export default NoteModal;
