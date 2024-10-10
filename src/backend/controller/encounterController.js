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
  const { monsters, encounter_title, setting } = req.body;
  const username = req.user.username;

  try {
    const encounter = await encounterService.createNewEncounter(
      monsters,
      encounter_title,
      username,
      setting
    );

    res.status(201).json({ encounter });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

// Router to set/delete campaign_title from an Encounter
// Ex. URL) http://localhost:3000/api/encounters/campaigns?encounter_id=123
router.patch('/campaigns', verifyToken, async (req, res) => {
  const { encounter_id } = req.query;
  const { action, campaign_title } = req.body;
  const username = req.user.username;

  try {
    if (action.toLowerCase() !== 'set' && action.toLowerCase() !== 'remove') {
      return res.status(400).json({message: "Invalid campaign action"});
    }

    if (action.toLowerCase() === 'set') {
      const data = await encounterService.createCampaign(username, encounter_id, campaign_title);
      return res.status(201).json(data);

    } else {
      const data = await encounterService.removeCampaign(username, encounter_id);
      return res.status(200).json(data);
    }
    

  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || "Internal server error" });
  }
});

router.put("/encounter", verifyToken, async (req, res) => {
  const { encounter_id, monsters, encounter_title, setting } = req.body;
  const username = req.user.username;

  try {
    const encounter = await encounterService.editEncounterById(
      encounter_id,
      monsters,
      encounter_title,
      username,
      setting
    );

    res.status(200).json({ encounter });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

router.delete("/encounter", verifyToken, async (req, res) => {
  const encounter_id = req.query.encounter_id;
  const username = req.user.username;

  try {
    const encounter = await encounterService.deleteEncounterById(
      encounter_id,
      username
    );

    res.status(200).json({ encounter });
  } catch (err) {
    res.status(err.status || 400).json({ message: err.message });
  }
});

module.exports = router;
