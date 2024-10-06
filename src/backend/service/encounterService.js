// const encounterDao = require("../dao/encounterDao");
const { logger } = require("../utils/logger");
const axios = require("axios");
const uuid = require("uuid");

const dndApiUrlPath = "https://www.dnd5eapi.co";
const dndBeyondUrlPath = "https://www.dndbeyond.com/monsters/";
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
        armorClass: monsterDetails.data.armor_class[0].value,
        hp: monsterDetails.data.hit_points,
        strength: monsterDetails.data.strength,
        dexterity: monsterDetails.data.dexterity,
        constitution: monsterDetails.data.constitution,
        intelligence: monsterDetails.data.intelligence,
        wisdom: monsterDetails.data.wisdom,
        charisma: monsterDetails.data.charisma,
        image: monsterDetails.data.image,
        monsterPage: `${dndBeyondUrlPath}${monsterDetails.data.name.replaceAll(
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

module.exports = {
  getMonstersByChallengeRating,
};
