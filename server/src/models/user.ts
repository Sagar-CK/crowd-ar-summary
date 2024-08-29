import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema({
    prolificID: {type: String, required: true},
    condition: {type: Number, required: true},
    articleID: {type: String},
    preTask: {type: Boolean},
    task: {type: Boolean},
    postTask: {type: Boolean},
    completed: {type: Boolean},
    timedOut: {type: Boolean},
    revokedConsent: {type: Boolean},
    initialSummary: {type: String},
    llmSummary: {type: String},
    finalSummary: {type: String},
    queryHistory: [
        {
            query: {type: String, required: true},
            response: {type: String, required: true}
        }
    ]

}, {timestamps: true, versionKey: false});

type User = InferSchemaType<typeof userSchema>;

export default model<User>("User", userSchema);