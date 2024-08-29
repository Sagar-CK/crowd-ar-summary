import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import env from "./utils/validateEnv";

const PORT = env.PORT || 5000;

mongoose.connect(env.MONGO_CONNECTION_STRING).then(() => {
  console.log("Mongoose connected!");
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}).catch(console.error);