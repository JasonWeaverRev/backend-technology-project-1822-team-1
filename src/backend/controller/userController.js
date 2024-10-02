const { verifyToken } = require("../middleware/authMiddleware");
const userService = require("../service/userService");
const express = require("express");
const router = express.Router();

router.post("login", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const token = await userService.loginUser(username, email, password);
    res.status(200).json({ token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
