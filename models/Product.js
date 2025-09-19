const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        // Gents
        "Gents Chain",
        "Gents Bracelets",
        "Gents Kada",
        "Rudraksh Mala/Bracelets",
        "Pendals",
        "Gente Kadi",

        // Ladies
        "Ladies Chain",
        "Ladies Bracelets",
        "Ladies Kada",
        "Golden Dokiya",
        "Dokiya Mangalsutra",
        "Long Mangalsutra",
        "Half Set",
        "Long Set ( Rani Har )",
        "Bangles",
        "Chudi Bangles",
        "Fancy Mala"
      ],
    },
    imageUrl: {
      type: String, // Cloudinary or local URL
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


productSchema.index({
  title: "text",
  description: "text",
  category: "text",
});

module.exports = mongoose.model("Product", productSchema);
