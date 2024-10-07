const express = require("express");
const router = express.Router();
const encounterService = require("../service/encounterService");
const { verifyToken } = require("../middleware/authMiddleware");

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

router.post("/encounter", async (req, res) => {
  const { monsters, encounter_title } = req.body;

  try {
    const encounter = await encounterService.createNewEncounter(
      monsters,
      encounter_title
    );

    res.status(201).json({ encounter });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

module.exports = router;
