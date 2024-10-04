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
    
    describe("registerUser", () => {
        test("Should throw Error when missing email", async () => {
            const mockUser = {
                email: "",
                username: "testuser",
                password: "password123",
            };
            AccountDao.registerUser.mockReturnValue(mockUser);

            await expect(() => {
                AccountService.registerUser(mockUser);
            }).toThrow("Email, username, and password are required.");
        })
    })
})