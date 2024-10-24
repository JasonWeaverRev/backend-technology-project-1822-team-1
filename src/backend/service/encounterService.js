// const encounterDao = require("../dao/encounterDao");
const { logger } = require("../utils/logger");
const axios = require("axios");
const uuid = require("uuid");
const encounterDao = require("../dao/encounterDao");
const accountDao = require("../dao/accountDao");

const dndApiUrlPath = "https://www.dnd5eapi.co";
const dndBeyondUrlPath = "https://www.dndbeyond.com/monsters/";
const file_ext = "jpeg";

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

/**
 *
 * @param {*} challengeRating
 * @returns
 */
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
        image: monsterDetails.data.image
          ? `${dndApiUrlPath}${monsterDetails.data.image}`
          : accountDao.getPreSignedUrl(
              "dungeon-delver-bucket",
              `profile_pics/${monsterDetails.data.type}.${file_ext}`
            ),
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

    return randomMonsterData;
  } catch (err) {
    throw err.status ? err : { status: 500, message: "Internal server error" };
  }
};

/**
 *
 * @param {*} id
 * @returns
 */
const getEncounterById = async (id) => {
  if (!id || id.trim() === "") {
    throw { status: 400, message: "Must provide id for the encounter" };
  }

  try {
    const encounter = await encounterDao.getEncounterById(id);
    if (!encounter) {
      throw { status: 404, message: "Encounter with this id does not exist" };
    }

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
      // campaign_title: "",
      setting: setting ? setting : "",
    };

    await encounterDao.createEncounter(newEncounter);

    return newEncounter;
  } catch (err) {
    throw err.status ? err : { status: 500, messsage: "Internal server error" };
  }
};

const editEncounterById = async (
  encounter_id,
  monsters,
  encounter_title,
  username,
  setting
) => {
  try {
    if (
      (!monsters || monsters.length === 0) &&
      (!encounter_title || encounter_title === "") &&
      (!setting || setting === "")
    ) {
      throw { status: 400, message: "No changes to make" };
    }

    const encounter = await encounterDao.getEncounterById(encounter_id);

    if (!encounter) {
      throw { status: 404, message: "Encounter with this id does not exist" };
    }

    if (encounter.created_by !== username) {
      throw { status: 403, message: "Cannot edit encounters of other users" };
    }

    encounter.encounter_title =
      !encounter_title || encounter_title.trim() === ""
        ? encounter.encounter_title
        : encounter_title;

    encounter.monsters =
      !monsters || monsters.length > 0 ? monsters : encounter.monsters;

    encounter.setting =
      !setting || setting.trim() === "" ? encounter.setting : setting;

    await encounterDao.editEncounterById(encounter);

    return encounter;
  } catch (err) {
    throw err.status ? err : { status: 500, messsage: "Internal server error" };
  }
};

const deleteEncounterById = async (encounter_id, username) => {
  try {
    const encounter = await encounterDao.getEncounterById(encounter_id);

    if (!encounter) {
      throw { status: 404, message: "Encounter with this id does not exist" };
    }

    if (encounter.created_by !== username) {
      throw { status: 403, message: "Cannot delete encounters of other users" };
    }

    const deleted = await encounterDao.deleteEncounterById(encounter_id);

    return deleted;
  } catch (err) {
    throw err.status ? err : { status: 500, messsage: "Internal server error" };
  }
};

const createCampaign = async (username, encounter_id, campaign_title) => {
  if (!campaign_title) {
    throw { status: 400, message: "Campaign Title must be provided" };
  }

  const encounter = await encounterDao.getEncounterById(encounter_id);
  if (!encounter) {
    throw { status: 404, message: "Invalid Encounter ID" };
  }

  if (encounter.created_by !== username) {
    throw {
      status: 404,
      message: "Users can only add their own Encounters to Campaigns",
    };
  }

  const data = await encounterDao.createCampaign(encounter_id, campaign_title);
  if (!data) {
    throw { status: 500, message: "Internal server error" };
  }

  return data;
};

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
    throw {
      status: 400,
      message: "Users cannot delete other user's campaigns",
    };
  }

  const data = await encounterDao.removeCampaign(encounter_id);
  if (!data) {
    throw { status: 500, message: "Internal server error" };
  }

  return data;
};

const getCampaignByTitle = async (campaign_title) => {
  if (!campaign_title) {
    throw { status: 400, message: "Campaign title must be provided" };
  }

  try {
    const campaigns = await encounterDao.getCampaignByTitle(campaign_title);

    return campaigns;
  } catch (err) {
    throw {
      status: err.status || 500,
      message: err.message || "Internal server error",
    };
  }
};

module.exports = {
  getMonstersByChallengeRating,
  createNewEncounter,
  getEncounterById,
  getEncountersByUsername,
  createCampaign,
  removeCampaign,
  editEncounterById,
  deleteEncounterById,
  getCampaignByTitle,
};
