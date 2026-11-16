import User from "../models/User.js";
import Advertisement from "../models/Advertisement.js";
import Notification from "../models/Notification.js";
import AuditLog from "../models/AuditLog.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import jwt from "jsonwebtoken";
import { getIO } from "../config/socket.js";

const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "khojobangla_classifieds_bangladesh_jwt_secret_token_2026_key",
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * @desc    Dedicated Superadmin Login
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials.",
      });
    }

    // STRICT ROLE CHECK: Only superadmin allowed
    if (user.role !== "superadmin") {
      return res.status(403).json({
        success: false,
        message: "Access forbidden. Regular user accounts cannot access administrative portals.",
      });
    }

    if (user.isSuspended || user.status === "suspended") {
      return res.status(403).json({
        success: false,
        message: "This administrative account is suspended.",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid administrator credentials.",
      });
    }

    const token = generateToken(user._id);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      message: "Superadmin authenticated successfully.",
      token,
      user: userObj,
    });
  } catch (error) {
    console.error("Admin Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during administrative authentication.",
    });
  }
};

/**
 * @desc    Get real-time Superadmin Dashboard Statistics
 * @route   GET /api/admin/stats
 * @access  Private (Superadmin)
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [totalAds, pendingAds, approvedAds, rejectedAds, totalUsers] =
      await Promise.all([
        Advertisement.countDocuments(),
        Advertisement.countDocuments({ status: "pending" }),
        Advertisement.countDocuments({ status: "approved" }),
        Advertisement.countDocuments({ status: "rejected" }),
        User.countDocuments({ role: "user" }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        totalAds,
        pendingAds,
        approvedAds,
        rejectedAds,
        totalUsers,
      },
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard statistics.",
    });
  }
};

/**
 * @desc    Get advertisements for admin review (with status filter and pagination)
 * @route   GET /api/admin/advertisements
 * @access  Private (Superadmin)
 */
export const getAdminAdvertisements = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    if (category && category !== "all") {
      filter.category = category.toLowerCase().trim();
    }

    if (search && search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
        { "sellerContact.name": { $regex: search.trim(), $options: "i" } },
        { "location.city": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await Advertisement.countDocuments(filter);
    const advertisements = await Advertisement.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("seller", "name email phone city avatar isVerified createdAt")
      .populate("approvedBy", "name email");

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      advertisements,
    });
  } catch (error) {
    console.error("Admin Advertisements Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch advertisements.",
    });
  }
};

/**
 * @desc    Approve an advertisement (Makes it publicly visible across KhojoBangla)
 * @route   PUT /api/admin/advertisements/:id/approve
 * @access  Private (Superadmin)
 */
export const approveAdvertisement = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id).populate(
      "seller",
      "name email"
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    ad.status = "approved";
    ad.approvedBy = req.user._id;
    ad.approvedAt = new Date();
    ad.rejectionReason = "";

    await ad.save();

    // 1. Audit Log Entry
    await AuditLog.create({
      admin: req.user._id,
      action: "ad_approved",
      targetType: "advertisement",
      targetId: ad._id,
      metadata: {
        title: ad.title,
        sellerId: ad.seller?._id,
        approvedAt: ad.approvedAt,
      },
    });

    // 2. Create Notification in MongoDB for Seller
    if (ad.seller) {
      const notification = await Notification.create({
        recipient: ad.seller._id,
        type: "ad_approved",
        title: "Advertisement Approved! 🎉",
        message: `Congratulations! Your advertisement "${ad.title}" has been approved and is now live on KhojoBangla.`,
        relatedAdvertisement: ad._id,
      });

      // 3. Emit real-time notification to seller's user socket room
      try {
        const io = getIO();
        if (io) {
          io.to(`user_${ad.seller._id}`).emit("notification:new", notification);
          io.to(`user_${ad.seller._id}`).emit("ad:status_updated", {
            adId: ad._id,
            status: "approved",
            title: ad.title,
          });
        }
      } catch {
        // socket emit non-fatal
      }
    }

    res.status(200).json({
      success: true,
      message: `Advertisement "${ad.title}" has been approved and published to the marketplace.`,
      advertisement: ad,
    });
  } catch (error) {
    console.error("Approve Ad Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to approve advertisement.",
    });
  }
};

/**
 * @desc    Reject an advertisement with reason
 * @route   PUT /api/admin/advertisements/:id/reject
 * @access  Private (Superadmin)
 */
export const rejectAdvertisement = async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required to inform the seller.",
      });
    }

    const ad = await Advertisement.findById(req.params.id).populate(
      "seller",
      "name email"
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    ad.status = "rejected";
    ad.rejectionReason = reason.trim();
    ad.approvedBy = undefined;
    ad.approvedAt = undefined;

    await ad.save();

    // 1. Audit Log Entry
    await AuditLog.create({
      admin: req.user._id,
      action: "ad_rejected",
      targetType: "advertisement",
      targetId: ad._id,
      metadata: {
        title: ad.title,
        sellerId: ad.seller?._id,
        reason: ad.rejectionReason,
      },
    });

    // 2. Create Notification in MongoDB for Seller
    if (ad.seller) {
      const notification = await Notification.create({
        recipient: ad.seller._id,
        type: "ad_rejected",
        title: "Advertisement Review Update",
        message: `Your advertisement "${ad.title}" was not approved. Reason: ${ad.rejectionReason}. You may edit and resubmit your advertisement.`,
        relatedAdvertisement: ad._id,
      });

      // 3. Emit real-time notification to seller's user socket room
      try {
        const io = getIO();
        if (io) {
          io.to(`user_${ad.seller._id}`).emit("notification:new", notification);
          io.to(`user_${ad.seller._id}`).emit("ad:status_updated", {
            adId: ad._id,
            status: "rejected",
            title: ad.title,
            reason: ad.rejectionReason,
          });
        }
      } catch {
        // socket emit non-fatal
      }
    }

    res.status(200).json({
      success: true,
      message: `Advertisement "${ad.title}" has been rejected. The seller has been notified.`,
      advertisement: ad,
    });
  } catch (error) {
    console.error("Reject Ad Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to reject advertisement.",
    });
  }
};

/**
 * @desc    Toggle featured status for an approved advertisement
 * @route   PUT /api/admin/advertisements/:id/featured
 * @access  Private (Superadmin)
 */
export const toggleAdFeatured = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    ad.isFeatured = !ad.isFeatured;
    await ad.save();

    res.status(200).json({
      success: true,
      message: `Advertisement featured status updated to ${ad.isFeatured}.`,
      isFeatured: ad.isFeatured,
      advertisement: ad,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle featured status.",
    });
  }
};

/**
 * @desc    Get registered users list with advertisement stats
 * @route   GET /api/admin/users
 * @access  Private (Superadmin)
 */
export const getAdminUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { phone: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Compute ad counts per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const adCount = await Advertisement.countDocuments({ seller: u._id });
        return {
          ...u.toObject(),
          adCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      users: usersWithStats,
    });
  } catch (error) {
    console.error("Admin Users Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
    });
  }
};

/**
 * @desc    Toggle suspend / activate user account
 * @route   PUT /api/admin/users/:id/status
 * @access  Private (Superadmin)
 */
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role === "superadmin") {
      return res.status(400).json({
        success: false,
        message: "Superadmin accounts cannot be suspended.",
      });
    }

    user.isSuspended = !user.isSuspended;
    user.status = user.isSuspended ? "suspended" : "active";
    await user.save();

    await AuditLog.create({
      admin: req.user._id,
      action: user.isSuspended ? "user_suspended" : "user_activated",
      targetType: "user",
      targetId: user._id,
      metadata: { name: user.name, email: user.email },
    });

    res.status(200).json({
      success: true,
      message: `User account has been ${user.status}.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        status: user.status,
        isSuspended: user.isSuspended,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user status.",
    });
  }
};

/**
 * @desc    Get recent Admin Audit Logs
 * @route   GET /api/admin/audit-logs
 * @access  Private (Superadmin)
 */
export const getAdminAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("admin", "name email avatar");

    res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch audit logs.",
    });
  }
};

/**
 * @desc    Get all marketplace buyer-seller transactions, inquiries, and deals
 * @route   GET /api/admin/deals
 * @access  Private (Superadmin)
 */
export const getAdminMarketplaceDeals = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 30 } = req.query;

    const conversations = await Conversation.find()
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate("advertisement", "title slug price category images location status isSold soldTo soldPrice soldAt soldLocation seller")
      .populate("seller", "name email phone city avatar isVerified")
      .populate("buyer", "name email phone city avatar isVerified")
      .populate("participants", "name email phone city avatar isVerified")
      .lean();

    const formattedDeals = await Promise.all(
      conversations.map(async (conv) => {
        const ad = conv.advertisement || {};
        const adSellerId = (ad.seller?._id || ad.seller || "").toString();

        // Resolve seller
        let seller = conv.seller;
        if (!seller && conv.participants?.length > 0) {
          seller = conv.participants.find(
            (p) => (p._id || p).toString() === adSellerId
          );
        }

        // Resolve buyer
        let buyer = conv.buyer;
        if (!buyer && conv.participants?.length > 0) {
          buyer = conv.participants.find(
            (p) => (p._id || p).toString() !== (seller?._id ? seller._id.toString() : adSellerId)
          );
        }

        const isSoldToThisBuyer = Boolean(
          ad.isSold &&
          ad.soldTo &&
          buyer &&
          ad.soldTo.toString() === (buyer._id ? buyer._id.toString() : buyer.toString())
        );

        let dealStatus = "inquired";
        if (ad.isSold) {
          dealStatus = isSoldToThisBuyer ? "sold" : "closed_other";
        } else if (conv.dealStatus) {
          dealStatus = conv.dealStatus;
        }

        const messageCount = await Message.countDocuments({
          conversation: conv._id,
        });

        return {
          id: conv._id,
          _id: conv._id,
          conversationId: conv._id,
          dealStatus,
          isSold: isSoldToThisBuyer,
          inquiryDate: conv.createdAt,
          lastActivityAt: conv.lastMessageAt || conv.updatedAt || conv.createdAt,
          lastMessageText: conv.lastMessageText || "Inquiry initiated",
          messageCount,
          product: {
            id: ad._id,
            _id: ad._id,
            title: ad.title || "Classified Item",
            slug: ad.slug,
            price: ad.price || 0,
            category: ad.category || "General",
            image: ad.images?.[0]?.url || (typeof ad.images?.[0] === "string" ? ad.images[0] : ""),
            city: ad.location?.city || "Bangladesh",
            status: ad.status || "approved",
            isSold: Boolean(ad.isSold),
            soldPrice: ad.soldPrice,
            soldAt: ad.soldAt,
            soldLocation: ad.soldLocation,
          },
          seller: seller
            ? {
                id: seller._id,
                name: seller.name,
                email: seller.email,
                phone: seller.phone,
                city: seller.city,
                avatar: seller.avatar,
                isVerified: seller.isVerified,
              }
            : {
                id: adSellerId,
                name: "Seller",
                email: "",
                phone: "",
                city: "Bangladesh",
              },
          buyer: buyer
            ? {
                id: buyer._id,
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone,
                city: buyer.city,
                avatar: buyer.avatar,
                isVerified: buyer.isVerified,
              }
            : {
                id: "unknown",
                name: "Prospective Buyer",
                email: "",
                phone: "",
                city: "Bangladesh",
              },
        };
      })
    );

    // Filter by dealStatus if provided
    let filtered = formattedDeals;
    if (status && status !== "all") {
      filtered = filtered.filter((d) => d.dealStatus === status);
    }

    // Filter by search keyword
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.product.title.toLowerCase().includes(q) ||
          d.seller.name.toLowerCase().includes(q) ||
          d.seller.email.toLowerCase().includes(q) ||
          d.buyer.name.toLowerCase().includes(q) ||
          d.buyer.email.toLowerCase().includes(q) ||
          (d.product.city && d.product.city.toLowerCase().includes(q))
      );
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const total = filtered.length;
    const paginated = filtered.slice((pageNum - 1) * limitNum, pageNum * limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      deals: paginated,
    });
  } catch (error) {
    console.error("Admin Marketplace Deals Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch marketplace deals and inquiries.",
    });
  }
};

/**
 * @desc    Get complete lifecycle, seller details, buyer records, and inquiry history for a product
 * @route   GET /api/admin/advertisements/:id/history
 * @access  Private (Superadmin)
 */
export const getProductAuditHistory = async (req, res) => {
  try {
    const ad = await Advertisement.findById(req.params.id)
      .populate("seller", "name email phone city avatar isVerified createdAt")
      .populate("soldTo", "name email phone city avatar isVerified")
      .populate("approvedBy", "name email")
      .lean();

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    // Find all conversations/inquiries associated with this advertisement
    const conversations = await Conversation.find({ advertisement: ad._id })
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .populate("buyer", "name email phone city avatar isVerified createdAt")
      .populate("seller", "name email phone city avatar isVerified")
      .populate("participants", "name email phone city avatar isVerified")
      .lean();

    const adSellerId = (ad.seller?._id || ad.seller || "").toString();

    const inquiries = await Promise.all(
      conversations.map(async (conv) => {
        let buyer = conv.buyer;
        if (!buyer && conv.participants?.length > 0) {
          buyer = conv.participants.find(
            (p) => (p._id || p).toString() !== adSellerId
          );
        }

        const messageCount = await Message.countDocuments({
          conversation: conv._id,
        });

        const isSoldToThisBuyer = Boolean(
          ad.isSold &&
          ad.soldTo &&
          buyer &&
          (ad.soldTo._id || ad.soldTo).toString() === (buyer._id || buyer).toString()
        );

        return {
          id: conv._id,
          _id: conv._id,
          conversationId: conv._id,
          inquiryDate: conv.createdAt,
          lastActivityAt: conv.lastMessageAt || conv.updatedAt,
          lastMessageText: conv.lastMessageText || "Inquiry initiated",
          messageCount,
          isSoldToThisBuyer,
          dealStatus: isSoldToThisBuyer ? "sold" : conv.dealStatus || "inquired",
          buyer: buyer
            ? {
                id: buyer._id,
                _id: buyer._id,
                name: buyer.name,
                email: buyer.email,
                phone: buyer.phone,
                city: buyer.city,
                avatar: buyer.avatar,
                isVerified: buyer.isVerified,
                createdAt: buyer.createdAt,
              }
            : {
                id: "unknown",
                name: "Prospective Buyer",
                email: "",
                phone: "",
                city: "Bangladesh",
              },
        };
      })
    );

    // Audit logs for this ad
    const auditLogs = await AuditLog.find({ targetId: ad._id })
      .sort({ createdAt: -1 })
      .populate("admin", "name email")
      .lean();

    res.status(200).json({
      success: true,
      advertisement: {
        ...ad,
        inquiriesCount: inquiries.length,
      },
      seller: ad.seller,
      soldRecord: ad.isSold
        ? {
            isSold: true,
            buyer: ad.soldTo,
            soldPrice: ad.soldPrice || ad.price,
            soldAt: ad.soldAt || ad.updatedAt,
            soldLocation: ad.soldLocation || ad.location?.city || "Dhaka",
          }
        : null,
      inquiries,
      auditLogs,
    });
  } catch (error) {
    console.error("Product Audit History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load product history and buyer inquiries.",
    });
  }
};

/**
 * @desc    Mark an advertisement as sold to a specific buyer with price and location
 * @route   PUT /api/admin/advertisements/:id/mark-sold
 * @access  Private (Superadmin)
 */
export const markAdvertisementSold = async (req, res) => {
  try {
    const { buyerId, soldPrice, soldLocation, soldAt } = req.body;

    const ad = await Advertisement.findById(req.params.id).populate(
      "seller",
      "name email"
    );

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Advertisement not found.",
      });
    }

    let buyer = null;
    if (buyerId) {
      buyer = await User.findById(buyerId).select("name email phone city");
    }

    ad.status = "sold";
    ad.isSold = true;
    ad.soldTo = buyerId || undefined;
    ad.soldPrice = soldPrice !== undefined ? Number(soldPrice) : ad.price;
    ad.soldAt = soldAt ? new Date(soldAt) : new Date();
    ad.soldLocation = soldLocation || ad.location?.city || "Dhaka";

    await ad.save();

    // Update conversation status if conversation exists
    if (buyerId) {
      await Conversation.updateMany(
        {
          advertisement: ad._id,
          participants: buyerId,
        },
        {
          $set: { dealStatus: "sold" },
        }
      );
    }

    // Create Audit Log
    await AuditLog.create({
      admin: req.user._id,
      action: "ad_marked_sold",
      targetType: "advertisement",
      targetId: ad._id,
      metadata: {
        title: ad.title,
        sellerId: ad.seller?._id,
        buyerId: buyerId || null,
        buyerName: buyer?.name || "Offline Buyer",
        soldPrice: ad.soldPrice,
        soldLocation: ad.soldLocation,
        soldAt: ad.soldAt,
      },
    });

    // Notify seller
    if (ad.seller) {
      await Notification.create({
        recipient: ad.seller._id,
        type: "system",
        title: "Deal Closed / Item Sold 🎉",
        message: `Your advertisement "${ad.title}" has been recorded as SOLD${
          buyer ? ` to ${buyer.name}` : ""
        } for Rs. ${ad.soldPrice.toLocaleString()} in ${ad.soldLocation}.`,
        relatedAdvertisement: ad._id,
      });
    }

    res.status(200).json({
      success: true,
      message: `Advertisement "${ad.title}" successfully recorded as sold.`,
      advertisement: ad,
    });
  } catch (error) {
    console.error("Mark Ad Sold Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to mark advertisement as sold.",
    });
  }
};

/**
 * @desc    Superadmin audit transcript inspection for any conversation
 * @route   GET /api/admin/conversations/:id/audit-transcript
 * @access  Private (Superadmin)
 */
export const getConversationAuditTranscript = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate("participants", "name email phone city avatar isVerified role")
      .populate("advertisement", "title slug price images location status isSold soldTo")
      .populate("buyer", "name email phone city avatar")
      .populate("seller", "name email phone city avatar");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found.",
      });
    }

    const messages = await Message.find({
      conversation: req.params.id,
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email avatar")
      .populate("receiver", "name email avatar")
      .lean();

    res.status(200).json({
      success: true,
      conversation,
      totalMessages: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Conversation Audit Transcript Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load audit transcript.",
    });
  }
};

