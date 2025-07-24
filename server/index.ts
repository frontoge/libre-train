import express from "express";
import apiRouter from "./api/router";
import { Request, Response } from "express";

console.log("Hello via Bun!");

const app = express();
const port = 3000;

app.use("/api", apiRouter);

app.get(/(.*)/, (req: Request, res: Response) => {
    res.status(404).json({
        error: "Not Found",
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});