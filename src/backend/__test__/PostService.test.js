// Setup post service and post dao to test post service
const PostService = require("../service/postService");
const PostDao = require("../dao/postDAO");

jest.mock("../dao/PostDAO"); //Mock post db

/**
 * POST SERVICE TESTS
 */
describe("PostService Tests", () => {
    // Before each test: 
    // Reset mock db
    beforeEach(() => {
        jest.clearAllMocks();
    })




});