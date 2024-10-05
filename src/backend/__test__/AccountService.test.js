const AccountService = require("../service/AccountService");
const AccountDao = require("../dao/AccountDAO");

jest.mock("../dao/AccountDAO");

describe("AccountService Tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    })

    describe("getUserByEmail", () => {
        test("Should return a user when given a registered email", async () => {
            const testEmail = "test@example.com";
            const mockUser = {
                email: "test@example.com",
                username: "testuser",
                password: "password123",
            };

            AccountDao.getUserByEmail.mockReturnValue(mockUser);

            const result = await AccountService.getUserByEmail(testEmail);
            expect(AccountDao.getUserByEmail).toHaveBeenCalledWith(testEmail);
            expect(result).toEqual(mockUser);
        })

        test("Should return null when email does not exist", async () => {
            AccountDao.getUserByEmail.mockReturnValue(null);
            const result = await AccountService.getUserByEmail("test@example.com");
            
            expect(result).toBeNull();
        });
    })
    
    describe("getUserByUsername", () => {
        test("Should return a user when given a registered username", async () => {
            const testUsername = "testuser";
            const mockUser = {
                email: "test@example.com",
                username: "testuser",
                password: "password123",
            };

            AccountDao.getUserByUsername.mockReturnValue(mockUser);
            
            const result = await AccountService.getUserByUsername(testUsername);
            expect(result).toEqual(mockUser);
            expect(AccountDao.getUserByUsername).toHaveBeenCalledWith(testUsername);
        })
    })
    
    describe("registerUser: email input validation", () => {
        test("Should throw Error when missing email", async () => {
            const mockUser = {
                email: "",
                username: "testuser",
                password: "password123",
            };
            AccountDao.registerUser.mockReturnValue(mockUser);

            try {
                await AccountService.registerUser(mockUser);
            } catch (error) {
                expect(error.message).toBe("Email, username, and password are required.");
            }
        })

        test("Should throw Error for incorrect email format", async () => {
            const mockUser = {
                email: "wrongformat",
                username: "testuser",
                password: "password123",
            };
            AccountDao.registerUser.mockReturnValue(mockUser);

            try {
                await AccountService.registerUser(mockUser);
            } catch (error) {
                expect(error.message).toBe("Invalid email format.");
            }
        })

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
                await AccountService.registerUser(mockUser);
            } catch (error) {
                expect(error.message).toBe("Email is already registered");
            }
        })
    })

    describe("registerUser: username input validation", () => {
        test("Should throw Error when missing username", async () => {
            const mockUser = {
                email: "test@example.com",
                username: "",
                password: "password123",
            };
            AccountDao.registerUser.mockReturnValue(mockUser);

            try {
                await AccountService.registerUser(mockUser);
            } catch (error) {
                expect(error.message).toBe("Email, username, and password are required.");
            }
        })

        test("Should throw Error if username contains '@' ", async () => {
            const mockUser = {
                email: "test@example.com",
                username: "user@name",
                password: "password123",
            };

            AccountDao.registerUser.mockReturnValue(mockUser);

            try {
                await AccountService.registerUser(mockUser);
            } catch (error) {
                expect(error.message).toBe("Username cannot contain an '@' symbol.");
            }
        })
        
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
                await AccountService.registerUser(mockUser);
            } catch (error) {
                expect(error.message).toBe("Username is already registered");
            }
        })
    })

    describe("registerUser: password input validation", () => {
        test("Should throw Error when missing password", async () => {
            const mockUser = {
                email: "test@example.com",
                username: "testuser",
                password: "",
            };
            AccountDao.registerUser.mockReturnValue(mockUser);

            try {
                await AccountService.registerUser(mockUser);
            } catch (error) {
                expect(error.message).toBe("Email, username, and password are required.");
            }
        })

        test("Should throw Error when password length is less than 8", async () => {
            const mockUser = {
                email: "test@example.com",
                username: "testuser",
                password: "passwor",
            };
            AccountDao.registerUser.mockReturnValue(mockUser);

            try {
                await AccountService.registerUser(mockUser);
            } catch (error) {
                expect(error.message).toBe("Your password must be at least 8 characters long");
            }
        })
    })

    describe("registerUser: successful creation w/ roles", () => {
        test("Should return User with role 'user' if role is not specified", async () => {
            const mockUser = {
                email: "test@example.com",
                username: "testuser",
                password: "password123",
            };
            AccountDao.isEmailTaken.mockReturnValue(false);
            AccountDao.isUsernameTaken.mockReturnValue(false);
            AccountDao.registerUser.mockReturnValue({ ...mockUser, role: "user", creation_time: "2024-10-04" });

            const result = await AccountService.registerUser(mockUser);
            expect(result.role).toBe("user");
            expect(result.email).toBe(mockUser.email);
            expect(result.username).toBe(mockUser.username);
        })

        test("Should return User with role 'admin' if role is specified", async () => {
            const mockUser = {
                email: "test@example.com",
                username: "testuser",
                password: "password123",
                role: "AdmiN"
            };
            AccountDao.isEmailTaken.mockReturnValue(false);
            AccountDao.isUsernameTaken.mockReturnValue(false);
            AccountDao.registerUser.mockReturnValue({ ...mockUser, role: "admin", creation_time: "2024-10-04" });

            const result = await AccountService.registerUser(mockUser);
            expect(result.role).toBe("admin");
            expect(result.email).toBe(mockUser.email);
            expect(result.username).toBe(mockUser.username);
        })
    })
})