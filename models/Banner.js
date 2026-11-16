import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    subtitle: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      required: [true, "Banner image URL is required"],
    },
    imagePublicId: {
      type: String,
      default: "",
    },
    linkUrl: {
      type: String,
      default: "/search",
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

bannerSchema.index({ isActive: 1, order: 1 });

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
