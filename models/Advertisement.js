import mongoose from "mongoose";

const advertisementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Advertisement title is required"],
      trim: true,
      minlength: [8, "Title must be at least 8 characters"],
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [15, "Description must be at least 15 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      lowercase: true,
      trim: true,
      index: true,
    },
    subCategory: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },
    condition: {
      type: String,
      enum: ["New", "Used"],
      default: "Used",
    },
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          default: "",
        },
        width: Number,
        height: Number,
      },
    ],
    location: {
      state: {
        type: String,
        default: "Dhaka Division",
      },
      city: {
        type: String,
        required: [true, "City is required"],
        default: "Dhaka",
      },
      area: {
        type: String,
        default: "",
      },
      pincode: {
        type: String,
        default: "",
      },
      latitude: {
        type: Number,
        default: null,
      },
      longitude: {
        type: Number,
        default: null,
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sellerContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "sold"],
      default: "pending",
      index: true,
    },
    isSold: {
      type: Boolean,
      default: false,
      index: true,
    },
    soldTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    soldPrice: {
      type: Number,
    },
    soldAt: {
      type: Date,
    },
    soldLocation: {
      type: String,
      default: "",
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: {
      type: Date,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Full-text search index on title and description
advertisementSchema.index({ title: "text", description: "text" });

// High-performance compound indexes for marketplace querying
advertisementSchema.index({ status: 1, category: 1, createdAt: -1 });
advertisementSchema.index({ status: 1, isFeatured: 1, createdAt: -1 });
advertisementSchema.index({ status: 1, "location.city": 1, createdAt: -1 });
advertisementSchema.index({ seller: 1, status: 1, createdAt: -1 });

const Advertisement = mongoose.model("Advertisement", advertisementSchema);

export default Advertisement;
