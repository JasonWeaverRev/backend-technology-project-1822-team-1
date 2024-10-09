// const encounterDao = require("../dao/encounterDao");
const { logger } = require("../utils/logger");
const axios = require("axios");
const uuid = require("uuid");
const encounterDao = require("../dao/encounterDao");
const accountDao = require("../dao/accountDAO");
const fs = require("fs");
const path = require("path");

const dndApiUrlPath = "https://www.dnd5eapi.co";
const dndBeyondUrlPath = "https://www.dndbeyond.com/monsters/";

/**
 * CHALLENGE RATINGS
 *
 0
 0.125
 0.25
 0.5
 1-30
 */
const monsterAmount = 5;

// const DELETE_THIS_HARDCODE_MONSTERS = [
//   {
//     monster: "Kobold",
//   },
// ];

const getMonstersByChallengeRating = async (challengeRating) => {
  try {
    const response = await axios(
      `${dndApiUrlPath}/api/monsters?challenge_rating=${challengeRating}`
    );

    const monsters = response.data.results;

    if (monsters.length === 0) {
      throw {
        status: 200,
        message: "No monsters found for the specified challenge rating",
      };
    }

    const shuffledMonsters = monsters.sort(() => 0.5 - Math.random());
    const selectedMonsters = shuffledMonsters.slice(0, monsterAmount);

    const randomMonsterData = [];

    for (const monster of selectedMonsters) {
      const monsterDetails = await axios.get(`${dndApiUrlPath}${monster.url}`);
      const newMonster = {
        name: monsterDetails.data.name,
        size: monsterDetails.data.size,
        challengeRating: monsterDetails.data.challenge_rating,
        armorClass: monsterDetails.data.armor_class[0].value,
        hp: monsterDetails.data.hit_points,
        strength: monsterDetails.data.strength,
        dexterity: monsterDetails.data.dexterity,
        constitution: monsterDetails.data.constitution,
        intelligence: monsterDetails.data.intelligence,
        wisdom: monsterDetails.data.wisdom,
        charisma: monsterDetails.data.charisma,
        image: monsterDetails.data.image,
        monsterPage: monsterDetails.data.name.includes(",")
          ? `${dndBeyondUrlPath}${monsterDetails.data.name
              .split(",")[0]
              .trim()}`
          : `${dndBeyondUrlPath}${monsterDetails.data.name.replaceAll(
              " ",
              "-"
            )}`,
      };
      randomMonsterData.push(newMonster);
    }

    console.log(randomMonsterData);

    return randomMonsterData;
  } catch (err) {
    throw err.status ? err : { status: 500, message: "Internal server error" };
  }
};

const getEncounterById = async (id) => {
  if (!id || id.trim() === "") {
    throw { status: 400, message: "Must provide id for the encounter" };
  }

  try {
    const encounter = await encounterDao.getEncounterById(id);
    return encounter;
  } catch (err) {
    throw err.status ? err : { status: 500, messsage: "Internal server error" };
  }
};

const getEncountersByUsername = async (username) => {
  try {
    const encounters = await encounterDao.getEncountersByUsername(username);
    return encounters;
  } catch (err) {
    throw err.status ? err : { status: 500, messsage: "Internal server error" };
  }
};

const createNewEncounter = async (monsters, title, username, setting) => {
  try {
    if (monsters.length <= 0) {
      throw { status: 400, message: "Must provide monsters for the encounter" };
    }

    if (!title || title.trim() === "") {
      throw { status: 400, message: "Must provide title for the encounter" };
    }

    const newEncounter = {
      encounter_id: uuid.v4(),
      encounter_title: title,
      monsters,
      saves: 0,
      creation_time: new Date().toISOString(),
      created_by: username,
      campaign_title: "",
      setting: setting ? setting : "",
    };

    console.log(newEncounter);

    await encounterDao.createEncounter(newEncounter);

    return newEncounter;
  } catch (err) {
    throw err.status ? err : { status: 500, messsage: "Internal server error" };
  }
};

const processEncounters = (encounters) => {
  encounters.map((idx) => ({
    encounter_title: idx.encounter_title.S,
    created_by: idx.created_by.S,
    encounter_id: idx.encounter_id.S,
    creation_time: idx.creation_time.S,
    saves: idx.saves.N,
    campaign_title: idx.campaign_title.S,
    monsters: idx.monsters.L,
  }));
};

// add a campaign_title to an encounter
const createCampaign = async (username, encounter_id, campaign_title) => {
  if (!campaign_title) {
    throw { status: 400, message: "Campaign Title must be provided" };
  }

  const encounter = await encounterDao.getEncounterById(encounter_id);
  if (!encounter) {
    throw { status: 404, message: "Invalid Encounter ID" };
  }

  if (encounter.created_by !== username) {
    throw { status: 404, message: "Users can only add their own Encounters to Campaigns" };
  }

  const data = await encounterDao.createCampaign(encounter_id, campaign_title);
  if(!data) {
    throw { status: 500, message: "Internal server error" };
  }
  
  return data;
}

// remove campaign from an encounter
const removeCampaign = async (username, encounter_id) => {
  if (!encounter_id) {
    throw { status: 404, message: "Encounter ID must be provided" };
  }

  if (!username) {
    throw { status: 404, message: "Username must be provided" };
  }

  const encounter = await encounterDao.getEncounterById(encounter_id);
  if (!encounter) {
    throw { status: 404, message: "Invalid Encounter ID" };
  }

  if (encounter.created_by !== username) {
    throw { status: 400, message: "Users cannot delete other user's campaigns"};
  }

  const data = await encounterDao.removeCampaign(campaign_id);
  if(!data) {
    throw { status: 500, message: "Internal server error" };
  }
  
  return data;
}

module.exports = {
  getMonstersByChallengeRating,
  createNewEncounter,
  getEncounterById,
  getEncountersByUsername,
  createCampaign,
  removeCampaign
};
