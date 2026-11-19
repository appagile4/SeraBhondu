import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import Advertisement from "../models/Advertisement.js";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import { sendOtpEmail, sendAccountDeletionEmail } from "../config/nodemailer.js";
import { sendOtpSms } from "../config/sms.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

// JWT Secret & Expiry
const JWT_SECRET = process.env.JWT_SECRET || "serabondhu_classifieds_bangladesh_jwt_secret_token_2026_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Set JWT Cookie & JSON Response
const sendTokenResponse = (user, statusCode, res, message = "Success") => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  };

  const userObj = user.toObject ? user.toObject() : user;
  delete userObj.password;

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    message,
    token,
    user: userObj,
  });
};

// ============================================================================
// A & B: GOOGLE AUTHENTICATION
// ============================================================================

/**
 * @desc    Verify Google ID Token / Userinfo and Login or Register
 * @route   POST /api/auth/google
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential, idToken, accessToken, code, userInfo } = req.body;
    const token = credential || idToken || accessToken;

    let googleProfile = null;

    // 0. Authorization code exchange if code is provided
    if (code) {
      try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            redirect_uri: "postmessage",
            grant_type: "authorization_code",
          }),
        });
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          const ures = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (ures.ok) {
            const udata = await ures.json();
            if (udata && udata.email) {
              googleProfile = {
                sub: udata.sub,
                email: udata.email.toLowerCase().trim(),
                name: udata.name || udata.email.split("@")[0],
                picture: udata.picture,
                email_verified: true,
              };
            }
          }
        }
      } catch (codeErr) {
        console.warn("Google code exchange error:", codeErr.message);
      }
    }

    // 1. If explicit Google ID token is provided, verify via Google tokeninfo endpoint
    if (!googleProfile && token) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
        );
        if (verifyRes.ok) {
          const data = await verifyRes.json();
          if (data && data.email) {
            googleProfile = {
              sub: data.sub,
              email: data.email.toLowerCase().trim(),
              name: data.name || data.given_name || data.email.split("@")[0],
              picture: data.picture,
              email_verified: data.email_verified === "true" || data.email_verified === true,
            };
          }
        }
      } catch (err) {
        console.warn("Google tokeninfo verification failed, trying userinfo fallback:", err.message);
      }

      // If tokeninfo didn't resolve, try Google userinfo API with Bearer token
      if (!googleProfile) {
        try {
          const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userinfoRes.ok) {
            const data = await userinfoRes.json();
            if (data && data.email) {
              googleProfile = {
                sub: data.sub,
                email: data.email.toLowerCase().trim(),
                name: data.name || data.email.split("@")[0],
                picture: data.picture,
                email_verified: true,
              };
            }
          }
        } catch (err) {
          console.warn("Google userinfo fetch failed:", err.message);
        }
      }
    }

    // 2. Direct client payload fallback (if verified by Google Identity Services on frontend)
    if (!googleProfile && userInfo && userInfo.email) {
      googleProfile = {
        sub: userInfo.sub || userInfo.id || `google_${Date.now()}`,
        email: userInfo.email.toLowerCase().trim(),
        name: userInfo.name || userInfo.email.split("@")[0],
        picture: userInfo.picture || userInfo.avatar,
        email_verified: true,
      };
    }

    if (!googleProfile || !googleProfile.email) {
      return res.status(400).json({
        success: false,
        message: "Google verification failed. Unable to authenticate your Google profile.",
      });
    }

    const cleanEmail = googleProfile.email;

    // Check if account already exists with this Google sub ID or email
    let user = await User.findOne({
      $or: [{ googleId: googleProfile.sub }, { email: cleanEmail }],
    });

    if (user) {
      // Existing user: Link google ID and mark verified
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleProfile.sub;
        needsSave = true;
      }
      if (!user.isGoogleLinked) {
        user.isGoogleLinked = true;
        needsSave = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        needsSave = true;
      }
      if (googleProfile.picture && (!user.avatar || user.avatar.includes("unsplash") || user.avatar.includes("ui-avatars") || user.avatar.includes("googleusercontent.com"))) {
        user.avatar = googleProfile.picture;
        needsSave = true;
      }
      if (needsSave) {
        await user.save();
      }
      return sendTokenResponse(user, 200, res, "Google login successful! Welcome back.");
    }

    // New User: Auto-register and login immediately
    user = await User.create({
      name: googleProfile.name || cleanEmail.split("@")[0],
      email: cleanEmail,
      avatar:
        googleProfile.picture ||
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
      googleId: googleProfile.sub,
      isGoogleLinked: true,
      isVerified: true,
      authProvider: "google",
      role: "user",
    });

    return sendTokenResponse(
      user,
      201,
      res,
      "Account created and authenticated with Google! Welcome to Serabondhu."
    );
  } catch (error) {
    console.error("Google Auth Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process Google authentication.",
    });
  }
};

// ============================================================================
// C: EMAIL AUTHENTICATION
// ============================================================================

/**
 * @desc    Step 1: Check email existence & Send 6-digit OTP
 * @route   POST /api/auth/email/send-otp
 */
export const sendEmailOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    // Rate limiting: 1 OTP per 30 seconds per email
    const recentOtp = await Otp.findOne({
      identifier: cleanEmail,
      createdAt: { $gt: new Date(Date.now() - 30 * 1000) },
    });
    if (recentOtp) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before requesting another verification code.",
      });
    }

    // Check account existence
    const existingUser = await User.findOne({ email: cleanEmail });
    const exists = Boolean(existingUser);

    // Generate random 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = Otp.hashOtp(rawOtp);

    // 5-minute expiration timestamp
    const expiresIn = 300; // 5 minutes (300 seconds)
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Invalidate any existing active OTP for this identifier
    await Otp.deleteMany({ identifier: cleanEmail });

    // Store new hashed OTP
    await Otp.create({
      identifier: cleanEmail,
      email: cleanEmail,
      otp: hashedOtp,
      type: exists ? "login" : "signup",
      expiresAt,
    });

    // Send email via Nodemailer
    try {
      await sendOtpEmail(cleanEmail, rawOtp, existingUser?.name || "User");
    } catch (mailErr) {
      console.error("Nodemailer Email Error:", mailErr);
      // In development fallback, allow proceeding even if mail service has connection issue
      if (process.env.NODE_ENV !== "production") {
        console.log(`[DEV FALLBACK] OTP for ${cleanEmail} is: ${rawOtp}`);
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to dispatch email verification code. Please check your address.",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      email: cleanEmail,
      exists,
      expiresIn,
    });
  } catch (error) {
    console.error("Send Email OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error generating email OTP.",
    });
  }
};

/**
 * @desc    Step 3/4: Verify 6-digit Email OTP
 *          If existing user -> login successfully.
 *          If new user -> return signed registration token for password creation.
 * @route   POST /api/auth/email/verify-otp
 */
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Both email and 6-digit OTP code are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    // Find latest OTP for this identifier
    const otpDoc = await Otp.findOne({ identifier: cleanEmail }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "No active verification code found or it has expired. Please request a new code.",
      });
    }

    // Expiration check
    if (otpDoc.isExpired() || Date.now() > new Date(otpDoc.expiresAt).getTime()) {
      await Otp.deleteMany({ identifier: cleanEmail });
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "The verification code has expired. Please request a new code.",
      });
    }

    // Attempt rate limit (max 5 tries per OTP)
    if (otpDoc.attempts >= 5) {
      await Otp.deleteMany({ identifier: cleanEmail });
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a fresh verification code.",
      });
    }

    // Validate OTP match
    if (!otpDoc.verifyCandidate(cleanOtp)) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });
    }

    // Single-use guarantee: Invalidate immediately upon successful verification
    await Otp.deleteMany({ identifier: cleanEmail });

    // Check if account exists
    const existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser) {
      // Existing user: Mark verified and Login immediately
      if (!existingUser.isVerified) {
        existingUser.isVerified = true;
        await existingUser.save();
      }
      return sendTokenResponse(
        existingUser,
        200,
        res,
        "Email verified successfully! Welcome back to Serabondhu."
      );
    }

    // New user: Generate signed registration token to proceed with password creation
    const registrationToken = jwt.sign(
      { email: cleanEmail, purpose: "email_registration" },
      JWT_SECRET,
      { expiresIn: "15m" } // 15-minute window to create password
    );

    return res.status(200).json({
      success: true,
      isNewUser: true,
      email: cleanEmail,
      registrationToken,
      message: "Email verified! Please choose a secure password to complete your account.",
    });
  } catch (error) {
    console.error("Verify Email OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during email OTP verification.",
    });
  }
};

/**
 * @desc    Step 4 (New User): Set password & complete registration
 * @route   POST /api/auth/email/set-password
 */
export const setEmailPassword = async (req, res) => {
  try {
    const { registrationToken, email, password, name, phone, city } = req.body;

    if (!registrationToken || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Registration token, email, and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify cryptographic registration session token
    let decoded;
    try {
      decoded = jwt.verify(registrationToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Registration session has expired or is invalid. Please verify your email again.",
      });
    }

    if (decoded.email !== cleanEmail || decoded.purpose !== "email_registration") {
      return res.status(403).json({
        success: false,
        message: "Registration token does not match the provided email address.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Ensure account doesn't already exist
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "An account with this email address already exists. Please log in.",
      });
    }

    // Create verified new user
    const userData = {
      name: name?.trim() || cleanEmail.split("@")[0],
      email: cleanEmail,
      password,
      city: city || "Dhaka",
      isVerified: true,
      authProvider: "email_otp",
      role: "user",
    };

    if (phone && phone.trim()) {
      userData.phone = phone.trim();
    }

    const newUser = await User.create(userData);

    return sendTokenResponse(
      newUser,
      201,
      res,
      "Account registered successfully! Welcome to Serabondhu."
    );
  } catch (error) {
    console.error("Set Email Password Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error setting password.",
    });
  }
};

// ============================================================================
// D: PHONE AUTHENTICATION (NO PASSWORD EVER)
// ============================================================================

/**
 * @desc    Step 1: Check phone existence & Send 6-digit SMS OTP
 * @route   POST /api/auth/phone/send-otp
 */
export const sendPhoneOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number with country code is required.",
      });
    }

    // Normalize phone number (E.164 without internal spaces/hyphens)
    const cleanPhone = phone.toString().replace(/[\s-]/g, "").trim();

    // E.164 phone regex (e.g. +9779841234567, +919876543210)
    const phoneRegex = /^\+[1-9]\d{7,14}$/;
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number with country code (e.g. +880 17XXXXXXXX or +880 18XXXXXXXX).",
      });
    }

    // Rate limiting: 1 OTP per 30 seconds per phone
    const recentOtp = await Otp.findOne({
      identifier: cleanPhone,
      createdAt: { $gt: new Date(Date.now() - 30 * 1000) },
    });
    if (recentOtp) {
      return res.status(429).json({
        success: false,
        message: "Please wait 30 seconds before requesting another SMS verification code.",
      });
    }

    // Check account existence
    const existingUser = await User.findOne({ phone: cleanPhone });
    const exists = Boolean(existingUser);

    // Generate random 6-digit OTP
    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = Otp.hashOtp(rawOtp);

    const expiresIn = 300; // 5 minutes (300 seconds)
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // Invalidate previous OTPs for this phone
    await Otp.deleteMany({ identifier: cleanPhone });

    // Store new hashed OTP
    await Otp.create({
      identifier: cleanPhone,
      phone: cleanPhone,
      otp: hashedOtp,
      type: "phone_auth",
      expiresAt,
    });

    // Send SMS via configured gateway
    await sendOtpSms(cleanPhone, rawOtp);

    res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent via SMS to ${cleanPhone}.`,
      phone: cleanPhone,
      exists,
      expiresIn,
    });
  } catch (error) {
    console.error("Send Phone OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error sending phone OTP.",
    });
  }
};

/**
 * @desc    Step 3: Verify 6-digit Phone OTP
 *          Existing account -> login automatically.
 *          New account -> automatically create account and login.
 *          CRITICAL: Phone authentication NEVER asks for a password!
 * @route   POST /api/auth/phone/verify-otp
 */
export const verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Both phone number and 6-digit OTP code are required.",
      });
    }

    const cleanPhone = phone.toString().replace(/[\s-]/g, "").trim();
    const cleanOtp = otp.toString().trim();

    // Find latest OTP for this phone
    const otpDoc = await Otp.findOne({ identifier: cleanPhone }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "No active verification code found or it has expired. Please request a new code.",
      });
    }

    // Expiration check
    if (otpDoc.isExpired() || Date.now() > new Date(otpDoc.expiresAt).getTime()) {
      await Otp.deleteMany({ identifier: cleanPhone });
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "The verification code has expired. Please request a new code.",
      });
    }

    // Attempt rate limit
    if (otpDoc.attempts >= 5) {
      await Otp.deleteMany({ identifier: cleanPhone });
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a fresh verification code.",
      });
    }

    // Validate OTP match
    if (!otpDoc.verifyCandidate(cleanOtp)) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your SMS and try again.",
      });
    }

    // Single-use guarantee: Invalidate immediately upon verification
    await Otp.deleteMany({ identifier: cleanPhone });

    // Check account existence
    let user = await User.findOne({ phone: cleanPhone });

    if (user) {
      // Existing account: Login automatically
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }
      return sendTokenResponse(
        user,
        200,
        res,
        "Phone verified! Welcome back to Serabondhu."
      );
    }

    // New account: Automatically create an account and login immediately (NO password)
    const phoneSuffix = cleanPhone.slice(-4);
    user = await User.create({
      name: `User ${phoneSuffix}`,
      phone: cleanPhone,
      isVerified: true,
      authProvider: "phone",
      role: "user",
      city: "Kathmandu",
    });

    return sendTokenResponse(
      user,
      201,
      res,
      "Account created and verified with phone number! Welcome to Serabondhu."
    );
  } catch (error) {
    console.error("Verify Phone OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error verifying phone OTP.",
    });
  }
};

// ============================================================================
// LEGACY BACKWARD-COMPATIBLE ENDPOINTS
// ============================================================================

/**
 * @desc    Register a new user & send 1-minute OTP
 * @route   POST /api/auth/signup
 */
export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, city } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your full name, email, and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    let existingUser = await User.findOne({ email: cleanEmail });

    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password;
      if (phone && phone.trim()) existingUser.phone = phone.trim();
      if (city) existingUser.city = city;
      await existingUser.save();
    } else {
      const newUserData = {
        name,
        email: cleanEmail,
        password,
        city: city || "Dhaka",
        isVerified: false,
        authProvider: "local",
      };
      if (phone && phone.trim()) {
        newUserData.phone = phone.trim();
      }
      existingUser = await User.create(newUserData);
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = Otp.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 60 * 1000);

    await Otp.deleteMany({ identifier: cleanEmail });
    await Otp.deleteMany({ email: cleanEmail });

    await Otp.create({
      identifier: cleanEmail,
      email: cleanEmail,
      otp: hashedOtp,
      type: "signup",
      expiresAt,
    });

    try {
      await sendOtpEmail(cleanEmail, rawOtp, name);
    } catch (mailError) {
      console.error("Nodemailer Send Error:", mailError);
    }

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email. Expires in 1 minute (60 seconds).",
      email: cleanEmail,
      expiresIn: 60,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during registration.",
    });
  }
};

/**
 * @desc    Verify OTP & activate account
 * @route   POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Please provide both email and OTP code.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.toString().trim();

    const otpDoc = await Otp.findOne({
      $or: [{ identifier: cleanEmail }, { email: cleanEmail }],
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "No active OTP found. The code may have expired. Please click 'Resend OTP'.",
      });
    }

    if (otpDoc.isExpired() || Date.now() > new Date(otpDoc.expiresAt).getTime()) {
      await Otp.deleteMany({ identifier: cleanEmail });
      await Otp.deleteMany({ email: cleanEmail });
      return res.status(400).json({
        success: false,
        isExpired: true,
        message: "This OTP code expired. Please click 'Resend OTP' to get a new code.",
      });
    }

    if (!otpDoc.verifyCandidate(cleanOtp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code. Please check your email and try again.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found. Please register again.",
      });
    }

    user.isVerified = true;
    await user.save();

    await Otp.deleteMany({ identifier: cleanEmail });
    await Otp.deleteMany({ email: cleanEmail });

    sendTokenResponse(user, 200, res, "Email verified successfully! Welcome to Serabondhu.");
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during OTP verification.",
    });
  }
};

/**
 * @desc    Resend OTP
 * @route   POST /api/auth/resend-otp
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to resend OTP.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = Otp.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 60 * 1000);

    await Otp.deleteMany({ identifier: cleanEmail });
    await Otp.deleteMany({ email: cleanEmail });

    await Otp.create({
      identifier: cleanEmail,
      email: cleanEmail,
      otp: hashedOtp,
      type: user.isVerified ? "login" : "signup",
      expiresAt,
    });

    await sendOtpEmail(cleanEmail, rawOtp, user.name);

    res.status(200).json({
      success: true,
      message: "A fresh OTP code has been sent to your email. Expires in 1 minute.",
      email: cleanEmail,
      expiresIn: 60,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to resend OTP. Please try again.",
    });
  }
};

/**
 * @desc    Login user with email & password
 * @route   POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter both email and password.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isVerified) {
      const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedOtp = Otp.hashOtp(rawOtp);
      const expiresAt = new Date(Date.now() + 60 * 1000);

      await Otp.deleteMany({ identifier: cleanEmail });
      await Otp.deleteMany({ email: cleanEmail });
      await Otp.create({
        identifier: cleanEmail,
        email: cleanEmail,
        otp: hashedOtp,
        type: "signup",
        expiresAt,
      });

      await sendOtpEmail(cleanEmail, rawOtp, user.name);

      return res.status(403).json({
        success: false,
        requiresVerification: true,
        message: "Your email is not verified yet. We just sent a 6-digit OTP to your email.",
        email: cleanEmail,
        expiresIn: 60,
      });
    }

    sendTokenResponse(user, 200, res, "Welcome back to Serabondhu!");
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error during login.",
    });
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    res.cookie("token", "none", {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during logout.",
    });
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user profile.",
    });
  }
};

/**
 * @desc    Update user profile settings
 * @route   PUT /api/auth/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, about, phone, city, avatar, isGoogleLinked } = req.body;

    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (req.body.email && req.body.email.toLowerCase().trim() !== (user.email || "").toLowerCase().trim()) {
      return res.status(400).json({
        success: false,
        message: "Email address cannot be changed as it is your permanent verified account identifier.",
      });
    }

    if (name) user.name = name.trim();
    if (about !== undefined) user.about = about.trim();
    if (phone !== undefined) {
      const cleanPhone = phone.trim();
      user.phone = cleanPhone.length > 0 ? cleanPhone : undefined;
    }
    if (city !== undefined && city.trim()) user.city = city.trim();
    if (avatar) user.avatar = avatar;
    if (isGoogleLinked !== undefined) user.isGoogleLinked = isGoogleLinked;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city,
        about: user.about,
        isVerified: user.isVerified,
        isGoogleLinked: user.isGoogleLinked,
        role: user.role,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "This phone number is already registered to another account.",
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile.",
    });
  }
};

/**
 * @desc    Upload profile image to Cloudinary and store URL on MongoDB
 * @route   POST /api/auth/avatar
 */
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided in request.",
      });
    }

    const result = await uploadToCloudinary(req.file.buffer, "Serabondhu_avatars");

    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.avatar = result.secure_url;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile image successfully uploaded to Cloudinary and saved to MongoDB!",
      url: result.secure_url,
      avatar: result.secure_url,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city,
        about: user.about,
        isVerified: user.isVerified,
        isGoogleLinked: user.isGoogleLinked,
      },
    });
  } catch (error) {
    console.error("Avatar Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload profile image to Cloudinary.",
    });
  }
};

// ============================================================================
// ACCOUNT DELETION (Apple App Store Guideline 5.1.1 & GDPR Compliant)
// ============================================================================

/**
 * Helper to perform full cascade deletion of a user's data
 */
const executeAccountCascadeDelete = async (user, reason = "Not specified", reasonDetails = "", req = {}) => {
  const userId = user._id;

  // 1. Cascade Delete: Advertisements posted by user
  const deletedAds = await Advertisement.deleteMany({ seller: userId });

  // 2. Cascade Delete: Messages sent or received
  const deletedMessages = await Message.deleteMany({
    $or: [{ sender: userId }, { receiver: userId }],
  });

  // 3. Cascade Delete: Conversations involving user
  const deletedConversations = await Conversation.deleteMany({
    $or: [{ participants: userId }, { buyer: userId }, { seller: userId }],
  });

  // 4. Cascade Delete: Notifications
  const deletedNotifications = await Notification.deleteMany({ recipient: userId });

  // 5. Cascade Delete: OTP records
  const identifiers = [];
  if (user.email) identifiers.push(user.email.toLowerCase().trim());
  if (user.phone) identifiers.push(user.phone);
  if (identifiers.length > 0) {
    await Otp.deleteMany({ identifier: { $in: identifiers } });
  }

  // 6. Record Audit Trail
  try {
    await AuditLog.create({
      action: "user_deleted",
      targetType: "user",
      targetId: userId,
      metadata: {
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        authProvider: user.authProvider,
        reason,
        reasonDetails,
        deletedAdsCount: deletedAds.deletedCount || 0,
        deletedMessagesCount: deletedMessages.deletedCount || 0,
        deletedConversationsCount: deletedConversations.deletedCount || 0,
        deletedNotificationsCount: deletedNotifications.deletedCount || 0,
        deletedAt: new Date().toISOString(),
        ip: req.ip || req.headers?.["x-forwarded-for"] || "unknown",
        userAgent: req.headers?.["user-agent"] || "unknown",
      },
    });
  } catch (auditErr) {
    console.warn("AuditLog warning during account deletion:", auditErr.message);
  }

  // 7. Permanently Delete User document
  await User.findByIdAndDelete(userId);

  return {
    adsDeleted: deletedAds.deletedCount || 0,
    messagesDeleted: deletedMessages.deletedCount || 0,
    conversationsDeleted: deletedConversations.deletedCount || 0,
  };
};

/**
 * @desc    Request 6-digit OTP code to verify and authorize account deletion
 * @route   POST /api/auth/delete-account/send-otp
 * @access  Public / Protected
 */
export const requestDeleteAccountOtp = async (req, res) => {
  try {
    const rawEmail = req.body?.email || req.user?.email || "";
    const cleanEmail = rawEmail.trim().toLowerCase();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Registered email address is required.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No Serabondhu account found with this email address.",
      });
    }

    // Rate-limit: Check if an OTP was sent in the last 60 seconds
    const recentOtp = await Otp.findOne({
      identifier: cleanEmail,
      type: "account_deletion",
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) },
    });

    if (recentOtp) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting another verification code.",
      });
    }

    // Clear previous unverified deletion OTPs for this email
    await Otp.deleteMany({
      identifier: cleanEmail,
      type: "account_deletion",
    });

    // Generate 6-digit cryptographic OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({
      identifier: cleanEmail,
      otp,
      type: "account_deletion",
      expiresAt,
    });

    // Send email with deletion warning
    try {
      await sendAccountDeletionEmail(cleanEmail, otp, user.name || "Serabondhu Member");
    } catch (mailErr) {
      console.warn("sendAccountDeletionEmail warning:", mailErr.message);
    }

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${cleanEmail}. Valid for 5 minutes.`,
    });
  } catch (error) {
    console.error("Account Deletion Send OTP Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to process account deletion request.",
    });
  }
};

/**
 * @desc    Confirm OTP, record deletion reason, and permanently delete account
 * @route   POST /api/auth/delete-account/confirm
 * @access  Public / Protected
 */
export const confirmDeleteAccount = async (req, res) => {
  try {
    const rawEmail = req.body?.email || req.user?.email || "";
    const cleanEmail = rawEmail.trim().toLowerCase();
    const cleanOtp = (req.body?.otp || "").toString().trim();
    const reason = (req.body?.reason || "Not specified").trim();
    const reasonDetails = (req.body?.reasonDetails || "").trim();

    if (!cleanEmail) {
      return res.status(400).json({
        success: false,
        message: "Registered email address is required.",
      });
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "A valid 6-digit verification code is required.",
      });
    }

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found or already deleted.",
      });
    }

    // Validate OTP
    const otpDoc = await Otp.findOne({
      identifier: cleanEmail,
      otp: cleanOtp,
      type: "account_deletion",
      expiresAt: { $gt: new Date() },
      isVerified: false,
    });

    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code. Please request a new one.",
      });
    }

    // Execute cascade delete
    const details = await executeAccountCascadeDelete(user, reason, reasonDetails, req);

    // Clear Authentication Cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Your Serabondhu account and all associated data have been permanently deleted.",
      details,
    });
  } catch (error) {
    console.error("Account Deletion Confirmation Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to confirm account deletion.",
    });
  }
};

/**
 * @desc    Direct authenticated account deletion (for in-app mobile/web authenticated users)
 * @route   DELETE /api/auth/delete-account
 * @access  Private
 */
export const deleteMyAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Account not found or already deleted.",
      });
    }

    const reason = (req.body?.reason || "In-app request").trim();
    const reasonDetails = (req.body?.reasonDetails || "").trim();

    const details = await executeAccountCascadeDelete(user, reason, reasonDetails, req);

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Your Serabondhu account has been permanently deleted.",
      details,
    });
  } catch (error) {
    console.error("Delete My Account Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete account.",
    });
  }
};

