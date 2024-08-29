"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const validateEnv_1 = __importDefault(require("./utils/validateEnv"));
const PORT = validateEnv_1.default.PORT || 5000;
mongoose_1.default.connect(validateEnv_1.default.MONGO_CONNECTION_STRING).then(() => {
    console.log("Mongoose connected!");
    app_1.default.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}).catch(console.error);
//# sourceMappingURL=server.js.map