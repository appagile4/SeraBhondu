import express from "express";
import { uploadImage, uploadMultiple } from "../controllers/uploadController.js";
import { uploadSingleImage, uploadMultipleImages } from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, uploadSingleImage, uploadImage);
router.post("/multiple", protect, uploadMultipleImages, uploadMultiple);

export default router;
