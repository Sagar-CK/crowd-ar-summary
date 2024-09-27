"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    prolificID: { type: String, required: true },
    condition: { type: Number, required: true },
    articleID: { type: String },
    article: { type: String },
    preTask: { type: Boolean },
    task: { type: Boolean },
    postTask: { type: Boolean },
    completed: { type: Boolean },
    timedOut: { type: Boolean },
    returned: { type: Boolean },
    revokedConsent: { type: Boolean },
    initialSummary: { type: String },
    llmSummary: { type: String },
    finalSummary: { type: String },
    queryHistory: [
        {
            query: { type: String, required: true },
            response: { type: String, required: true }
        }
    ]
}, { timestamps: true, versionKey: false });
exports.default = (0, mongoose_1.model)("User", userSchema);
//# sourceMappingURL=user.js.map