import { Router } from "express";
import { handleHealthCheck } from "./handlers";
import { Routes } from "../../shared/routes";
import { handleGetClients, handleCreateClient, handleDailyUpdate, handleGetDashboard, handleGetDashboardSummary, handleDeleteClient, handleGetClientContacts } from "./handlers/client-handlers";
import { handleAuthSignup, handleAuthLogin } from "./handlers/auth-handlers";
import { handleDeleteExercise, handleExerciseCreate, handleGetAllExercises } from "./handlers/exercise-handlers";
import { handleGetTargetMetricModels } from "./handlers/models/target-metric-handler";
import { handleGetWorkoutRoutineStage } from "./handlers/models/workout-routine-stage-handler";
import { handleCreatePlan, handleDeletePlan, handleGetClientPlans } from "./handlers/plan-handlers";
import { handleCreateContact, handleDeleteContact, handleGetContactById, handleGetContacts, handleUpdateContact } from "./handlers/contact-handlers";
import { handleGetAssessmentGroupTypes, handleGetAssessmentTypes } from "./handlers/assessment-handlers";

const router = Router();

router.get(Routes.Health, handleHealthCheck);

// Client routes
router.get(Routes.Clients, handleGetClients);
router.post(Routes.Clients, handleCreateClient);
router.post(`${Routes.Clients}/daily-update`, handleDailyUpdate);
router.get(`${Routes.Clients}/dashboard`, handleGetDashboard);
router.get(`${Routes.Clients}/dashboard/summary`, handleGetDashboardSummary);
router.delete(`${Routes.Clients}/:id`, handleDeleteClient);
router.get(`${Routes.ClientContact}{/:id}`, handleGetClientContacts);

// Exercise routes
router.post(Routes.ExerciseCreate, handleExerciseCreate);
router.get(Routes.Exercise, handleGetAllExercises);
router.delete(`${Routes.Exercise}/:id`, handleDeleteExercise);

// Plan routes
router.post(`${Routes.Plan}/create`, handleCreatePlan)
router.delete(`${Routes.Plan}/:id`, handleDeletePlan);
router.get(`${Routes.ClientPlan}/:id`, handleGetClientPlans);

// Models
// Target Metric Types
router.get(Routes.TargetMetricTypes, handleGetTargetMetricModels);
router.get(Routes.WorkoutRoutineStages, handleGetWorkoutRoutineStage);

//Auth routes
router.post(Routes.AuthSignup, handleAuthSignup);
router.post(Routes.AuthLogin, handleAuthLogin);

// Contact routes
router.get(Routes.Contacts, handleGetContacts);
router.get(`${Routes.Contacts}/:id`, handleGetContactById);
router.post(Routes.Contacts, handleCreateContact);
router.put(`${Routes.Contacts}/:id`, handleUpdateContact);
router.delete(`${Routes.Contacts}/:id`, handleDeleteContact);

// Assessment routes
router.get(`${Routes.Assessment}/:id`, handleGetAssessmentTypes);
router.get(`${Routes.AssessmentGroup}/:id`, handleGetAssessmentGroupTypes);

export default router;