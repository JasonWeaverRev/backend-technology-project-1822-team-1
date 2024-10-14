const encounterService = require("../src/backend/service/encounterService");
const encounterDao = require("../src/backend/dao/encounterDao");
const axios = require("axios");

jest.mock("../src/backend/dao/encounterDao");
jest.mock("axios");

describe("encounterService Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getEncounterById", () => {
    const testId = "test-id";
    const mockEncounter = {
      encounter_id: testId,
      encounter_title: "title",
      monsters: [
        {
          name: "Monster 2",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
        {
          name: "Monster ",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
      ],
      saves: 0,
      creation_time: "blah",
      campaign_title: "campaign",
      created_by: "testUser",
    };

    it("Should return an encounter by its Id", async () => {
      encounterDao.getEncounterById.mockResolvedValue(mockEncounter);

      const result = await encounterService.getEncounterById(testId);

      expect(encounterDao.getEncounterById).toHaveBeenCalledWith(testId);
      expect(result).toEqual(mockEncounter);
    });

    it("Should throw an error if Id is not provided", async () => {
      try {
        await encounterService.getEncounterById("");
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe("Must provide id for the encounter");
      }
    });

    it("Should throw an error if encounter does not exist", async () => {
      encounterDao.getEncounterById.mockResolvedValue(null);

      try {
        await encounterService.getEncounterById("nonexistent-id");
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe("Encounter with this id does not exist");
      }
    });
  });

  describe("createNewEncounter", () => {
    it("should create a new encounter and return it", async () => {
      const monsters = [
        {
          name: "Monster 2",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
        {
          name: "Monster ",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
      ];
      const title = "Random Title";
      const username = "Test user";

      encounterDao.createEncounter.mockResolvedValueOnce(null);

      const result = await encounterService.createNewEncounter(
        monsters,
        title,
        username
      );

      expect(result).toHaveProperty("encounter_title", title);
      expect(result).toHaveProperty("created_by", username);
      expect(result).toHaveProperty("monsters", monsters);
      expect(result).toHaveProperty("encounter_id");
      expect(result).toHaveProperty("saves");
      expect(result).toHaveProperty("creation_time");
      expect(result).toHaveProperty("campaign_title");
    });

    it("should throw an error if no monsters are provided", async () => {
      const monsters = [];
      const title = "Random Title";
      const username = "Test user";

      try {
        await encounterService.createNewEncounter(monsters, title, username);
      } catch (error) {
        expect(error.message).toBe("Must provide monsters for the encounter");
      }
    });
  });

  it("should throw an error if title is missing", async () => {
    const monsters = [
      {
        name: "Monster 2",
        size: "Medium",
        challenge_rating: 1,
        armor_class: [{ value: 15 }],
        hit_points: 30,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        image: "image_url",
      },
      {
        name: "Monster ",
        size: "Medium",
        challenge_rating: 1,
        armor_class: [{ value: 15 }],
        hit_points: 30,
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10,
        image: "image_url",
      },
    ];
    const title = "";
    const username = "Test user";

    try {
      await encounterService.createNewEncounter(monsters, title, username);
    } catch (error) {
      expect(error.message).toBe("Must provide title for the encounter");
    }
  });

  describe("getEncountersByUsername", () => {
    const testUser1 = "testUser1";
    const testUser2 = "testUser2";
    const mockEncounter1 = {
      encounter_id: "test-id",
      encounter_title: "title",
      monsters: [
        {
          name: "Monster 2",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
        {
          name: "Monster ",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
      ],
      saves: 0,
      creation_time: "blah",
      campaign_title: "campaign",
      created_by: testUser1,
    };

    const mockEncounter2 = {
      encounter_id: "test-id",
      encounter_title: "title",
      monsters: [
        {
          name: "Monster 2",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
        {
          name: "Monster ",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
      ],
      saves: 0,
      creation_time: "blah",
      campaign_title: "campaign",
      created_by: testUser2,
    };

    const mockEncounter3 = {
      encounter_id: "test-id",
      encounter_title: "title",
      monsters: [
        {
          name: "Monster 2",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
        {
          name: "Monster ",
          size: "Medium",
          challenge_rating: 1,
          armor_class: [{ value: 15 }],
          hit_points: 30,
          strength: 10,
          dexterity: 10,
          constitution: 10,
          intelligence: 10,
          wisdom: 10,
          charisma: 10,
          image: "image_url",
        },
      ],
      saves: 0,
      creation_time: "blah",
      campaign_title: "campaign",
      created_by: testUser1,
    };

    const mockEncounters = [mockEncounter1, mockEncounter3];

    it("should return encounters for a given username", async () => {
      encounterDao.getEncountersByUsername.mockResolvedValueOnce(
        mockEncounters
      );

      const result = await encounterService.getEncountersByUsername(testUser1);

      expect(result).toEqual(mockEncounters);
    });
  });

  describe("createCampaign", () => {
    it("Should throw Error for missing campaign title", async () => {
      const testUsername = "testUser";
      const testEncId = 123;
      const testCmpTitle = "";

      try {
        const result = await encounterService.createCampaign(testUsername, testEncId, testCmpTitle);
      } catch (err) {
        expect(err.message).toBe("Campaign Title must be provided");
      }
    });

    it("Should throw Error for invalid encounter", async () => {
      const testUsername = "testUser";
      const testEncId = 123;
      const testCmpTitle = "test title";

      try {
        encounterDao.getEncounterById.mockReturnValue(null);
        const result = await encounterService.createCampaign(testUsername, testEncId, testCmpTitle);
      } catch (err) {
        expect(err.message).toBe("Invalid Encounter ID");
      }
    });

    it("Should throw Error if User is not the creator of the encounter", async () => {
      const testUsername = "testUser";
      const testEncId = 123;
      const testCmpTitle = "test title";

      try {
        encounterDao.getEncounterById.mockReturnValue({
            created_by: "notTestUser"
          }
        );
        const result = await encounterService.createCampaign(testUsername, testEncId, testCmpTitle);
      } catch (err) {
        expect(err.message).toBe("Users can only add their own Encounters to Campaigns");
      }
    });

    it("Should return updated Encounter", async () => {
      const testUsername = "testUser";
      const testEncId = 123;
      const testCmpTitle = "test title";

      encounterDao.getEncounterById.mockReturnValue({
        created_by: "testUser"
      });
      encounterDao.createCampaign.mockReturnValue({
        created_by: "testUser",
        campaign_title: "test title"
      })
      const result = await encounterService.createCampaign(testUsername, testEncId, testCmpTitle);
      expect(result.created_by).toEqual(testUsername);
      expect(result.campaign_title).toEqual(testCmpTitle);
    });
  })

  describe("removeCampaign", () => {
    it("Should throw Error for missing username", async () => {
      const testUsername = "";
      const testEncId = 123;

      try {
        const result = await encounterService.removeCampaign(testUsername, testEncId);
      } catch (err) {
        expect(err.message).toBe("Username must be provided");
      }
    });

    it("Should throw Error for missing Encounter ID", async () => {
      const testUsername = "testUser";
      const testEncId = "";

      try {
        const result = await encounterService.removeCampaign(testUsername, testEncId);
      } catch (err) {
        expect(err.message).toBe("Encounter ID must be provided");
      }
    });

    it("Should throw Error for invalid Encounter ID", async () => {
      const testUsername = "testUser";
      const testEncId = "123";
      encounterDao.getEncounterById.mockReturnValue(false);
      try {
        const result = await encounterService.removeCampaign(testUsername, testEncId);
      } catch (err) {
        expect(err.message).toBe("Invalid Encounter ID");
      }
    });

    it("Should throw Error for unowned Encounter", async () => {
      const testUsername = "testUser";
      const testEncId = "123";
      encounterDao.getEncounterById.mockReturnValue({
        created_by : "notTestUser"
      });
      try {
        const result = await encounterService.removeCampaign(testUsername, testEncId);
      } catch (err) {
        expect(err.message).toBe("Users cannot delete other user's campaigns");
      }
    });

    it("Should return udpated Encounter", async () => {
      const testUsername = "testUser";
      const testEncId = "123";
      encounterDao.getEncounterById.mockReturnValue({
        created_by : "testUser"
      });
      encounterDao.removeCampaign.mockReturnValue({
        created_by : "testUser",
        encounter_id : "123"
      })
      
      const result = await encounterService.removeCampaign(testUsername, testEncId);
      expect(result.created_by).toBe("testUser");
      expect(result.encounter_id).toBe("123");
    });
  })

  describe('getCampaign', () => {
    const campaignTitle = 'test campaign title';

    it('should return a list of encounter_ids for a valid campaign title', async () => {
      // Mocking the DAO return value
      encounterDao.getCampaignByTitle.mockReturnValue(['1', '2', '3']);

      const result = await encounterService.getCampaignByTitle(campaignTitle);
      expect(result).toEqual(['1', '2', '3']);
    });
  });

  describe("createNewEncounter", () => {
    it("should edit an encounter correctly", async () => {
      const oldEncounter = {
        encounter_id: "1",
        encounterTitle: "Old Title",
        setting: "Old Setting",
        monsters: [{ name: "oldMonster1" }, { name: "oldMonster2" }],
        created_by: "testuser",
      };

      const editedEncounter = {
        ...oldEncounter,
        encounter_title: "New Title",
        setting: "New Setting",
      };

      encounterDao.getEncounterById.mockResolvedValue(oldEncounter);
      encounterDao.editEncounterById.mockResolvedValue(editedEncounter);

      const result = await encounterService.editEncounterById(
        "1",
        null,
        "New Title",
        "testuser",
        "New Setting"
      );

      expect(encounterDao.getEncounterById).toHaveBeenCalledWith("1");
      expect(encounterDao.editEncounterById).toHaveBeenCalledWith(
        editedEncounter
      );
      expect(result.encounter_title).toBe("New Title");
      expect(result.setting).toBe("New Setting");
    });

    it("should throw an error if no valid fields are provided", async () => {
      try {
        await encounterService.editEncounterById(
          "1",
          null,
          null,
          "testuser",
          null
        );
      } catch (err) {
        expect(err.status).toBe(400);
        expect(err.message).toBe("No changes to make");
      }
    });

    it("should throw an error if trying to edit another users encounter", async () => {
      const oldEncounter = {
        encounter_id: "1",
        encounterTitle: "Old Title",
        setting: "Old Setting",
        monsters: [{ name: "oldMonster1" }, { name: "oldMonster2" }],
      };

      const editedEncounter = {
        ...oldEncounter,
        encounter_title: "New Title",
        setting: "New Setting",
      };

      encounterDao.getEncounterById.mockResolvedValue(oldEncounter);
      encounterDao.editEncounterById.mockResolvedValue(editedEncounter);

      try {
        await encounterService.editEncounterById(
          "12345",
          null,
          "New Title",
          "testuser",
          "Forest"
        );
      } catch (error) {
        expect(error.status).toBe(403);
        expect(error.message).toBe("Cannot edit encounters of other users");
      }
    });
  });

  describe("deleteEncounterById", () => {
    it("should delete an encounter successfully", async () => {
      const mockEncounter = {
        encounter_id: "12345",
        created_by: "testuser",
      };

      encounterDao.getEncounterById.mockResolvedValue(mockEncounter);
      encounterDao.deleteEncounterById.mockResolvedValue(true);

      const result = await encounterService.deleteEncounterById(
        "12345",
        "testuser"
      );

      expect(encounterDao.getEncounterById).toHaveBeenCalledWith("12345");
      expect(encounterDao.deleteEncounterById).toHaveBeenCalledWith("12345");
      expect(result).toBe(true);
    });

    it("Should throw an error if encounter does not exist", async () => {
      encounterDao.getEncounterById.mockResolvedValue(null);

      try {
        await encounterService.deleteEncounterById("12345", "testuser");
      } catch (error) {
        expect(error.status).toBe(404);
        expect(error.message).toBe("Encounter with this id does not exist");
      }
    });

    it("Should throw an error if trying to delete another user's encounter", async () => {
      const mockEncounter = {
        encounter_id: "12345",
        created_by: "anotheruser",
      };

      encounterDao.getEncounterById.mockResolvedValue(mockEncounter);

      try {
        await encounterService.deleteEncounterById("12345", "testuser");
      } catch (error) {
        expect(error.status).toBe(403);
        expect(error.message).toBe("Cannot delete encounters of other users");
      }
    });
  });
});
