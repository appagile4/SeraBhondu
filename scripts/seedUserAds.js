import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import Advertisement from "../models/Advertisement.js";
import { connectDB } from "../config/db.js";

dotenv.config();

async function seedUserAds() {
  await connectDB();
  console.log("Connected to MongoDB.");

  const aarav = await User.findOne({ email: "aarav.shrestha@khojobangla.com" });
  const pooja = await User.findOne({ email: "pooja.adhikari@khojobangla.com" });

  if (!aarav || !pooja) {
    console.error("Users not found, please run seedTwoUsers.js first.");
    process.exit(1);
  }

  // Clear existing ads for these two to avoid duplicates
  await Advertisement.deleteMany({ seller: { $in: [aarav._id, pooja._id] } });

  const ads = [
    // Aarav's Ads
    {
      title: "Apple MacBook Air M2 16GB 512GB Space Gray",
      slug: "apple-macbook-air-m2-16gb-512gb-space-gray-5512",
      description: "M2 chip with 8-core CPU and 10-core GPU, 16GB unified memory, 512GB SSD storage. Battery health 97%. In pristine condition with original 35W dual charger and box.",
      price: 135000,
      category: "electronics-appliances",
      subCategory: "laptops",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80", publicId: "" },
        { url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80", publicId: "" },
      ],
      location: {
        city: "Dhaka",
        state: "Dhaka Division",
        area: "New Road",
      },
      seller: aarav._id,
      sellerContact: {
        name: aarav.name,
        phone: aarav.phone,
        email: aarav.email,
      },
      attributes: {
        RAM: "16GB",
        Storage: "512GB",
        Processor: "Apple M2",
      },
      status: "approved",
      isFeatured: true,
      viewsCount: 42,
    },
    {
      title: "GoPro Hero 12 Black with 3 Enduro Batteries",
      slug: "gopro-hero-12-black-with-3-enduro-batteries-9811",
      description: "GoPro Hero 12 Black in brand new condition. Used only once on Annapurna trek. Includes 3 Enduro batteries, dual charger, floaty handle, and waterproof housing case.",
      price: 52000,
      category: "electronics-appliances",
      subCategory: "cameras",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&w=800&q=80", publicId: "" },
      ],
      location: {
        city: "Dhaka",
        state: "Dhaka Division",
        area: "Thamel",
      },
      seller: aarav._id,
      sellerContact: {
        name: aarav.name,
        phone: aarav.phone,
        email: aarav.email,
      },
      attributes: {
        Brand: "GoPro",
        Model: "Hero 12 Black",
      },
      status: "pending", // Waiting for review
      isFeatured: false,
      viewsCount: 6,
    },

    // Pooja's Ads
    {
      title: "Modern L-Shaped Sectional Velvet Sofa Emerald Green",
      slug: "modern-l-shaped-sectional-velvet-sofa-emerald-green-3321",
      description: "Custom built 6-seater luxury velvet sectional sofa. Premium high-density foam, solid teak wood internal frame. Super comfortable, stain protected. Only 6 months in home use.",
      price: 48000,
      category: "furniture",
      subCategory: "sofas",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80", publicId: "" },
      ],
      location: {
        city: "Pokhara",
        state: "Gandaki",
        area: "Lakeside",
      },
      seller: pooja._id,
      sellerContact: {
        name: pooja.name,
        phone: pooja.phone,
        email: pooja.email,
      },
      attributes: {
        Material: "Velvet & Teak Wood",
        Seating: "6 Seater",
        Color: "Emerald Green",
      },
      status: "approved",
      isFeatured: true,
      viewsCount: 88,
    },
    {
      title: "Sony Alpha A7 IV Full-Frame Mirrorless Camera Body",
      slug: "sony-alpha-a7-iv-full-frame-mirrorless-camera-body-7742",
      description: "33MP BSI full-frame sensor, 4K 60p 10-bit video. Shutter count only 4,200. Clean sensor, screen protector on from day one. Box and accessories included.",
      price: 260000,
      category: "electronics-appliances",
      subCategory: "cameras",
      condition: "Used",
      images: [
        { url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80", publicId: "" },
      ],
      location: {
        city: "Pokhara",
        state: "Gandaki",
        area: "Lakeside",
      },
      seller: pooja._id,
      sellerContact: {
        name: pooja.name,
        phone: pooja.phone,
        email: pooja.email,
      },
      attributes: {
        Brand: "Sony",
        Resolution: "33MP Full-Frame",
        Sensor: "BSI CMOS",
      },
      status: "pending", // Waiting for review
      isFeatured: false,
      viewsCount: 14,
    },
  ];

  await Advertisement.insertMany(ads);
  console.log("✓ Seeded 4 advertisements (2 approved live, 2 pending review) for Aarav & Pooja!");

  process.exit(0);
}

seedUserAds().catch((err) => {
  console.error(err);
  process.exit(1);
});

