import { useRef } from "react";
import Modal from "./Modal";

function ConfirmDialog({ options, onResolve }) {
  const confirmRef = useRef(null);

  const {
    title = "Confirm action",
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    destructive = false,
  } = options;

  return (
    <Modal
      title={title}
      description={description}
      onClose={() => onResolve(false)}
      initialFocusRef={confirmRef}
    >
      <div className="ui-modal-actions">
        <button
          type="button"
          className="ui-button ui-button-secondary"
          onClick={() => onResolve(false)}
        >
          {cancelText}
        </button>
        <button
          ref={confirmRef}
          type="button"
          className={`ui-button ${destructive ? "ui-button-danger" : "ui-button-primary"}`}
          onClick={() => onResolve(true)}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
