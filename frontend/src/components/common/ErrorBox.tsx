type ErrorBoxProps = { message: string };

const ErrorBox = ({ message }: ErrorBoxProps) => {
  if (!message) return null;
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      background: "var(--error-light)",
      color: "var(--error)",
      padding: "14px 16px",
      marginBottom: "20px",
      borderRadius: "var(--radius-md)",
      fontSize: "14px",
      fontWeight: 500,
      border: "1px solid #fca5a5",
    }}>
      <span style={{ fontSize: "16px", flexShrink: 0 }}>⚠️</span>
      <span>{message}</span>
    </div>
  );
};

export default ErrorBox;
