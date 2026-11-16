import mongoose from "mongoose";
import dotenv from "dotenv";
import Otp from "../models/Otp.js";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const BASE_URL = "http://localhost:5000/api/auth";

async function runFullFlow() {
  console.log("=== Testing Full Auth Flows (Verification & Sessions) ===");
  await mongoose.connect(process.env.MONGO_URI);

  // 1. Test Phone Verification
  const testPhone = "+9779877788899";
  console.log("\n[1] Sending Phone OTP...");
  await fetch(`${BASE_URL}/phone/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: testPhone }),
  });

  // Fetch the latest OTP record from DB to verify it (and check that it's hashed!)
  const phoneOtpDoc = await Otp.findOne({ identifier: testPhone }).sort({ createdAt: -1 });
  console.log("DB Phone OTP Hash exists:", Boolean(phoneOtpDoc?.otp));
  console.log("Is Hashed (length 64):", phoneOtpDoc?.otp?.length === 64);

  // 2. Test Email Full Flow
  const testEmail = "nepal.buyer2026@gmail.com";
  console.log("\n[2] Sending Email OTP...");
  const emailSendRes = await fetch(`${BASE_URL}/email/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: testEmail }),
  });
  const emailSendData = await emailSendRes.json();
  console.log("Email OTP Send Result:", emailSendData.success, "Exists:", emailSendData.exists);

  // 3. Google Existing User Login
  console.log("\n[3] Testing Existing Google User Login...");
  const googleRes = await fetch(`${BASE_URL}/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userInfo: {
        sub: "test_google_123456",
        email: "test.google.user@example.com",
        name: "Test Google User",
      },
    }),
  });
  const googleData = await googleRes.json();
  console.log("Google Existing User Status:", googleRes.status, "Token exists:", Boolean(googleData.token));

  await mongoose.disconnect();
  console.log("\n=== Full Flow Backend Verification Complete ===");
}

runFullFlow();
