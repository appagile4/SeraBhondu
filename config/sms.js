import dotenv from "dotenv";
dotenv.config();

/**
 * Send SMS verification code to phone number.
 * Supports configurable SMS gateways (e.g. Sparrow SMS Nepal, Twilio, or dev logging)
 */
export const sendOtpSms = async (phone, otp) => {
  const cleanPhone = phone.trim();
  const message = `Your KhojoBangla verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

  console.log(`\n======================================================`);
  console.log(`📱 [KhojoBangla SMS Gateway] OUTBOUND SMS DISPATCH`);
  console.log(`Recipient Phone : ${cleanPhone}`);
  console.log(`Verification OTP: ${otp}`);
  console.log(`Message Body    : ${message}`);
  console.log(`======================================================\n`);

  // 1. Sparrow / Regional SMS Provider
  if (process.env.SPARROW_SMS_TOKEN) {
    try {
      const response = await fetch("http://api.sparrowsms.com/v2/sms/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: process.env.SPARROW_SMS_TOKEN,
          from: process.env.SPARROW_SMS_FROM || "KhojoBangla",
          to: cleanPhone.replace(/^\+880|^\+977/, ""),
          text: message,
        }),
      });
      const data = await response.json();
      console.log("Sparrow SMS API Response:", data);
      return { success: true, provider: "sparrow", data };
    } catch (err) {
      console.error("Sparrow SMS Error:", err.message);
    }
  }

  // 2. Twilio SMS
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const params = new URLSearchParams();
      params.append("To", cleanPhone);
      params.append("From", process.env.TWILIO_PHONE_NUMBER);
      params.append("Body", message);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        }
      );
      const data = await response.json();
      console.log("Twilio SMS API Response:", data);
      return { success: true, provider: "twilio", data };
    } catch (err) {
      console.error("Twilio SMS Error:", err.message);
    }
  }

  // Fallback dev mode (Always succeeds and logs to console)
  return { success: true, provider: "dev_console", phone: cleanPhone };
};

export default sendOtpSms;
