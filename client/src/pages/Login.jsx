import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { loginUser } from "../services/authService";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "../components/ui/useDialog";
import NeuralChatLoadingOverlay from "../components/NeuralChatLoadingOverlay";

const loginStatusMessages = [
  "🔐 Verifying your account...",
  "🧠 Preparing your AI workspace...",
  "💬 Loading your conversations...",
  "⚡ Connecting AI services...",
  "🚀 Almost ready...",
];

const googleStatusMessages = [
  "🔐 Initializing secure session...",
  "⚡ Waking AI services...",
  "🧠 Preparing your workspace...",
  "💬 Loading conversations...",
  "🚀 Redirecting to Google...",
];

const loadingContent = {
  login: {
    label: "Authenticating with NeuralChat",
    title: "Authenticating...",
    messages: loginStatusMessages,
  },
  google: {
    label: "Preparing Google Sign-In with NeuralChat",
    title: "Preparing secure connection...",
    messages: googleStatusMessages,
  },
};

let backendWarmupPromise = null;

const warmBackend = () => {
  if (!backendWarmupPromise) {
    backendWarmupPromise = axios.get(`${import.meta.env.VITE_API_URL}/`).catch(() => {});
  }

  return backendWarmupPromise;
};

function Login() {
  const navigate = useNavigate();
  const showToast = useToast();
  const loginInFlight = useRef(false);
  const googleSignInInFlight = useRef(false);
  const googleCredentialExchangeInFlight = useRef(false);
  const googleWarmupTimer = useRef(null);
  const googleFallbackTimer = useRef(null);
  const [loadingMode, setLoadingMode] = useState(null);
  const [showColdStartNotice, setShowColdStartNotice] = useState(false);
  const isLoading = loadingMode !== null;
  const activeLoadingContent = loadingMode
    ? loadingContent[loadingMode]
    : loadingContent.login;

  useEffect(() => {
    warmBackend();
  }, []);

  useEffect(() => {
    if (!loadingMode) return;

    const coldStartTimer = setTimeout(() => {
      if (loadingMode === "login") {
        setShowColdStartNotice(true);
      }
    }, 8000);

    return () => {
      clearTimeout(coldStartTimer);
    };
  }, [loadingMode]);

  useEffect(() => {
    return () => {
      clearTimeout(googleWarmupTimer.current);
      clearTimeout(googleFallbackTimer.current);
    };
  }, []);

  const warmGoogleSignIn = () => {
    if (googleSignInInFlight.current) return;

    googleSignInInFlight.current = true;
    setShowColdStartNotice(false);
    setLoadingMode("google");

    const warmupRequest = warmBackend();

    const warmupTimeout = new Promise((resolve) => {
      googleWarmupTimer.current = setTimeout(resolve, 3000);
    });

    Promise.race([warmupRequest, warmupTimeout]).finally(() => {
      clearTimeout(googleWarmupTimer.current);
      clearTimeout(googleFallbackTimer.current);

      googleSignInInFlight.current = false;

      if (!googleCredentialExchangeInFlight.current) {
        setLoadingMode((currentMode) =>
          currentMode === "google" ? null : currentMode,
        );
      }
    });

    googleFallbackTimer.current = setTimeout(() => {
      googleSignInInFlight.current = false;
      setLoadingMode((currentMode) =>
        currentMode === "google" ? null : currentMode,
      );
    }, 30000);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    clearTimeout(googleFallbackTimer.current);
    googleSignInInFlight.current = true;
    googleCredentialExchangeInFlight.current = true;
    setShowColdStartNotice(false);
    setLoadingMode("google");

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
      googleSignInInFlight.current = false;
      googleCredentialExchangeInFlight.current = false;
      setLoadingMode(null);
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
    setShowColdStartNotice(false);
    setLoadingMode("login");

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
      setShowColdStartNotice(false);
      setLoadingMode(null);
    }
  };

  return (
    <div className="login-page">
      <div
        className="login-content"
        aria-hidden={isLoading}
        inert={isLoading ? "" : undefined}
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
              disabled={isLoading}
            />
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" disabled={isLoading} />
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
              disabled={isLoading}
              aria-busy={isLoading && loadingMode === "login"}
            >
              Sign In
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <div
              className={`google-login-wrapper${
                loadingMode === "google" ? " is-disabled" : ""
              }`}
              aria-disabled={loadingMode === "google"}
              aria-busy={loadingMode === "google"}
            >
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  console.log("Google Login Failed");
                  googleSignInInFlight.current = false;
                  clearTimeout(googleFallbackTimer.current);
                  setLoadingMode(null);
                }}
                click_listener={warmGoogleSignIn}
                text="continue_with"
              />
            </div>
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

      {isLoading && (
        <NeuralChatLoadingOverlay
          label={activeLoadingContent.label}
          title={activeLoadingContent.title}
          messages={activeLoadingContent.messages}
          footer={
            loadingMode === "login" && (
              <p
                className={`cold-start-notice${
                  showColdStartNotice ? " visible" : ""
                }`}
              >
                First launch may take a little longer while the secure server
                wakes up.
              </p>
            )
          }
        />
      )}
    </div>
  );
}

export default Login;
