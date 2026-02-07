import { Router } from "express";
import { handleHealthCheck } from "./handlers";
import { Routes } from "../../shared/routes";
import { handleGetClients, handleCreateClient, handleDailyUpdate, handleGetDashboard, handleGetDashboardSummary, handleDeleteClient } from "./handlers/client-handlers";
import { handleAuthSignup, handleAuthLogin } from "./handlers/auth-handlers";
import { handleCreateContact, handleDeleteContact, handleGetContactById, handleGetContacts, handleUpdateContact } from "./handlers/contact-handlers";

const router = Router();

router.get(Routes.Health, handleHealthCheck);

// Client routes
router.get(Routes.Clients, handleGetClients);
router.post(Routes.Clients, handleCreateClient);
router.post(`${Routes.Clients}/daily-update`, handleDailyUpdate);
router.get(`${Routes.Clients}/dashboard`, handleGetDashboard);
router.get(`${Routes.Clients}/dashboard/summary`, handleGetDashboardSummary);
router.delete(`${Routes.Clients}/:id`, handleDeleteClient);

//Auth routes
router.post(Routes.AuthSingup, handleAuthSignup);
router.post(Routes.AuthLogin, handleAuthLogin);

// Contact routes
router.get(Routes.Contacts, handleGetContacts);
router.get(`${Routes.Contacts}/:id`, handleGetContactById);
router.post(Routes.Contacts, handleCreateContact);
router.put(`${Routes.Contacts}/:id`, handleUpdateContact);
router.delete(`${Routes.Contacts}/:id`, handleDeleteContact);

export default router;