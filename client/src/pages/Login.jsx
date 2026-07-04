import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { loginUser } from "../services/authService";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../components/ui/useDialog";

const loginStatusMessages = [
  "🔐 Verifying your account...",
  "🧠 Preparing your AI workspace...",
  "💬 Loading your conversations...",
  "⚡ Connecting AI services...",
  "🚀 Almost ready...",
];

let hasWarmedBackend = false;

function Login() {
  const navigate = useNavigate();
  const showToast = useToast();
  const loginInFlight = useRef(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [showColdStartNotice, setShowColdStartNotice] = useState(false);

  useEffect(() => {
    if (hasWarmedBackend) return;

    hasWarmedBackend = true;
    axios.get(import.meta.env.VITE_API_URL).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isLoggingIn) return;

    const statusTimer = setInterval(() => {
      setStatusIndex((currentIndex) =>
        currentIndex === loginStatusMessages.length - 1 ? 0 : currentIndex + 1,
      );
    }, 2500);

    const coldStartTimer = setTimeout(() => {
      setShowColdStartNotice(true);
    }, 8000);

    return () => {
      clearInterval(statusTimer);
      clearTimeout(coldStartTimer);
    };
  }, [isLoggingIn]);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google-login`,
        {
          credential: credentialResponse.credential,
        },
      );

      localStorage.setItem("token", response.data.token);

      localStorage.setItem("user", JSON.stringify(response.data.user));

      localStorage.setItem("isLoggedIn", "true");

      navigate("/chat");
    } catch (error) {
      console.log(error);
    }
  };
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loginInFlight.current) return;

    loginInFlight.current = true;
    setStatusIndex(0);
    setShowColdStartNotice(false);
    setIsLoggingIn(true);

    try {
      const response = await loginUser(formData);

      localStorage.setItem("token", response.token);

      localStorage.setItem("user", JSON.stringify(response.user));

      localStorage.setItem("isLoggedIn", "true");

      navigate("/chat");
    } catch (error) {
      showToast({
        type: "error",
        message: error.response?.data?.message || "Login failed",
      });
    } finally {
      loginInFlight.current = false;
      setStatusIndex(0);
      setShowColdStartNotice(false);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="login-page">
      <div
        className="login-content"
        aria-hidden={isLoggingIn}
        inert={isLoggingIn ? "" : undefined}
      >
        <div className="hero-section">
          <span className="badge">AI Powered Platform</span>

          <h1>
            Your Second Brain,
            <br />
            Powered by AI.
          </h1>

          <p>
            Secure conversations, persistent memory, and lightning-fast responses.
          </p>

          <div className="feature-list">
            <div>⚡ Instant AI Responses</div>
            <div>🧠 Smart Memory</div>
            <div>🔒 Secure Authentication</div>
          </div>
        </div>

        <div className="orb"></div>

        <div className="login-card">
          <div className="logo">⚡</div>

          <h1>NeuralChat</h1>

          <p>Sign in to continue your AI conversations</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoggingIn}
            />
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoggingIn}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoggingIn}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" disabled={isLoggingIn} />
                Remember me
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/forgot-password");
                }}
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="signin-btn"
              disabled={isLoggingIn}
              aria-busy={isLoggingIn}
            >
              Sign In
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => console.log("Google Login Failed")}
            />
          </form>

          <div className="register-link">
            Don't have an account?
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register");
              }}
            >
              Create Account
            </a>
          </div>
        </div>
      </div>

      {isLoggingIn && (
        <div
          className="login-loading-overlay"
          role="status"
          aria-live="polite"
          aria-label="Authenticating with NeuralChat"
        >
          <div className="login-loading-panel">
            <div className="loading-logo" aria-hidden="true">
              ⚡
            </div>
            <h2>NeuralChat</h2>
            <p className="loading-title">Authenticating...</p>
            <p key={statusIndex} className="loading-status" aria-live="polite">
              {loginStatusMessages[statusIndex]}
            </p>
            <div className="loading-progress" aria-hidden="true">
              <span></span>
            </div>
            <p
              className={`cold-start-notice${
                showColdStartNotice ? " visible" : ""
              }`}
            >
              First launch may take a little longer while the secure server
              wakes up.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
