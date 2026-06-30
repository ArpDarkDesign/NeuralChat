import "./AuthLayout.css";

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-container">
      <div className="auth-glow auth-glow-1"></div>
      <div className="auth-glow auth-glow-2"></div>

      <div className="auth-left">
        <div className="brand">
          <span className="brand-dot"></span>
          NeuralChat
        </div>

        <h1>
          Your AI
          <br />
          Companion.
        </h1>

        <p>
          Secure conversations, persistent memory, and intelligent assistance in
          one futuristic workspace.
        </p>
      </div>

      <div className="auth-right">{children}</div>
    </div>
  );
};

export default AuthLayout;
