import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "x8vpeeyg",
  api_key: process.env.CLOUDINARY_API_KEY || "178442332451356",
  api_secret: process.env.CLOUDINARY_API_SECRET || "y8D-UR3xBoXGPPNhg0LAINn_m50",
});

/**
 * Upload buffer directly to Cloudinary
 */
export const uploadToCloudinary = (fileBuffer, folder = "serabondhu_users") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default cloudinary;
