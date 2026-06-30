import {
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import ConfirmDialog from "./ConfirmDialog";
import InputDialog from "./InputDialog";
import Toast from "./Toast";
import { UIContext } from "./UIContext";
import "./ui.css";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [inputState, setInputState] = useState(null);
  const toastTimers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    setToasts((current) =>
      current.map((toast) =>
        toast.id === id ? { ...toast, exiting: true } : toast,
      ),
    );

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      toastTimers.current.delete(id);
    }, 220);
  }, []);

  const showToast = useCallback(
    ({ type = "info", message, title, duration = 4000 }) => {
      if (!message) return null;

      const id = crypto.randomUUID?.() || String(Date.now() + Math.random());
      const toast = { id, type, message, title, exiting: false };

      setToasts((current) => [toast, ...current]);

      if (duration > 0) {
        const timer = window.setTimeout(() => dismissToast(id), duration);
        toastTimers.current.set(id, timer);
      }

      return id;
    },
    [dismissToast],
  );

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setConfirmState({ options, resolve });
      }),
    [],
  );

  const inputDialog = useCallback(
    (options) =>
      new Promise((resolve) => {
        setInputState({ options, resolve });
      }),
    [],
  );

  const resolveConfirm = useCallback((value) => {
    setConfirmState((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const resolveInput = useCallback((value) => {
    setInputState((current) => {
      current?.resolve(value);
      return null;
    });
  }, []);

  const value = useMemo(
    () => ({ showToast, confirm, inputDialog }),
    [confirm, inputDialog, showToast],
  );

  return (
    <UIContext.Provider value={value}>
      {children}

      <div className="ui-toast-viewport" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onClose={dismissToast} />
        ))}
      </div>

      {confirmState && (
        <ConfirmDialog
          options={confirmState.options}
          onResolve={resolveConfirm}
        />
      )}

      {inputState && (
        <InputDialog options={inputState.options} onResolve={resolveInput} />
      )}
    </UIContext.Provider>
  );
}
