import { RequestHandler } from "express";
import UserModel from "../models/user";
import createHttpError from "http-errors";

interface CreateUserBody {
    prolificID?: string,
    condition?: number,
    preTask: boolean,
}

export const getUsers: RequestHandler = async (req, res, next) => {
    try {
        const users = await UserModel.find().exec();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
}

export const getUser: RequestHandler = async (req, res, next) => {
    const prolificID = req.params.prolificID;
    try {
        const user = await UserModel.findOne({
            prolificID: prolificID
        })
        console.log(user);

        if (!user) createHttpError(400, "User was not found!")

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
}


export const createUser: RequestHandler<unknown, unknown, CreateUserBody, unknown> = async (req, res, next) => {
    const prolificID = req.body.prolificID;
    const preTask = req.body.preTask;
    const condition = req.body.condition;

    try {

        if(!prolificID) createHttpError(400, "User needs a prolificID!")

        // Check if the user already exists
        const user = await UserModel.findOne({ prolificID: prolificID }).exec();
        if (user) {
            return;
        }

        const newUser = await UserModel.create({
            prolificID: prolificID,
            preTask: preTask,
            condition: condition,
        })

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
}

interface UpdateUserParams {
    prolificID: string,
}

interface UpdateUserBody {
    articleID?: string;
    preTask?: boolean;
    task?: boolean;
    postTask?: boolean;
    completed?: boolean;
    timedOut?: boolean;
    revokedConsent?: boolean;
    initialSummary?: string;
    llmSummary?: string;
    finalSummary?: string;
    queryHistory?: Query[];
}

type Query = {
    query: string;
    response: string;
}

export const updateUser: RequestHandler<UpdateUserParams, unknown, UpdateUserBody, unknown> = async (req, res, next) => {
    const prolificID = req.params.prolificID;
    const finalSummary = req.body.finalSummary;

    try {
        if (!prolificID) {
            throw createHttpError(400, "User needs a prolificID!");
        }

        // Use updateOne with a filter and an update object
        const result = await UserModel.updateOne(
            { prolificID: prolificID },  // Filter to find the document to update
            {   // Update object with the fields to update
                finalSummary: finalSummary,
                articleID: req.body.articleID,
                preTask: req.body.preTask,
                task: req.body.task,
                postTask: req.body.postTask,
                completed: req.body.completed,
                timedOut: req.body.timedOut,
                revokedConsent: req.body.revokedConsent,
                initialSummary: req.body.initialSummary,
                llmSummary: req.body.llmSummary,
                queryHistory: req.body.queryHistory,
            }
        );

        if (result.modifiedCount === 0) {
            // If no document was modified, the prolificID might not exist
            throw createHttpError(404, "User not found");
        }

        res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        next(error);
    }
};