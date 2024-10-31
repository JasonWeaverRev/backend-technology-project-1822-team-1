const accountService = require("../src/backend/service/accountService");
const accountDao = require("../src/backend/dao/accountDao");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PutItemCommand } = require("@aws-sdk/client-dynamodb");

jest.mock("../src/backend/dao/accountDao");
jest.mock("../src/backend/dao/encounterDao");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("accountService Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserByEmail", () => {
    it("Should return a user when given a registered email", async () => {
      const testEmail = "test@example.com";
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };

      accountDao.getUserByEmail.mockReturnValue(mockUser);

      const result = await accountService.getUserByEmail(testEmail);
      expect(accountDao.getUserByEmail).toHaveBeenCalledWith(testEmail);
      expect(result).toEqual(mockUser);
    });

    it("Should return null when email does not exist", async () => {
      accountDao.getUserByEmail.mockReturnValue(null);
      const result = await accountService.getUserByEmail("test@example.com");

      expect(result).toBeNull();
    });
  });

  describe("getUserByUsername", () => {
    it("Should return a user when given a registered username", async () => {
      const testUsername = "testuser";
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };

      accountDao.getUserByUsername.mockReturnValue(mockUser);

      const result = await accountService.getUserByUsername(testUsername);
      expect(result).toEqual(mockUser);
      expect(accountDao.getUserByUsername).toHaveBeenCalledWith(testUsername);
    });
  });

  describe("registerUser: email input validation", () => {
    it("Should throw Error when missing email", async () => {
      const mockUser = {
        email: "",
        username: "testuser",
        password: "password123",
      };
      accountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe(
          "Email, username, and password are required."
        );
      }
    });

    it("Should throw Error for incorrect email format", async () => {
      const mockUser = {
        email: "wrongformat",
        username: "testuser",
        password: "password123",
      };
      accountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe("Invalid email format.");
      }
    });

    it("Should throw Error is email is already registered", async () => {
      const testUsername = "testuser";
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      accountDao.getUserByEmail.mockReturnValue(mockUser);
      accountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe("Email is already registered");
      }
    });
  });

  describe("registerUser: username input validation", () => {
    it("Should throw Error when missing username", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "",
        password: "password123",
      };
      accountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe(
          "Email, username, and password are required."
        );
      }
    });

    it("Should throw Error if username contains '@' ", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "user@name",
        password: "password123",
      };

      accountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe("Username cannot contain an '@' symbol.");
      }
    });

    it("Should throw Error if username is taken", async () => {
      const testUsername = "testuser";
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      accountDao.isUsernameTaken.mockReturnValue(mockUser);
      accountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe("Username is already registered");
      }
    });
  });

  describe("registerUser: password input validation", () => {
    it("Should throw Error when missing password", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "",
      };
      accountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe(
          "Email, username, and password are required."
        );
      }
    });

    it("Should throw Error when password length is less than 8", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "passwor",
      };
      accountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe(
          "Your password must be at least 8 characters long"
        );
      }
    });
  });

  describe("registerUser: successful creation w/ roles", () => {
    it("Should return User with role 'user' if role is not specified", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      accountDao.isEmailTaken.mockReturnValue(false);
      accountDao.isUsernameTaken.mockReturnValue(false);
      accountDao.registerUser.mockReturnValue({
        ...mockUser,
        role: "user",
        creation_time: "2024-10-04",
      });

      const result = await accountService.registerUser(mockUser);
      expect(result.role).toBe("user");
      expect(result.email).toBe(mockUser.email);
      expect(result.username).toBe(mockUser.username);
    });

    it("Should return User with role 'admin' if role is specified", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        role: "AdmiN",
      };
      accountDao.isEmailTaken.mockReturnValue(false);
      accountDao.isUsernameTaken.mockReturnValue(false);
      accountDao.registerUser.mockReturnValue({
        ...mockUser,
        role: "admin",
        creation_time: "2024-10-04",
      });

      const result = await accountService.registerUser(mockUser);
      expect(result.role).toBe("admin");
      expect(result.email).toBe(mockUser.email);
      expect(result.username).toBe(mockUser.username);
    });
  });

  describe("updateAboutMe", () => {
    it("Should return User email w/ new about_me text", async () => {
      const mockUserEmail = "test@email.com";
      const mockText = "Example about me text";
      accountDao.isEmailTaken.mockReturnValue(true);
      accountDao.updateAboutMe.mockReturnValue({
        email: mockUserEmail, 
        about_me: mockText});

      const result = await accountService.updateAboutMe(mockUserEmail, mockText);
      expect(result.email).toBe("test@email.com");
      expect(result.about_me).toBe("Example about me text");
    });

    it("Should throw Error when email isn't registered", async () => {
      const mockUserEmail = "test@email.com";
      const mockText = "Example about me text";
      accountDao.isEmailTaken.mockReturnValue(false);
      accountDao.updateAboutMe.mockReturnValue({mockUserEmail, mockText});

      try {
        const result = await accountService.updateAboutMe(mockUserEmail, mockText);
      } catch (error) {
        expect(error.message).toBe(
          "Account does not exist"
        );
      }
      
    });
  });
});

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

    accountDao.getUserByEmail.mockResolvedValue(mockUserEmail);

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockReturnValue("fakeToken");

    const result = await accountService.loginUser(mockEmail, mockPassword);

    expect(result).toBe("fakeToken");
  });

  it("should log in user by username and return a JWT", async () => {
    const mockUsername = "user2";
    const mockPassword = "pwd";

    accountDao.getUserByUsername.mockResolvedValue(mockUserUsername);

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockReturnValue("fakeToken");

    const result = await accountService.loginUser(mockUsername, mockPassword);

    expect(result).toBe("fakeToken");
  });

  it("should throw an error when user is not found", async () => {
    const mockEmail = "tesuser@email.com";
    const mockPassword = "pwd";

    accountDao.getUserByEmail.mockResolvedValue(null);

    try {
      await accountService.loginUser(mockEmail, mockPassword);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }
  });

  it("should throw an error when password is incorrect", async () => {
    const mockEmail = "testuser@email.com";
    const mockPassword = "pw";

    accountDao.getUserByEmail.mockResolvedValue(mockUserEmail);

    try {
      await accountService.loginUser(mockEmail, mockPassword);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }
  });

  it("should throw an error when identifier or password is missing", async () => {
    const mockEmail = "testuser@email.com";
    const mockPassword = "pw";

    accountDao.getUserByEmail.mockResolvedValue(mockUserEmail);

    try {
      await accountService.loginUser(null, mockPassword);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }

    try {
      await accountService.loginUser(mockEmail, null);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }
  });
});
