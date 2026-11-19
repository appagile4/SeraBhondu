import express from "express";
import {
  googleAuth,
  sendEmailOtp,
  verifyEmailOtp,
  setEmailPassword,
  sendPhoneOtp,
  verifyPhoneOtp,
  signup,
  verifyOtp,
  resendOtp,
  login,
  logout,
  getMe,
  updateProfile,
  uploadAvatar,
  requestDeleteAccountOtp,
  confirmDeleteAccount,
  deleteMyAccount,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// ============================================================================
// Unified Authentication Endpoints
// ============================================================================

// Google OAuth
router.post("/google", googleAuth);

// Email OTP Flow
router.post("/email/send-otp", sendEmailOtp);
router.post("/email/verify-otp", verifyEmailOtp);
router.post("/email/set-password", setEmailPassword);

// Phone OTP Flow (Passwordless)
router.post("/phone/send-otp", sendPhoneOtp);
router.post("/phone/verify-otp", verifyPhoneOtp);

// ============================================================================
// Account Deletion Endpoints (Apple Guideline 5.1.1 & GDPR Compliant)
// ============================================================================
router.post("/delete-account/send-otp", requestDeleteAccountOtp);
router.post("/delete-account/confirm", confirmDeleteAccount);
router.delete("/delete-account", protect, deleteMyAccount);

// ============================================================================
// Legacy Backward-Compatible Endpoints
// ============================================================================
router.post("/signup", signup);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/avatar", protect, uploadSingleImage, uploadAvatar);

export default router;
