import { Request, Response } from "express";

export const handleTestRoute = (req: Request, res: Response) => {
    res.json({
        message: "This is a test route!"
    });
};

