const express = require("express");
const router = express.Router();
const encounterService = require("../service/encounterService");

router.get("/monsters", async (req, res) => {
  const challengeRating = req.query.challenge;
  try {
    const monsters = await encounterService.getMonstersByChallengeRating(
      challengeRating
    );
    res.status(200).json({ monsters });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

module.exports = router;
