import { Component, ErrorInfo, ReactNode } from "react";

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div style={{
          padding: "48px 24px",
          textAlign: "center",
          background: "var(--error-light)",
          border: "1px solid var(--error)",
          borderRadius: "var(--radius-xl)",
          margin: "24px",
        }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>💥</div>
          <h3 style={{ marginBottom: "8px", color: "var(--error)" }}>Something went wrong</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "20px", fontSize: "13px" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            className="btn-brand"
            onClick={() => this.setState({ hasError: false, error: undefined })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
