import { Router } from "express";
import { handleHealthCheck } from "./handlers";
import { Routes } from "../../shared/routes";
import { handleGetClients, handleCreateClient, handleDailyUpdate, handleGetDashboard, handleGetDashboardSummary, handleDeleteClient } from "./handlers/client-handlers";
import { handleAuthSignup } from "./handlers/auth-handlers";

const router = Router();

router.get(Routes.Health, handleHealthCheck);

router.get(Routes.Clients, handleGetClients);
router.post(Routes.Clients, handleCreateClient);
router.post(`${Routes.Clients}/daily-update`, handleDailyUpdate); // Assuming this is the correct endpoint for daily updates
router.get(`${Routes.Clients}/dashboard`, handleGetDashboard);
router.get(`${Routes.Clients}/dashboard/summary`, handleGetDashboardSummary);
router.delete(`${Routes.Clients}/:id`, handleDeleteClient);

//Auth routes
router.post(Routes.AuthSingup, handleAuthSignup);

export default router;