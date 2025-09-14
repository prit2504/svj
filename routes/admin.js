const express = require("express");
const Product = require("../models/Product");
const upload = require("../utils/upload");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

const router = express.Router();

// Middleware to protect admin routes
function isAdmin(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.redirect("/auth/login");
}

// ----------- Admin Dashboard -----------
router.get("/dashboard", isAdmin, async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.render("admin/dashboard", { products });
});

// ----------- Add Product Page -----------
router.get("/products/new", isAdmin, (req, res) => {
  const categories = Product.schema.path("category").enumValues;
  res.render("admin/new", { error: null, categories });
});

// ----------- Create Product -----------
router.post("/products", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, price, inStock  } = req.body;

    if (!req.file) return res.render("admin/new", { error: "Please upload an image", categories: Product.schema.path("category").enumValues });

    const streamUpload = (buffer) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: "svj-products" }, (err, result) => {
          if (result) resolve(result);
          else reject(err);
        });
        streamifier.createReadStream(buffer).pipe(stream);
      });

    const result = await streamUpload(req.file.buffer);

    const product = new Product({
      title,
      description,
      category,
      price,
      inStock: inStock === "on",
      imageUrl: result.secure_url,
    });

    await product.save();
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.render("admin/new", { error: "Error creating product", categories: Product.schema.path("category").enumValues });
  }
});

// ----------- Edit Product Page -----------
router.get("/products/:id/edit", isAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/admin/dashboard");
    res.render("admin/edit", { product, Product, error: null });
  } catch (err) {
    console.error(err);
    res.redirect("/admin/dashboard");
  }
});

// ----------- Update Product -----------
router.put("/products/:id", isAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, price, inStock } = req.body;

    const updateData = { title, description, category, price, inStock: inStock === "on" };

    if (req.file) {
      const streamUpload = (buffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream({ folder: "svj-products" }, (err, result) => {
            if (result) resolve(result);
            else reject(err);
          });
          streamifier.createReadStream(buffer).pipe(stream);
        });

      const result = await streamUpload(req.file.buffer);
      updateData.imageUrl = result.secure_url;
    }

    await Product.findByIdAndUpdate(req.params.id, updateData);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.render("admin/edit", { error: "Error updating product", product: await Product.findById(req.params.id), Product });
  }
});

// ----------- Delete Product -----------
router.delete("/products/:id", isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.redirect("/admin/dashboard");
  }
});

module.exports = router;
