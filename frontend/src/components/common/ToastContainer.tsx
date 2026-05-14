import { useToast } from "../../context/ToastContext";

const icons: Record<string, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

const colors: Record<string, { bg: string; border: string; icon: string }> = {
  success: { bg: "var(--success-light)",  border: "var(--success)",  icon: "var(--success)"  },
  error:   { bg: "var(--error-light)",    border: "var(--error)",    icon: "var(--error)"    },
  warning: { bg: "var(--warning-light)",  border: "var(--warning)",  icon: "var(--warning)"  },
  info:    { bg: "var(--brand-50)",       border: "var(--brand-400)",icon: "var(--brand-500)" },
};

const ToastContainer = () => {
  const { toasts, dismiss } = useToast();

  return (
    <div style={{
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: "10px",
      pointerEvents: "none",
    }}>
      {toasts.map((t) => {
        const c = colors[t.type];
        return (
          <div
            key={t.id}
            className="toast-enter"
            style={{
              pointerEvents: "all",
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              padding: "12px 16px",
              background: c.bg,
              border: `1.5px solid ${c.border}`,
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              minWidth: "260px",
              maxWidth: "380px",
              cursor: "pointer",
            }}
            onClick={() => dismiss(t.id)}
          >
            <span style={{ color: c.icon, fontWeight: 700, fontSize: "15px", lineHeight: 1, flexShrink: 0, marginTop: "2px" }}>
              {icons[t.type]}
            </span>
            <span style={{ fontSize: "14px", color: "var(--text-primary)", lineHeight: 1.4, flex: 1 }}>
              {t.message}
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "16px", lineHeight: 1, cursor: "pointer", marginTop: "-1px" }}>
              ×
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
