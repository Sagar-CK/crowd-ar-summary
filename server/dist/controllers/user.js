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
exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const user_1 = __importDefault(require("../models/user"));
const http_errors_1 = __importDefault(require("http-errors"));
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
            prolificID: prolificID
        });
        console.log(user);
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
    const prolificID = req.body.prolificID;
    const preTask = req.body.preTask;
    const condition = req.body.condition;
    try {
        if (!prolificID)
            (0, http_errors_1.default)(400, "User needs a prolificID!");
        // Check if the user already exists
        const user = yield user_1.default.findOne({ prolificID: prolificID }).exec();
        if (user) {
            return;
        }
        const newUser = yield user_1.default.create({
            prolificID: prolificID,
            preTask: preTask,
            condition: condition,
        });
        res.status(201).json(newUser);
    }
    catch (error) {
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
            finalSummary: finalSummary,
            articleID: req.body.articleID,
            preTask: req.body.preTask,
            task: req.body.task,
            postTask: req.body.postTask,
            completed: req.body.completed,
            timedOut: req.body.timedOut,
            revokedConsent: req.body.revokedConsent,
            initialSummary: req.body.initialSummary,
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
//# sourceMappingURL=user.js.map