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
    it("Should return an encounter by its Id", async);
  });
});
