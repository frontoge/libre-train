import { Router } from "express";
import { handleHealthCheck } from "./handlers";
import { Routes } from "../../shared/routes";
import { handleGetClients } from "./handlers/client-handlers";

const router = Router();

router.get(Routes.Health, handleHealthCheck);

router.get(Routes.Clients, handleGetClients);

export default router;