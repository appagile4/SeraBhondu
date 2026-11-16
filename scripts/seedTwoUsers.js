import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { connectDB } from "../config/db.js";

dotenv.config();

const usersToSeed = [
  {
    name: "Rafiqul Islam",
    email: "rafiqul.islam@khojobangla.com",
    password: "UserPassword123!",
    phone: "+880 1819 876543",
    city: "Dhaka",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    about: "Avid tech enthusiast and verified electronics seller based in Dhanmondi, Dhaka.",
    isVerified: true,
    role: "user",
    status: "active",
    isSuspended: false,
  },
  {
    name: "Nusrat Jahan",
    email: "nusrat.jahan@khojobangla.com",
    password: "UserPassword123!",
    phone: "+880 1918 765432",
    city: "Chattogram",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    about: "Home decor, lifestyle & photography gear seller located in Agrabad, Chattogram.",
    isVerified: true,
    role: "user",
    status: "active",
    isSuspended: false,
  },
];

async function seed() {
  try {
    await connectDB();
    console.log("Connected to MongoDB Atlas database.");

    for (const userData of usersToSeed) {
      let existing = await User.findOne({ email: userData.email });

      if (existing) {
        existing.name = userData.name;
        existing.phone = userData.phone;
        existing.city = userData.city;
        existing.avatar = userData.avatar;
        existing.about = userData.about;
        existing.isVerified = userData.isVerified;
        existing.role = userData.role;
        existing.status = userData.status;
        existing.isSuspended = false;

        // Reset password
        existing.password = userData.password;
        await existing.save();

        console.log(`✓ Updated existing user: ${userData.name} (${userData.email}) [ID: ${existing._id}]`);
      } else {
        const created = await User.create(userData);
        console.log(`✓ Created new user: ${userData.name} (${userData.email}) [ID: ${created._id}]`);
      }
    }

    // Verify authentication for both
    console.log("\n--- VERIFYING LOGIN CAPABILITY ---");
    for (const u of usersToSeed) {
      const user = await User.findOne({ email: u.email }).select("+password");
      const isMatch = await user.matchPassword(u.password);
      if (isMatch) {
        console.log(`✓ Login Verified for ${u.email}: SUCCESS (Password: ${u.password})`);
      } else {
        console.error(`✗ Login verification failed for ${u.email}`);
      }
    }

    console.log("\n================================================");
    console.log("SEEDED 2 USERS SUCCESSFULLY IN MONGODB ATLAS:");
    console.log("1. Rafiqul Islam");
    console.log("   Email:    rafiqul.islam@khojobangla.com");
    console.log("   Password: UserPassword123!");
    console.log("   City:     Dhaka");
    console.log("   Phone:    +880 1819 876543");
    console.log("");
    console.log("2. Nusrat Jahan");
    console.log("   Email:    nusrat.jahan@khojobangla.com");
    console.log("   Password: UserPassword123!");
    console.log("   City:     Chattogram");
    console.log("   Phone:    +880 1918 765432");
    console.log("================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();

