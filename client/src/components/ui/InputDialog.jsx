import { useMemo, useRef, useState } from "react";
import Modal from "./Modal";

function InputDialog({ options, onResolve }) {
  const {
    title = "Enter value",
    description,
    defaultValue = "",
    placeholder = "",
    confirmText = "Save",
    cancelText = "Cancel",
    validation,
  } = options;

  const inputRef = useRef(null);
  const [value, setValue] = useState(defaultValue);
  const [touched, setTouched] = useState(false);

  const validationMessage = useMemo(() => {
    if (!validation) return "";
    const result = validation(value);
    return typeof result === "string" ? result : "";
  }, [validation, value]);

  const submit = () => {
    setTouched(true);
    if (validationMessage) return;
    onResolve(value);
  };

  return (
    <Modal
      title={title}
      description={description}
      onClose={() => onResolve(null)}
      initialFocusRef={inputRef}
    >
      <form
        className="ui-input-form"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <label className="ui-field">
          <span className="ui-sr-only">{title}</span>
          <input
            ref={inputRef}
            value={value}
            placeholder={placeholder}
            onChange={(event) => setValue(event.target.value)}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(touched && validationMessage)}
            aria-describedby={
              touched && validationMessage ? "ui-input-error" : undefined
            }
          />
        </label>

        {touched && validationMessage && (
          <p className="ui-input-error" id="ui-input-error">
            {validationMessage}
          </p>
        )}

        <div className="ui-modal-actions">
          <button
            type="button"
            className="ui-button ui-button-secondary"
            onClick={() => onResolve(null)}
          >
            {cancelText}
          </button>
          <button type="submit" className="ui-button ui-button-primary">
            {confirmText}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default InputDialog;
