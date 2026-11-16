import Advertisement from "../models/Advertisement.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../config/socket.js";

/**
 * Generate URL-friendly unique slug from title
 */
const generateSlug = (title) => {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleanTitle}-${randomSuffix}`;
};

/**
 * @desc    Create new advertisement (Always enters 'pending' state awaiting approval)
 * @route   POST /api/advertisements
 * @access  Private
 */
export const createAdvertisement = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      subCategory,
      condition,
      images,
      location,
      attributes,
      sellerContact,
    } = req.body;

    if (!title || title.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: "Title must be at least 8 characters long.",
      });
    }

    if (!description || description.trim().length < 15) {
      return res.status(400).json({
        success: false,
        message: "Description must be at least 15 characters long.",
      });
    }

    if (price === undefined || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Please specify a valid non-negative price.",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Please choose an advertisement category.",
      });
    }

    // Process images
    const processedImages = Array.isArray(images)
      ? images.map((img) =>
          typeof img === "string" ? { url: img, publicId: "" } : img
        )
      : [];

    const slug = generateSlug(title);

    const advertisement = await Advertisement.create({
      title: title.trim(),
      slug,
      description: description.trim(),
      price: Number(price),
      category: category.toLowerCase().trim(),
      subCategory: subCategory ? subCategory.toLowerCase().trim() : "",
      condition: condition || "Used",
      images: processedImages,
      location: {
        state: location?.state || "Dhaka Division",
        city: location?.city || "Dhaka",
        area: location?.area || "",
        pincode: location?.pincode || "",
        latitude:
          location?.latitude !== undefined &&
          location?.latitude !== null &&
          location?.latitude !== ""
            ? Number(location.latitude)
            : null,
        longitude:
          location?.longitude !== undefined &&
          location?.longitude !== null &&
          location?.longitude !== ""
            ? Number(location.longitude)
            : null,
      },
      seller: req.user._id,
      sellerContact: {
        name: sellerContact?.name || req.user.name,
        phone: sellerContact?.phone || req.user.phone,
        email: req.user.email,
      },
      attributes: attributes || {},
      status: "pending", // ALWAYS enters pending approval
      isFeatured: false,
    });

    // Notify Superadmins via Socket.IO if available
    try {
      const io = getIO();
      if (io) {
        io.to("superadmin_room").emit("ad:new_pending", {
          message: "New advertisement submitted awaiting approval.",
          advertisement: {
            id: advertisement._id,
            title: advertisement.title,
            category: advertisement.category,
            price: advertisement.price,
            seller: req.user.name,
            createdAt: advertisement.createdAt,
          },
        });
      }
    } catch {
      // Socket notification non-fatal
    }

    res.status(201).json({
      success: true,
      message:
        "Your advertisement has been submitted successfully and is awaiting admin approval.",
      advertisement,
    });
  } catch (error) {
    console.error("Create Advertisement Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create advertisement.",
    });
  }
};

/**
 * @desc    Get all APPROVED advertisements (Public Marketplace)
 * @route   GET /api/advertisements
 * @access  Public
 */
export const getApprovedAdvertisements = async (req, res) => {
  try {
    const {
      category,
      city,
      minPrice,
      maxPrice,
      condition,
      sortBy,
      page = 1,
      limit = 16,
    } = req.query;

    // STRICT MANDATORY RULE: Only approved advertisements
    const filter = { status: "approved" };

    if (category && category !== "all") {
      filter.category = category.toLowerCase().trim();
    }

    if (city && city !== "All Bangladesh" && city !== "All Nepal") {
      filter["location.city"] = new RegExp(`^${city}$`, "i");
    }

    if (condition && condition !== "All") {
      filter.condition = condition;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Sort order
    let sort = { createdAt: -1 }; // default newest
    if (sortBy === "oldest") sort = { createdAt: 1 };
    else if (sortBy === "price_asc") sort = { price: 1 };
    else if (sortBy === "price_desc") sort = { price: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Advertisement.countDocuments(filter);
    const advertisements = await Advertisement.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .populate("seller", "name avatar city isVerified createdAt phone");

    res.status(200).json({
      success: true,
      count: advertisements.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      advertisements,
    });
  } catch (error) {
    console.error("Get Advertisements Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch advertisements.",
    });
  }
};

/**
 * @desc    Get featured approved advertisements for homepage
 * @route   GET /api/advertisements/featured
 * @access  Public
 */
export const getFeaturedAdvertisements = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const filter = { status: "approved", isFeatured: true };

    let ads = await Advertisement.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("seller", "name avatar city isVerified createdAt");

    // If fewer than limit featured ads, fallback to latest approved ads
    if (ads.length < limit) {
      const remainingLimit = limit - ads.length;
      const existingIds = ads.map((a) => a._id);
      const fallbackAds = await Advertisement.find({
        status: "approved",
        _id: { $nin: existingIds },
      })
        .sort({ createdAt: -1 })
        .limit(remainingLimit)
        .populate("seller", "name avatar city isVerified createdAt");

      ads = [...ads, ...fallbackAds];
    }

    res.status(200).json({
      success: true,
      count: ads.length,
      advertisements: ads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch featured advertisements.",
    });
  }
};

/**
 * @desc    Get single advertisement by slug (Public view with privacy protections)
 * @route   GET /api/advertisements/slug/:slug
 * @access  Public
 */
export const getAdvertisementBySlug = async (req, res) => {
  try {
    const ad = await Advertisement.findOne({ slug: req.params.slug })
      .populate("seller", "name avatar city isVerified phone email createdAt about");

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    // PRIVACY RULE: If ad is NOT approved, only seller or superadmin can view it
    if (ad.status !== "approved") {
      const isOwner = req.user && ad.seller && ad.seller._id.equals(req.user._id);
      const isAdmin = req.user && req.user.role === "superadmin";

      if (!isOwner && !isAdmin) {
        return res.status(404).json({
          success: false,
          message: "Advertisement is currently under review or inactive.",
        });
      }
    }

    // Increment view count asynchronously
    ad.viewsCount = (ad.viewsCount || 0) + 1;
    await ad.save();

    res.status(200).json({
      success: true,
      advertisement: ad,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch advertisement details.",
    });
  }
};

/**
 * @desc    Search approved advertisements (Full text search)
 * @route   GET /api/advertisements/search
 * @access  Public
 */
export const searchAdvertisements = async (req, res) => {
  try {
    const { q, city, category, page = 1, limit = 16 } = req.query;

    const filter = { status: "approved" };

    if (q && q.trim()) {
      filter.$or = [
        { title: { $regex: q.trim(), $options: "i" } },
        { description: { $regex: q.trim(), $options: "i" } },
        { category: { $regex: q.trim(), $options: "i" } },
      ];
    }

    if (city && city !== "All Bangladesh" && city !== "All Nepal") {
      filter["location.city"] = new RegExp(`^${city}$`, "i");
    }

    if (category && category !== "all") {
      filter.category = category.toLowerCase().trim();
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Advertisement.countDocuments(filter);
    const advertisements = await Advertisement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("seller", "name avatar city isVerified createdAt");

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      advertisements,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed.",
    });
  }
};

/**
 * @desc    Get related approved advertisements in the same category
 * @route   GET /api/advertisements/:id/related
 * @access  Public
 */
export const getRelatedAdvertisements = async (req, res) => {
  try {
    const currentAd = await Advertisement.findById(req.params.id);
    if (!currentAd) {
      return res.status(404).json({ success: false, message: "Ad not found" });
    }

    const related = await Advertisement.find({
      status: "approved",
      category: currentAd.category,
      _id: { $ne: currentAd._id },
    })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate("seller", "name avatar city isVerified");

    res.status(200).json({
      success: true,
      advertisements: related,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch related ads.",
    });
  }
};

/**
 * @desc    Get current user's advertisements with all statuses (pending, approved, rejected)
 * @route   GET /api/advertisements/my
 * @access  Private
 */
export const getMyAdvertisements = async (req, res) => {
  try {
    const ads = await Advertisement.find({ seller: req.user._id })
      .sort({ createdAt: -1 })
      .populate("seller", "name avatar email phone");

    res.status(200).json({
      success: true,
      count: ads.length,
      advertisements: ads,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your advertisements.",
    });
  }
};

/**
 * @desc    Update advertisement (Resubmitting rejected ad puts it back in 'pending' status)
 * @route   PUT /api/advertisements/:id
 * @access  Private
 */
export const updateAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    // Verify ownership or admin privileges
    if (!ad.seller.equals(req.user._id) && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this advertisement.",
      });
    }

    const {
      title,
      description,
      price,
      category,
      subCategory,
      condition,
      images,
      location,
      attributes,
    } = req.body;

    if (title) ad.title = title.trim();
    if (description) ad.description = description.trim();
    if (price !== undefined) ad.price = Number(price);
    if (category) ad.category = category.toLowerCase().trim();
    if (subCategory) ad.subCategory = subCategory.toLowerCase().trim();
    if (condition) ad.condition = condition;
    if (location) ad.location = { ...ad.location, ...location };
    if (attributes) ad.attributes = attributes;
    if (images && Array.isArray(images)) {
      ad.images = images.map((img) =>
        typeof img === "string" ? { url: img, publicId: "" } : img
      );
    }

    // If an ad was rejected, editing & resubmitting resets status to 'pending' for review!
    if (ad.status === "rejected") {
      ad.status = "pending";
      ad.rejectionReason = "";
    }

    await ad.save();

    res.status(200).json({
      success: true,
      message:
        ad.status === "pending"
          ? "Advertisement updated and resubmitted for admin approval."
          : "Advertisement updated successfully.",
      advertisement: ad,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update advertisement.",
    });
  }
};

/**
 * @desc    Delete advertisement
 * @route   DELETE /api/advertisements/:id
 * @access  Private
 */
export const deleteAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    if (!ad.seller.equals(req.user._id) && req.user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this advertisement.",
      });
    }

    await ad.deleteOne();

    res.status(200).json({
      success: true,
      message: "Advertisement deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete advertisement.",
    });
  }
};

