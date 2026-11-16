import mongoose from "mongoose";
import crypto from "crypto";

const otpSchema = new mongoose.Schema(
  {
    // Normalized identifier (lowercased email or standard phone number with country code)
    identifier: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    // Hashed OTP code (SHA-256) for production-grade security (never plaintext)
    otp: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["signup", "login", "reset", "email_auth", "phone_auth"],
      default: "login",
    },
    attempts: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      // MongoDB TTL index: automatically deletes document when expiresAt arrives
      index: { expires: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify if OTP has expired
otpSchema.methods.isExpired = function () {
  return Date.now() > new Date(this.expiresAt).getTime();
};

// Static method to produce a secure SHA-256 hash of an OTP code
otpSchema.statics.hashOtp = function (rawOtp) {
  const salt = process.env.JWT_SECRET || "serabondhu_classifieds_bangladesh_jwt_secret_token_2026_key";
  return crypto.createHash("sha256").update(rawOtp.toString().trim() + salt).digest("hex");
};

// Instance method to verify a candidate OTP code against the stored hash
otpSchema.methods.verifyCandidate = function (candidateOtp) {
  const hashedCandidate = otpSchema.statics.hashOtp(candidateOtp);
  // Also support plaintext match for backward compatibility if any legacy records exist
  return this.otp === hashedCandidate || this.otp === candidateOtp.toString().trim();
};

export const Otp = mongoose.model("Otp", otpSchema);
export default Otp;
