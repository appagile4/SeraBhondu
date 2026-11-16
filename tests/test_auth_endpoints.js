const BASE_URL = "http://localhost:5000/api/auth";

async function runTests() {
  console.log("=== DealDoko Unified Authentication Backend Tests ===");

  // 1. Test Google Auth
  console.log("\n[Test 1] Testing Google Auth Endpoint...");
  try {
    const res = await fetch(`${BASE_URL}/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userInfo: {
          sub: "test_google_123456",
          email: "test.google.user@example.com",
          name: "Test Google User",
          picture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
        },
      }),
    });
    const data = await res.json();
    console.log("Status:", res.status, "Response:", data.success ? "SUCCESS" : "FAILED", data.message || "");
  } catch (e) {
    console.error("Test 1 error:", e.message);
  }

  // 2. Test Phone OTP Send & Verify (Passwordless)
  console.log("\n[Test 2] Testing Phone OTP Send (Passwordless)...");
  const testPhone = "+9779811122233";
  try {
    const res = await fetch(`${BASE_URL}/phone/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: testPhone }),
    });
    const data = await res.json();
    console.log("Status:", res.status, "Response:", data.success ? "SUCCESS" : "FAILED", data.message || "");
  } catch (e) {
    console.error("Test 2 error:", e.message);
  }

  // 3. Test Email OTP Send
  console.log("\n[Test 3] Testing Email OTP Send...");
  const testEmail = "test.unified.auth@example.com";
  try {
    const res = await fetch(`${BASE_URL}/email/send-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const data = await res.json();
    console.log("Status:", res.status, "Response:", data.success ? "SUCCESS" : "FAILED", data.message || "");
  } catch (e) {
    console.error("Test 3 error:", e.message);
  }

  console.log("\n=== Test Suite Complete ===");
}

runTests();
