import { useState } from "react";
import { forgotPassword } from "../services/authService";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await forgotPassword(email);

      alert(response.message);

      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Reset Password</h1>

        <p>Enter your email to receive a reset link</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="signin-btn">
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;