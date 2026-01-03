import { Router } from "express";
import { handleHealthCheck } from "./handlers";
import { Routes } from "../../shared/routes";
import { handleGetClients, handleCreateClient, handleDailyUpdate, handleGetDashboard, handleGetDashboardSummary, handleDeleteClient } from "./handlers/client-handlers";
import { handleAuthSignup, handleAuthLogin } from "./handlers/auth-handlers";
import { handleDeleteExercise, handleExerciseCreate, handleGetAllExercises } from "./handlers/exercise-handlers";
import { handleGetTargetMetricModels } from "./handlers/models/target-metric-handler";
import { handleGetWorkoutRoutineStage } from "./handlers/models/workout-routine-stage-handler";
import { handleCreatePlan, handleGetClientPlans } from "./handlers/plan-handlers";

const router = Router();

router.get(Routes.Health, handleHealthCheck);

router.get(Routes.Clients, handleGetClients);
router.post(Routes.Clients, handleCreateClient);
router.post(`${Routes.Clients}/daily-update`, handleDailyUpdate); // Assuming this is the correct endpoint for daily updates
router.get(`${Routes.Clients}/dashboard`, handleGetDashboard);
router.get(`${Routes.Clients}/dashboard/summary`, handleGetDashboardSummary);
router.delete(`${Routes.Clients}/:id`, handleDeleteClient);

// Exercise routes
router.post(Routes.ExerciseCreate, handleExerciseCreate);
router.get(Routes.Exercise, handleGetAllExercises);
router.delete(`${Routes.Exercise}/:id`, handleDeleteExercise);

// Plan routes
router.post(`${Routes.Plan}/create`, handleCreatePlan)
router.get(`${Routes.ClientPlan}/:id`, handleGetClientPlans);

// Models
// Target Metric Types
router.get(Routes.TargetMetricTypes, handleGetTargetMetricModels);
router.get(Routes.WorkoutRoutineStages, handleGetWorkoutRoutineStage);

//Auth routes
router.post(Routes.AuthSignup, handleAuthSignup);
router.post(Routes.AuthLogin, handleAuthLogin);

export default router;