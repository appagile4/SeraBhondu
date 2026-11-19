import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (JPEG, PNG, WebP)"), false);
  }
};

const singleUpload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
}).fields([
  { name: "image", maxCount: 1 },
  { name: "avatar", maxCount: 1 },
]);

export const uploadSingleImage = (req, res, next) => {
  singleUpload(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        req.file = req.files.image[0];
      } else if (req.files.avatar && req.files.avatar[0]) {
        req.file = req.files.avatar[0];
      }
    }
    next();
  });
};

export const uploadMultipleImages = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter,
}).array("images", 8);
