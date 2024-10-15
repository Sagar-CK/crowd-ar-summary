"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const articleSchema = new mongoose_1.Schema({
    id: { type: String, required: true, unique: true },
    article: { type: String, required: true },
    highlights: { type: String, required: true },
    llm_summary: { type: String, required: true },
    assigned_1: { type: Boolean, required: true, default: false },
    assigned_2: { type: Boolean, required: true, default: false },
    assigned_3: { type: Boolean, required: true, default: false },
}, { timestamps: true });
exports.default = (0, mongoose_1.model)("Article", articleSchema);
//# sourceMappingURL=article.js.map