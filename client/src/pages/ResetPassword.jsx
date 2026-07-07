import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";
import "./Login.css";
import { useToast } from "../components/ui/useDialog";

function ResetPassword() {
  const { token } = useParams();

  const navigate = useNavigate();
  const showToast = useToast();

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      showToast({ type: "warning", message: "Passwords do not match" });
      return;
    }

    try {
      const response = await resetPassword(token, password);

      showToast({ type: "success", message: response.message });

      navigate("/");
    } catch (error) {
      showToast({
        type: "error",
        message: error.response?.data?.message || "Password reset failed",
      });
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <div className="login-cards">
          <h1>Create New Password</h1>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button type="submit" className="signin-btn">
              Reset Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
