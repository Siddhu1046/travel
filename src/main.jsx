import { StrictMode, Component } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 32, background: "#050b12", color: "#edf5f0", fontFamily: "system-ui, sans-serif" }}>
          <section style={{ maxWidth: 720 }}>
            <p style={{ color: "#ff9f43", fontWeight: 700 }}>TRAVEL APP ERROR</p>
            <h1 style={{ fontSize: 42, margin: "8px 0 16px" }}>The app failed to render.</h1>
            <p style={{ color: "#91a09b", lineHeight: 1.7 }}>
              The exact runtime error is shown below instead of leaving a blank page.
            </p>
            <pre style={{ whiteSpace: "pre-wrap", padding: 16, borderRadius: 12, background: "#0d1926", color: "#ffb46e", overflow: "auto" }}>
              {this.state.error?.stack || String(this.state.error)}
            </pre>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>
);