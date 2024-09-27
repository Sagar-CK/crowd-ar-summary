import { RequestHandler } from "express";
import UserModel from "../models/user";
import createHttpError from "http-errors";
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

// Load and parse the dataset
const datasetPath = path.join(__dirname, '../data/articles_summary.csv');
// Initialize dataset and used articles
const articles: { id: string; article: string; highlights: string; llm_summary: string;}[] = [];

const loadDataset = async () => {
    return new Promise<void>((resolve, reject) => {
        fs.createReadStream(datasetPath)
            .pipe(csv())
            .on('data', (row) => {
                // Push each row to the articles array
                articles.push({
                    id: row.id,
                    article: row.article,
                    highlights: row.highlights,
                    llm_summary: row.llm_summary
                });
            })
            .on('end', () => {
                resolve();
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

// Initialize the dataset
(async () => {
    try {
        await loadDataset();
        console.log('Dataset loaded successfully');
    } catch (error) {
        console.error('Error loading dataset:', error);
    }
})();


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
        if (!prolificID) {
            throw createHttpError(400, "User needs a prolificID!");
        }

        // Check if the user already exists
        const user = await UserModel.findOne({ prolificID: prolificID }).exec();
        if (user) {
            return res.status(200).json(user); // User already exists
        }


        // Assign the next available article
        let assignedArticle = await getNextArticle(condition);

        // if condition 1 add the llm summary
        let llmSummary = "";
        if (condition === 1) {
            llmSummary = assignedArticle.llm_summary;
        }

        // Create new user
        const newUser = await UserModel.create({
            prolificID: prolificID,
            preTask: preTask,
            task: false,
            postTask: false,
            timedOut: false,
            condition: condition,
            article: assignedArticle.article, // Add the assigned article
            articleID: assignedArticle.id,      // Add the article ID
            llmSummary: llmSummary,
            returned: false,
            revokedConsent: false,
        });

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
    returned?: boolean;
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
                returned: req.body.returned,
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

export const queryLLM: RequestHandler = async (req, res, next) => {
    try {
        const url = process.env.LLM_API_URL;
        if (!url) {
            throw createHttpError(500, "LLM_API_URL is not set");
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body),
        });


        if (!response.ok) {
            throw createHttpError(500, "Error querying LLM");
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        next(error);
    }
}

// For a user's condition we need to fetch the next usable article.
// We retrieve all the users for a condition and store their article IDs
// We exclude users that have revoked consent or have timed out
// We then find the first article that is not in the list of used articles
// If all articles are used we return null

export const getNextArticle = async (condition: number): Promise<{ id: string; article: string; highlights: string; llm_summary: string;} | null> => {
    try {
        const users = await UserModel.find({
            condition: condition,
            $nor: [
                { revokedConsent: true },
                { returned: true },
            ]
        }).exec();

        const usedArticles = users.map((user) => user.articleID);

        const availableArticles = articles.filter((article) => !usedArticles.includes(article.id));

        // console.log('Available articles:', availableArticles);

        if (availableArticles.length === 0) {
            const temp = {
                id: "NO_ARTICLE_AVAILABLE",
                article: "NO_ARTICLE_AVAILABLE",
                highlights: "NO_ARTICLE_AVAILABLE",
                llm_summary: "NO_ARTICLE_AVAILABLE"
            }
            return temp;
        }

        return availableArticles[0];
    } catch (error) {
        throw error;
    }
};

export const updateUserIfTheyHaveNoArticle: RequestHandler = async (req, res, next) => {
    const prolificID = req.params.prolificID;
    try {
        const user = await UserModel.findOne({ prolificID: prolificID }).exec();
        if (!user) {
            throw createHttpError(400, "User was not found!");
        }

        if (user.article === "NO_ARTICLE_AVAILABLE") {
            console.log("Updating user with no article");
            let assignedArticle = await getNextArticle(user.condition);

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

            await UserModel.updateOne(
                { prolificID: prolificID },
                {
                    article: assignedArticle.article,
                    articleID: assignedArticle.id,
                    llmSummary: llmSummary,
                }
            );

            res.status(200).json({ message: "User updated successfully" });
        }
    } catch (error) {
        throw error;
    }
}