import { useEffect, useRef } from "react";
import { X } from "lucide-react";

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function Modal({
  title,
  description,
  children,
  onClose,
  initialFocusRef,
  ariaLabel,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const dialog = dialogRef.current;
    const focusTarget =
      initialFocusRef?.current ||
      dialog?.querySelector(FOCUSABLE_SELECTOR) ||
      dialog;

    focusTarget?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusable = Array.from(
        dialog.querySelectorAll(FOCUSABLE_SELECTOR),
      ).filter((element) => !element.disabled);

      if (focusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [initialFocusRef, onClose]);

  return (
    <div
      className="ui-modal-backdrop"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        ref={dialogRef}
        className="ui-modal"
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-labelledby={title ? "ui-modal-title" : undefined}
        aria-describedby={description ? "ui-modal-description" : undefined}
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="ui-modal-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {title && <h2 id="ui-modal-title">{title}</h2>}
        {description && <p id="ui-modal-description">{description}</p>}

        {children}
      </section>
    </div>
  );
}

export default Modal;
