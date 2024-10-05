const userService = require("../src/backend/service/userService");
const userDao = require("../src/backend/dao/userDao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../src/backend/dao/userDao");
jest.mock("../src/backend/dao/encounterDao");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("User Service - loginUser", () => {
  const mockUserEmail = {
    password: "hashedPwd",
    username: "testuser",
    email: "testuser@email.com",
    role: "user",
    about_me: "test about me",
    encounters: [],
    encounter_campaigns: [],
    forum_posts: [],
    interacted_posts: [],
    profile_pic: "profilepicurl",
  };

  const mockUserUsername = {
    password: {
      S: "$2b$10$PoboducZasa/hmJ15wiiuu8JlzedqUgDoWsXTjRk1be.BXL0P8HSy",
    },
    about_me: {
      S: "This is some text to fill in the about me section of this stuff",
    },
    role: { S: "user" },
    encounter_campaigns: { L: [] },
    creation_time: { S: "2024-09-26T20:13:48.133Z" },
    encounters: { L: [] },
    interacted_posts: { L: [] },
    forum_posts: { L: [] },
    username: { S: "user2" },
    email: { S: "gmail@gmail.com" },
    profile_pic: { S: "profilepicurl" },
  };

  it("should log in user by email and return a JWT", async () => {
    const mockEmail = "testuser@email.com";
    const mockPassword = "pwd";

    userDao.getUserByEmail.mockResolvedValue(mockUserEmail);

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockReturnValue("fakeToken");

    const result = await userService.loginUser(mockEmail, mockPassword);

    expect(result).toBe("fakeToken");
  });

  it("should log in user by username and return a JWT", async () => {
    const mockUsername = "user2";
    const mockPassword = "pwd";

    userDao.getUserByUsername.mockResolvedValue(mockUserUsername);

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockReturnValue("fakeToken");

    const result = await userService.loginUser(mockUsername, mockPassword);

    expect(result).toBe("fakeToken");
  });

  it("should throw an error when user is not found", async () => {
    const mockEmail = "tesuser@email.com";
    const mockPassword = "pwd";

    userDao.getUserByEmail.mockResolvedValue(null);

    try {
      await userService.loginUser(mockEmail, mockPassword);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }
  });

  it("should throw an error when password is incorrect", async () => {
    const mockEmail = "testuser@email.com";
    const mockPassword = "pw";

    userDao.getUserByEmail.mockResolvedValue(mockUserEmail);

    try {
      await userService.loginUser(mockEmail, mockPassword);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }
  });

  it("should throw an error when identifier or password is missing", async () => {
    const mockEmail = "testuser@email.com";
    const mockPassword = "pw";

    userDao.getUserByEmail.mockResolvedValue(mockUserEmail);

    try {
      await userService.loginUser(null, mockPassword);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }

    try {
      await userService.loginUser(mockEmail, null);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }
  });
});
