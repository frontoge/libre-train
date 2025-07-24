import { Router } from "express";
import { handleTestRoute } from "./handlers";
import { Routes } from "../../shared/routes";

const router = Router();

router.get(Routes.Test, handleTestRoute);



export default router;