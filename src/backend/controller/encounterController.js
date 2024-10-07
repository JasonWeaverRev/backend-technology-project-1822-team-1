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

router.get("/user", verifyToken, async (req, res) => {
  const username = req.user.username;

  try {
    const encounters = await encounterService.getEncountersByUsername(username);
    res.status(200).json({ encounters });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

router.get("/encounter", async (req, res) => {
  const encounter_id = req.query.encounter_id;

  try {
    const encounter = await encounterService.getEncounterById(encounter_id);

    res.status(200).json({ encounter });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

router.post("/encounter", verifyToken, async (req, res) => {
  const { monsters, encounter_title } = req.body;
  const username = req.user.username;

  try {
    const encounter = await encounterService.createNewEncounter(
      monsters,
      encounter_title,
      username
    );

    res.status(201).json({ encounter });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

module.exports = router;
