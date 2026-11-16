import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

export const ensureAdminExists = async () => {
  try {
    const adminEmail = process.env.SUPERADMIN_EMAIL || "admin@khojobangla.com";
    const adminPassword = process.env.SUPERADMIN_PASSWORD || "Admin@KhojoBangla2026!";

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = await User.create({
        name: "KhojoBangla Superadmin",
        email: adminEmail,
        password: adminPassword,
        phone: "+880 1700 000000",
        role: "superadmin",
        isVerified: true,
        city: "Dhaka",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        about: "Official Superadmin account of KhojoBangla Marketplace.",
      });
      console.log(`✅ Default Superadmin created: ${adminEmail} (password: ${adminPassword})`);
    } else {
      // Ensure existing admin user has superadmin role & verified status
      if (admin.role !== "superadmin" || !admin.isVerified) {
        admin.role = "superadmin";
        admin.isVerified = true;
        await admin.save();
        console.log(`✅ Superadmin role confirmed for: ${adminEmail}`);
      } else {
        console.log(`ℹ️ Superadmin already exists and verified: ${adminEmail}`);
      }
    }
    return admin;
  } catch (error) {
    console.error("Superadmin Seed Error:", error.message);
  }
};

// Execute directly if run as standalone script
if (process.argv[1]?.endsWith("seedAdmin.js")) {
  import("../config/db.js").then(async ({ connectDB }) => {
    await connectDB();
    await ensureAdminExists();
    process.exit(0);
  });
}
