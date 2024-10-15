import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import userRouter from "./routes/user";
import createHttpError, {isHttpError} from "http-errors";

const app = express()

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to the API!");
});

app.use("/api/users", userRouter);

app.use((req, res, next) => {
    next(createHttpError(404, "Endpoint not found: " + req.path));
})

app.use((error: unknown, req: Request, res: Response) =>{
    console.log(error);
    let errorMsg = "An unknown error occured!";
    let statusCode = 500;
    if(isHttpError(error)){
        statusCode = error.statusCode;
        errorMsg = error.message;
    }
    res.status(statusCode).json({error: errorMsg});
});

export default app;