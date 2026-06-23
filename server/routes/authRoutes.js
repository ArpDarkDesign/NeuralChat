const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  googleLogin,
  forgotPassword,
  resetPassword,
  verifyEmail,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
module.exports = router;
