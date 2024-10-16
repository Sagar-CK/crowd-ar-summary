"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserIfTheyHaveNoArticle = exports.getNextArticle = exports.queryLLM = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const user_1 = __importDefault(require("../models/user"));
const article_1 = __importDefault(require("../models/article"));
const http_errors_1 = __importDefault(require("http-errors"));
const mongoose_1 = __importDefault(require("mongoose"));
const getUsers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_1.default.find().exec();
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
});
exports.getUsers = getUsers;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const prolificID = req.params.prolificID;
    try {
        const user = yield user_1.default.findOne({
            prolificID: prolificID,
        });
        if (!user)
            (0, http_errors_1.default)(400, "User was not found!");
        res.status(200).json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUser = getUser;
const createUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const prolificID = req.body.prolificID;
        const preTask = req.body.preTask;
        const condition = req.body.condition;
        if (!prolificID) {
            throw (0, http_errors_1.default)(400, "User needs a prolificID!");
        }
        // Check if the user already exists
        const user = yield user_1.default.findOne({ prolificID })
            .session(session)
            .exec();
        if (user) {
            yield session.abortTransaction();
            session.endSession();
            return res.status(200).json(user); // User already exists
        }
        // Assign the next available article
        const assignedArticle = yield (0, exports.getNextArticle)(condition);
        // Create new user within transaction
        const newUser = yield user_1.default.create([
            {
                prolificID,
                preTask,
                task: false,
                postTask: false,
                timedOut: false,
                condition,
                article: assignedArticle.article,
                articleID: assignedArticle.id,
                llmSummary: condition === 1 ? assignedArticle.llm_summary : "",
                returned: false,
                revokedConsent: false,
            },
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        res.status(201).json(newUser);
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        next(error);
    }
});
exports.createUser = createUser;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const prolificID = req.params.prolificID;
    const finalSummary = req.body.finalSummary;
    try {
        if (!prolificID) {
            throw (0, http_errors_1.default)(400, "User needs a prolificID!");
        }
        // Use updateOne with a filter and an update object
        const result = yield user_1.default.updateOne({ prolificID: prolificID }, // Filter to find the document to update
        {
            // Update object with the fields to update
            finalSummary: finalSummary,
            articleID: req.body.articleID,
            preTask: req.body.preTask,
            task: req.body.task,
            postTask: req.body.postTask,
            completed: req.body.completed,
            timedOut: req.body.timedOut,
            returned: req.body.returned,
            revokedConsent: req.body.revokedConsent,
            initialSummary: req.body.initialSummary,
            llmSummary: req.body.llmSummary,
            queryHistory: req.body.queryHistory,
        });
        if (result.modifiedCount === 0) {
            // If no document was modified, the prolificID might not exist
            throw (0, http_errors_1.default)(404, "User not found");
        }
        res.status(200).json({ message: "User updated successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.updateUser = updateUser;
const queryLLM = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = process.env.LLM_API_URL;
        if (!url) {
            throw (0, http_errors_1.default)(500, "LLM_API_URL is not set");
        }
        const response = yield fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req.body),
        });
        if (!response.ok) {
            throw (0, http_errors_1.default)(500, "Error querying LLM");
        }
        const data = yield response.json();
        res.status(200).json(data);
    }
    catch (error) {
        next(error);
    }
});
exports.queryLLM = queryLLM;
// For a user's condition we need to fetch the next usable article.
// We retrieve all the users for a condition and store their article IDs
// We exclude users that have revoked consent or have timed out
// We then find the first article that is not in the list of used articles
// If all articles are used we return null
const getNextArticle = (condition) => __awaiter(void 0, void 0, void 0, function* () {
    // eslint-disable-next-line no-useless-catch
    try {
        // Find available articles that haven't been assigned
        let availableArticle = undefined;
        if (condition === 1) {
            availableArticle = yield article_1.default.findOneAndUpdate({ assigned_1: false }, { assigned_1: true }, { new: true }).exec();
        }
        if (condition === 2) {
            availableArticle = yield article_1.default.findOneAndUpdate({ assigned_2: false }, { assigned_2: true }, { new: true }).exec();
        }
        if (condition === 3) {
            availableArticle = yield article_1.default.findOneAndUpdate({ assigned_3: false }, { assigned_3: true }, { new: true }).exec();
        }
        if (!availableArticle) {
            return {
                id: "NO_ARTICLE_AVAILABLE",
                article: "NO_ARTICLE_AVAILABLE",
                highlights: "NO_ARTICLE_AVAILABLE",
                llm_summary: "NO_ARTICLE_AVAILABLE",
            };
        }
        yield availableArticle.save();
        return {
            id: availableArticle.id,
            article: availableArticle.article,
            highlights: availableArticle.highlights,
            llm_summary: availableArticle.llm_summary,
        };
    }
    catch (error) {
        throw error;
    }
});
exports.getNextArticle = getNextArticle;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const updateUserIfTheyHaveNoArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const prolificID = req.params.prolificID;
    // eslint-disable-next-line no-useless-catch
    try {
        const user = yield user_1.default.findOne({ prolificID: prolificID }).exec();
        if (!user) {
            throw (0, http_errors_1.default)(400, "User was not found!");
        }
        if (user.article === "NO_ARTICLE_AVAILABLE") {
            console.log("Updating user with no article");
            const assignedArticle = yield (0, exports.getNextArticle)(user.condition);
            if (assignedArticle.id === "NO_ARTICLE_AVAILABLE") {
                console.log("No articles available");
                res.status(200).json({ message: "No articles available" });
                return;
            }
            // if condition 1 add the llm summary
            let llmSummary = "";
            if (user.condition === 1) {
                llmSummary = assignedArticle.llm_summary;
            }
            yield user_1.default.updateOne({ prolificID: prolificID }, {
                article: assignedArticle.article,
                articleID: assignedArticle.id,
                llmSummary: llmSummary,
            });
            res.status(200).json({ message: "User updated successfully" });
        }
    }
    catch (error) {
        throw error;
    }
});
exports.updateUserIfTheyHaveNoArticle = updateUserIfTheyHaveNoArticle;
//# sourceMappingURL=user.js.map