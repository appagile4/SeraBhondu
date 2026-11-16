import Banner from "../models/Banner.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import cloudinary from "../config/cloudinary.js";

/**
 * Default starter banners if none exist in MongoDB yet
 */
const DEFAULT_BANNERS = [
  {
    title: "KhojoBangla — কিনুন • বিক্রি করুন • খুঁজে নিন বাংলায়",
    subtitle: "Discover great deals, buy & sell anything, and find what you need across Dhaka & all of Bangladesh!",
    imageUrl: "/khojobangla-hero-banner.jpg",
    linkUrl: "/search",
    order: 1,
    isActive: true,
  },
  {
    title: "Sell Fast & Direct â Zero Listing Fees",
    subtitle: "List your used cars, bikes, mobile phones, and electronics in under 2 minutes with verified buyers.",
    imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=1280&q=80",
    linkUrl: "/post-ad",
    order: 2,
    isActive: true,
  },
  {
    title: "Verified Real Estate & Apartments",
    subtitle: "Explore verified houses, land, and rental apartments across Bagmati, Gandaki and all provinces.",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&q=80",
    linkUrl: "/category/houses-apartments-for-sale",
    order: 3,
    isActive: true,
  },
];

/**
 * @desc    Get all active banners for public homepage hero carousel
 * @route   GET /api/banners
 * @access  Public
 */
export const getActiveBanners = async (req, res) => {
  try {
    let banners = await Banner.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    // If no banners in DB yet, seed the default set so carousel works immediately
    if (banners.length === 0) {
      await Banner.insertMany(DEFAULT_BANNERS);
      banners = await Banner.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .lean();
    }

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error("Get Active Banners Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch homepage banners.",
    });
  }
};

/**
 * @desc    Get all banners for Superadmin management (active and inactive)
 * @route   GET /api/banners/admin/all OR GET /api/admin/banners
 * @access  Private (Superadmin)
 */
export const getAdminBanners = async (req, res) => {
  try {
    let banners = await Banner.find()
      .sort({ order: 1, createdAt: -1 })
      .populate("createdBy", "name email")
      .lean();

    if (banners.length === 0) {
      await Banner.insertMany(DEFAULT_BANNERS);
      banners = await Banner.find()
        .sort({ order: 1, createdAt: -1 })
        .populate("createdBy", "name email")
        .lean();
    }

    res.status(200).json({
      success: true,
      count: banners.length,
      banners,
    });
  } catch (error) {
    console.error("Get Admin Banners Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch banners.",
    });
  }
};

/**
 * @desc    Upload & create a new banner (supports unlimited uploads to Cloudinary)
 * @route   POST /api/banners
 * @access  Private (Superadmin)
 */
export const createBanner = async (req, res) => {
  try {
    let { title = "", subtitle = "", linkUrl = "/search", order = 0, isActive = true, imageUrl } = req.body;

    let finalImageUrl = imageUrl;
    let finalImagePublicId = "";

    // If an image file was uploaded via multer, upload buffer to Cloudinary
    if (req.file) {
      const uploadResult = await uploadToCloudinary(req.file.buffer, "khojobangla_banners");
      finalImageUrl = uploadResult.secure_url;
      finalImagePublicId = uploadResult.public_id;
    }

    if (!finalImageUrl) {
      return res.status(400).json({
        success: false,
        message: "Banner image file or imageUrl is required.",
      });
    }

    const banner = await Banner.create({
      title: title.trim(),
      subtitle: subtitle.trim(),
      imageUrl: finalImageUrl,
      imagePublicId: finalImagePublicId,
      linkUrl: linkUrl.trim() || "/search",
      order: Number(order) || 0,
      isActive: isActive === "true" || isActive === true,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Banner created and published successfully.",
      banner,
    });
  } catch (error) {
    console.error("Create Banner Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create banner.",
    });
  }
};

/**
 * @desc    Update banner details or replace banner image
 * @route   PUT /api/banners/:id
 * @access  Private (Superadmin)
 */
export const updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }

    const { title, subtitle, linkUrl, order, isActive, imageUrl } = req.body;

    if (req.file) {
      // Remove old image from Cloudinary if it exists
      if (banner.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(banner.imagePublicId);
        } catch {}
      }

      const uploadResult = await uploadToCloudinary(req.file.buffer, "khojobangla_banners");
      banner.imageUrl = uploadResult.secure_url;
      banner.imagePublicId = uploadResult.public_id;
    } else if (imageUrl) {
      banner.imageUrl = imageUrl;
    }

    if (title !== undefined) banner.title = title.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle.trim();
    if (linkUrl !== undefined) banner.linkUrl = linkUrl.trim();
    if (order !== undefined) banner.order = Number(order);
    if (isActive !== undefined) banner.isActive = isActive === "true" || isActive === true;

    await banner.save();

    res.status(200).json({
      success: true,
      message: "Banner updated successfully.",
      banner,
    });
  } catch (error) {
    console.error("Update Banner Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update banner.",
    });
  }
};

/**
 * @desc    Delete a banner
 * @route   DELETE /api/banners/:id
 * @access  Private (Superadmin)
 */
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found.",
      });
    }

    if (banner.imagePublicId) {
      try {
        await cloudinary.uploader.destroy(banner.imagePublicId);
      } catch {}
    }

    await Banner.findByIdAndDelete(banner._id);

    res.status(200).json({
      success: true,
      message: "Banner deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Banner Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete banner.",
    });
  }
};

/**
 * @desc    Reorder banners
 * @route   PUT /api/banners/reorder
 * @access  Private (Superadmin)
 */
export const reorderBanners = async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, order }

    if (!Array.isArray(orders)) {
      return res.status(400).json({
        success: false,
        message: "Orders array is required.",
      });
    }

    await Promise.all(
      orders.map((item) =>
        Banner.findByIdAndUpdate(item.id, { $set: { order: item.order } })
      )
    );

    res.status(200).json({
      success: true,
      message: "Banner display orders updated.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reorder banners.",
    });
  }
};

