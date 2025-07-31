import { Router } from "express";
import { handleHealthCheck } from "./handlers";
import { Routes } from "../../shared/routes";
import { handleGetClients, handleCreateClient } from "./handlers/client-handlers";

const router = Router();

router.get(Routes.Health, handleHealthCheck);

router.get(Routes.Clients, handleGetClients);
router.post(Routes.Clients, handleCreateClient);

export default router;