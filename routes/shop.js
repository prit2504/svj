const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// ---------- Home Page ----------
router.get("/", async (req, res) => {
  try {
    const categories = Product.schema.path("category").enumValues;
    res.render("shop/home", { categories });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading shop");
  }
});

// ---------- API to fetch products ----------
router.get("/api/products", async (req, res) => {
  try {
    const { category, search, page = 1, limit = 16 } = req.query;
    const filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit));

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// -------- Category Products View --------

router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 16 } = req.query; // removed search

    const filter = {};
    if (category && category !== "All") filter.category = category;

    const skip = (page - 1) * limit;
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.render("shop/category", {
      products,
      category,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading category products");
  }
});



// ---------- Product Detail ----------
router.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.redirect("/");

    const shopNumber = process.env.SHOP_WHATSAPP;
    const message = encodeURIComponent(
      `Hello! I'm interested in this product:\n\n${product.title}\n\nLink: ${req.protocol}://${req.get(
        "host"
      )}/product/${product._id}`
    );
    const whatsappLink = `https://wa.me/${shopNumber}?text=${message}`;

    res.render("shop/product", { product, whatsappLink });
  } catch (err) {
    console.error(err);
    res.redirect("/");
  }
});

router.get('/shop-location', (req, res) => {
  res.render('shop/address'); // the EJS file we just created
});


module.exports = router;
