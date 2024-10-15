import { InferSchemaType, model, Schema } from "mongoose";

const articleSchema = new Schema({
    id: { type: String, required: true, unique: true },
    article: { type: String, required: true },
    highlights: { type: String, required: true },
    llm_summary: { type: String, required: true },
    assigned_1: { type: Boolean, required: true, default: false },
    assigned_2: { type: Boolean, required: true, default: false },
    assigned_3: { type: Boolean, required: true, default: false },
}, { timestamps: true });


type Article = InferSchemaType<typeof articleSchema>;

export default model<Article>("Article", articleSchema);
