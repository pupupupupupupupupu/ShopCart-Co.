type ErrorBoxProps = {
  message: string;
};

const ErrorBox = ({ message }: ErrorBoxProps) => {
  if (!message) return null;

  return (
    <div
      style={{
        backgroundColor: "#ffe5e5",
        color: "#b00020",
        padding: "1rem",
        marginBottom: "1rem",
        borderRadius: "4px",
      }}
    >
      {message}
    </div>
  );
};

export default ErrorBox;
