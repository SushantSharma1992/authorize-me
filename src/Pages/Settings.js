import React, { useState } from "react";
import { FiSettings } from "react-icons/fi";
import Options from "./Options";
import Modal from "../Components/Modal";

const Settings = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Settings"
        className="vault-icon-btn"
        onClick={() => setIsOpen(true)}
      >
        <FiSettings />
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="list_container">
          <Options />
        </div>
      </Modal>
    </>
  );
};

export default Settings;
