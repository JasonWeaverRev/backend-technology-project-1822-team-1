const accountService = require("../src/backend/service/AccountService");
const AccountDao = require("../src/backend/dao/AccountDAO");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

jest.mock("../src/backend/dao/AccountDAO");
jest.mock("../src/backend/dao/encounterDao");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("accountService Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserByEmail", () => {
    test("Should return a user when given a registered email", async () => {
      const testEmail = "test@example.com";
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };

      AccountDao.getUserByEmail.mockReturnValue(mockUser);

      const result = await accountService.getUserByEmail(testEmail);
      expect(AccountDao.getUserByEmail).toHaveBeenCalledWith(testEmail);
      expect(result).toEqual(mockUser);
    });

    test("Should return null when email does not exist", async () => {
      AccountDao.getUserByEmail.mockReturnValue(null);
      const result = await accountService.getUserByEmail("test@example.com");

      expect(result).toBeNull();
    });
  });

  describe("getUserByUsername", () => {
    test("Should return a user when given a registered username", async () => {
      const testUsername = "testuser";
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };

      AccountDao.getUserByUsername.mockReturnValue(mockUser);

      const result = await accountService.getUserByUsername(testUsername);
      expect(result).toEqual(mockUser);
      expect(AccountDao.getUserByUsername).toHaveBeenCalledWith(testUsername);
    });
  });

  describe("registerUser: email input validation", () => {
    test("Should throw Error when missing email", async () => {
      const mockUser = {
        email: "",
        username: "testuser",
        password: "password123",
      };
      AccountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe(
          "Email, username, and password are required."
        );
      }
    });

    test("Should throw Error for incorrect email format", async () => {
      const mockUser = {
        email: "wrongformat",
        username: "testuser",
        password: "password123",
      };
      AccountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe("Invalid email format.");
      }
    });

    test("Should throw Error is email is already registered", async () => {
      const testUsername = "testuser";
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      AccountDao.getUserByEmail.mockReturnValue(mockUser);
      AccountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe("Email is already registered");
      }
    });
  });

  describe("registerUser: username input validation", () => {
    test("Should throw Error when missing username", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "",
        password: "password123",
      };
      AccountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe(
          "Email, username, and password are required."
        );
      }
    });

    test("Should throw Error if username contains '@' ", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "user@name",
        password: "password123",
      };

      AccountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe("Username cannot contain an '@' symbol.");
      }
    });

    test("Should throw Error if username is taken", async () => {
      const testUsername = "testuser";
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      AccountDao.isUsernameTaken.mockReturnValue(mockUser);
      AccountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe("Username is already registered");
      }
    });
  });

  describe("registerUser: password input validation", () => {
    test("Should throw Error when missing password", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "",
      };
      AccountDao.registerUser.mockReturnValue(mockUser);

      try {
        await accountService.registerUser(mockUser);
      } catch (error) {
        expect(error.message).toBe(
          "Email, username, and password are required."
        );
      }
    });

    test("Should throw Error when password length is less than 8", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "passwor",
      };
      AccountDao.registerUser.mockReturnValue(mockUser);

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
    test("Should return User with role 'user' if role is not specified", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
      };
      AccountDao.isEmailTaken.mockReturnValue(false);
      AccountDao.isUsernameTaken.mockReturnValue(false);
      AccountDao.registerUser.mockReturnValue({
        ...mockUser,
        role: "user",
        creation_time: "2024-10-04",
      });

      const result = await accountService.registerUser(mockUser);
      expect(result.role).toBe("user");
      expect(result.email).toBe(mockUser.email);
      expect(result.username).toBe(mockUser.username);
    });

    test("Should return User with role 'admin' if role is specified", async () => {
      const mockUser = {
        email: "test@example.com",
        username: "testuser",
        password: "password123",
        role: "AdmiN",
      };
      AccountDao.isEmailTaken.mockReturnValue(false);
      AccountDao.isUsernameTaken.mockReturnValue(false);
      AccountDao.registerUser.mockReturnValue({
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

    AccountDao.getUserByEmail.mockResolvedValue(mockUserEmail);

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockReturnValue("fakeToken");

    const result = await accountService.loginUser(mockEmail, mockPassword);

    expect(result).toBe("fakeToken");
  });

  it("should log in user by username and return a JWT", async () => {
    const mockUsername = "user2";
    const mockPassword = "pwd";

    AccountDao.getUserByUsername.mockResolvedValue(mockUserUsername);

    bcrypt.compare.mockResolvedValue(true);

    jwt.sign.mockReturnValue("fakeToken");

    const result = await accountService.loginUser(mockUsername, mockPassword);

    expect(result).toBe("fakeToken");
  });

  it("should throw an error when user is not found", async () => {
    const mockEmail = "tesuser@email.com";
    const mockPassword = "pwd";

    AccountDao.getUserByEmail.mockResolvedValue(null);

    try {
      await accountService.loginUser(mockEmail, mockPassword);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }
  });

  it("should throw an error when password is incorrect", async () => {
    const mockEmail = "testuser@email.com";
    const mockPassword = "pw";

    AccountDao.getUserByEmail.mockResolvedValue(mockUserEmail);

    try {
      await accountService.loginUser(mockEmail, mockPassword);
    } catch (error) {
      expect(error.message).toBe("Invalid username/email or password");
    }
  });

  it("should throw an error when identifier or password is missing", async () => {
    const mockEmail = "testuser@email.com";
    const mockPassword = "pw";

    AccountDao.getUserByEmail.mockResolvedValue(mockUserEmail);

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
