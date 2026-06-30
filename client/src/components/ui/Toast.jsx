import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const toastIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

function Toast({ toast, onClose }) {
  const Icon = toastIcons[toast.type] || Info;

  return (
    <div
      className={`ui-toast ui-toast-${toast.type}${toast.exiting ? " ui-toast-exit" : ""}`}
      role="status"
    >
      <Icon className="ui-toast-icon" size={20} aria-hidden="true" />
      <div className="ui-toast-content">
        {toast.title && <strong>{toast.title}</strong>}
        <span>{toast.message}</span>
      </div>
      <button
        type="button"
        className="ui-toast-close"
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default Toast;
