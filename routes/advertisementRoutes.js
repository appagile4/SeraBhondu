import express from "express";
import {
  createAdvertisement,
  getApprovedAdvertisements,
  getFeaturedAdvertisements,
  getAdvertisementBySlug,
  searchAdvertisements,
  getRelatedAdvertisements,
  getMyAdvertisements,
  updateAdvertisement,
  deleteAdvertisement,
} from "../controllers/advertisementController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getApprovedAdvertisements);
router.get("/featured", getFeaturedAdvertisements);
router.get("/search", searchAdvertisements);
router.get("/slug/:slug", getAdvertisementBySlug);
router.get("/:id/related", getRelatedAdvertisements);

// Protected routes (Seller)
router.post("/", protect, createAdvertisement);
router.get("/my", protect, getMyAdvertisements);
router.put("/:id", protect, updateAdvertisement);
router.delete("/:id", protect, deleteAdvertisement);

export default router;
