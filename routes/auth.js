const express = require("express");
const Admin = require("../models/Admin");

const router = express.Router();

// ----------- GET Register page -----------
router.get("/register", (req, res) => {
  res.render("admin/register", { error: null });
});

// ----------- POST Register -----------
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // check if user exists
    const existing = await Admin.findOne({ username });
    if (existing) {
      return res.render("admin/register", { error: "Username already taken" });
    }

    const admin = new Admin({ username, password });
    await admin.save();

    req.session.admin = { id: admin._id, username: admin.username };
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.render("admin/register", { error: "Something went wrong" });
  }
});

// ----------- GET Login page -----------
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

// ----------- POST Login -----------
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.render("admin/login", { error: "Invalid username or password" });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.render("admin/login", { error: "Invalid username or password" });
    }

    req.session.admin = { id: admin._id, username: admin.username };
    res.redirect("/admin/dashboard");
  } catch (err) {
    console.error(err);
    res.render("admin/login", { error: "Something went wrong" });
  }
});

// ----------- Logout -----------
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login");
  });
});

module.exports = router;
