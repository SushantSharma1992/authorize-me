import React, { useEffect, useRef, useState } from "react";
import { IoCloseCircleOutline } from "react-icons/io5";

const Modal = ({ isOpen, onClose, children }) => {
  const dialogRef = useRef();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    isOpen ? openDialog() : closeDialog();
  }, [isOpen]);

  const openDialog = () => {
    dialogRef.current.showModal();
    setIsDialogOpen(dialogRef.current.open);
  };
  const closeDialog = () => {
    dialogRef.current.close();
    setIsDialogOpen(dialogRef.current.open);
  };

  return (
    <div className="modal_container">
      <dialog ref={dialogRef}>
        <div className="closeButton" onClick={onClose}>
          <IoCloseCircleOutline />
        </div>
        <div className="modal_child_container">{children}</div>
      </dialog>
    </div>
  );
};

export default Modal;
