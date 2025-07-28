import { Request, Response } from "express";

export const handleHealthCheck = (req: Request, res: Response) => {
    res.status(200).json({
        message: "Status: OK",
    });
};


