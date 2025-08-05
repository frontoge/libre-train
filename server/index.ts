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
}));
// Increase the limit for JSON payloads
app.use(express.json({ limit: '5mb' })); 

// Increase the limit for URL-encoded payloads (if applicable)
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use("/api", apiRouter);

app.get(/(.*)/, (req: Request, res: Response) => {
    res.status(404).json({
        error: "Not Found",
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});