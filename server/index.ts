import express, { NextFunction } from "express";
import apiRouter from "./api/router";
import { Request, Response } from "express";
import cors from "cors";

console.log("Starting server...");

const app = express();
const port = 3000;

app.use(cors({
    // TODO change this to fill with frontend Deployment URL
    origin: '*', // Adjust as necessary for CORS
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use("/api", apiRouter);

app.get(/(.*)/, (req: Request, res: Response) => {
    res.status(404).json({
        error: "Not Found",
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});