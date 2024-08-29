import express from "express";
import * as UserController from "../controllers/user";

const userRouter = express.Router();

// userRouter.get("/", UserController.getUsers);
userRouter.get("/:prolificID", UserController.getUser);
userRouter.post("/", UserController.createUser);
userRouter.patch("/:prolificID", UserController.updateUser);

export default userRouter;