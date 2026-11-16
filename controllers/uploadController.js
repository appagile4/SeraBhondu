import { uploadToCloudinary } from "../config/cloudinary.js";

/**
 * @desc    Upload an image file directly to Cloudinary
 * @route   POST /api/upload
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided in request.",
      });
    }

    const folder = req.body.folder || "serabondhu_users";
    const result = await uploadToCloudinary(req.file.buffer, folder);

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully to Cloudinary!",
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image to Cloudinary.",
    });
  }
};

/**
 * @desc    Upload multiple images to Cloudinary (up to 8 files for ads)
 * @route   POST /api/upload/multiple
 */
export const uploadMultiple = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided.",
      });
    }

    const folder = req.body.folder || "serabondhu_advertisements";
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, folder)
    );

    const results = await Promise.all(uploadPromises);

    const uploadedImages = results.map((r) => ({
      url: r.secure_url,
      publicId: r.public_id,
      width: r.width,
      height: r.height,
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedImages.length} images uploaded to Cloudinary successfully!`,
      images: uploadedImages,
    });
  } catch (error) {
    console.error("Cloudinary Multi-Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload images to Cloudinary.",
    });
  }
};

