import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.variant];
        return (
          <div key={toast.id} className={`toast toast--${toast.variant}`}>
            <Icon size={16} />
            <span>{toast.message}</span>
            <button
              className="toast__close"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
