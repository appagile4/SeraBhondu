import express from "express";
import {
  getActiveBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} from "../controllers/bannerController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";
import { uploadSingleImage } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Public route for homepage hero slider
router.get("/", getActiveBanners);

// Protected Superadmin Banner Management Routes
router.get("/admin/all", protect, requireAdmin, getAdminBanners);
router.post("/", protect, requireAdmin, uploadSingleImage, createBanner);
router.put("/reorder", protect, requireAdmin, reorderBanners);
router.put("/:id", protect, requireAdmin, uploadSingleImage, updateBanner);
router.delete("/:id", protect, requireAdmin, deleteBanner);

export default router;
