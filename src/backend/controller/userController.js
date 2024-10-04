const { verifyToken } = require("../middleware/authMiddleware");
const userService = require("../service/userService");
const express = require("express");
const router = express.Router();

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  try {
    const token = await userService.loginUser(identifier, password);

    res.status(200).json({ token });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

module.exports = router;
