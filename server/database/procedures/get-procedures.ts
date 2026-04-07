import { prisma } from '../mysql-database';
import { queryRows, SqlDate } from './procedure-utils';

export const getAssessmentClientLog = async (
	p_client_id: number,
	p_group_id: number | null,
	p_type_id: number | null,
	p_start_date: SqlDate | null,
	p_end_date: SqlDate | null,
	p_page: number | null,
	p_page_size: number | null
) => {
	const v_page = p_page && p_page !== 0 ? p_page : 1;
	const v_page_size = p_page_size && p_page_size !== 0 ? p_page_size : 20;
	const v_offset = v_page_size * (v_page - 1);
	return queryRows(
		prisma,
		`SELECT acl.*
		 FROM AssessmentClientLog acl
		 JOIN AssessmentType ast ON ast.id = acl.assessmentTypeId
		 WHERE acl.clientId = ?
			AND (? IS NULL OR ast.assessmentGroupId = ?)
			AND (? IS NULL OR acl.assessmentTypeId = ?)
			AND (? IS NULL OR acl.assessmentDate >= ?)
			AND (? IS NULL OR acl.assessmentDate <= ?)
		 LIMIT ?, ?`,
		[p_client_id, p_group_id, p_group_id, p_type_id, p_type_id, p_start_date, p_start_date, p_end_date, p_end_date, v_offset, v_page_size]
	);
};
export const getAssessmentTypes = (p_id: number | null) =>
	queryRows(prisma, 'SELECT * FROM AssessmentType WHERE ? IS NULL OR id = ?', [p_id, p_id]);
export const getClientContacts = (p_client_id: number | null) =>
	queryRows(
		prisma,
		`SELECT
			cc.ClientId AS id,
			cc.ContactId AS contact_id,
			cc.trainerId,
			cc.first_name,
			cc.last_name,
			cc.email,
			cc.phone,
			cc.height,
			cc.date_of_birth,
			cc.notes,
			cc.img
		 FROM ClientContact cc
		 WHERE ? IS NULL OR cc.ClientId = ?`,
		[p_client_id, p_client_id]
	);
export const getClientDashboard = (p_client_id: number, p_date: SqlDate) =>
	queryRows(
		prisma,
		`WITH latestGoal (client_id, goal, target_weight, target_bodyfat, created_at) AS (
			SELECT cg.client_id, cgt.goal, cg.target_weight, cg.target_bodyfat, created_at
			FROM ClientGoal cg
			JOIN ClientGoalType cgt ON cgt.id = cg.goal_id
			WHERE cg.client_id = ?
				AND CAST(created_at AS DATE) <= CAST(? AS DATE)
			ORDER BY created_at DESC
			LIMIT 1
		)
		SELECT
			c.id AS clientId,
			ct.first_name,
			ct.last_name,
			ct.phone,
			ct.email,
			c.height,
			ct.img,
			cdl.logged_weight,
			cdl.body_fat,
			cdl.logged_calories,
			cdl.logged_protein,
			cdl.logged_carbs,
			cdl.logged_fat,
			cdl.target_calories,
			cdl.target_protein,
			cdl.target_carbs,
			cdl.target_fat,
			latestGoal.goal,
			latestGoal.target_weight AS goal_weight,
			latestGoal.target_bodyfat AS goal_bodyFat
		FROM ClientDailyLog cdl
		LEFT JOIN latestGoal ON latestGoal.client_id = cdl.client_id
		JOIN Client c ON c.id = cdl.client_id
		JOIN Contact ct ON ct.id = c.contactId
		WHERE CAST(cdl.created_at AS DATE) = CAST(? AS DATE)
			AND cdl.client_id = ?`,
		[p_client_id, p_date, p_date, p_client_id]
	);
export const getClientDietPlans = (p_trainerId: number | null) =>
	queryRows(
		prisma,
		`SELECT
			first_name,
			last_name,
			trainerId,
			planName,
			targetCalories,
			targetProtein,
			targetCarbs,
			targetFats,
			notes,
			dietPlanId,
			clientId
		 FROM ClientDietPlan
		 WHERE ? IS NULL OR trainerId = ?`,
		[p_trainerId, p_trainerId]
	);
export const getClientExercises = (p_client_id: number) =>
	queryRows(
		prisma,
		`SELECT
			p.id AS planId,
			wr.routine_day,
			wr.routine_name,
			wre.exercise_id,
			wre.number_reps,
			wre.number_sets,
			wre.weight,
			wre.duration,
			wre.distance,
			wre.rest_time,
			wre.pace,
			wre.rpe,
			wre.routine_stage,
			wre.stage_index
		 FROM Plan p
		 LEFT JOIN WorkoutProgram wp ON wp.plan_id = p.id
		 LEFT JOIN WorkoutRoutine wr ON wr.workout_program_id = wp.id
		 LEFT JOIN WorkoutRoutineExercise wre ON wre.routine_id = wr.id
		 WHERE p.client_id = ?`,
		[p_client_id]
	);
export const getClientWeeklySummary = (p_startDate: SqlDate, p_endDate: SqlDate, p_clientId: number) =>
	queryRows(
		prisma,
		`SELECT
			AVG(cdl.logged_weight) AS avg_weight,
			AVG(cdl.body_fat) AS avg_bodyfat,
			AVG(cdl.logged_calories) AS avg_calories,
			SUM(cdl.logged_carbs + cdl.logged_protein + cdl.logged_fat) AS total_macros,
			SUM(cdl.target_carbs + cdl.target_protein + cdl.target_fat) AS target_macros
		 FROM ClientDailyLog cdl
		 WHERE ? <= cdl.created_at
			AND ? >= cdl.created_at
			AND cdl.client_id = ?
		 UNION
		 SELECT
			AVG(cdl.logged_weight) AS avg_weight,
			AVG(cdl.body_fat) AS avg_bodyfat,
			AVG(cdl.logged_calories) AS avg_calories,
			SUM(cdl.logged_carbs + cdl.logged_protein + cdl.logged_fat) AS total_macros,
			SUM(cdl.target_carbs + cdl.target_protein + cdl.target_fat) AS target_macros
		 FROM ClientDailyLog cdl
		 WHERE DATE_SUB(?, INTERVAL 7 DAY) <= cdl.created_at
			AND DATE_SUB(?, INTERVAL 7 DAY) >= cdl.created_at
			AND cdl.client_id = ?`,
		[p_startDate, p_endDate, p_clientId, p_startDate, p_endDate, p_clientId]
	);
export const getClientsWithoutActiveTrainingPlan = (p_trainerId: number) =>
	queryRows(
		prisma,
		`SELECT
			cc.clientId,
			cc.first_name,
			cc.last_name,
			cc.email,
			cc.phone,
			cc.trainerId
		 FROM ClientContact cc
		 WHERE cc.trainerId = ?
			AND NOT EXISTS (
				SELECT 1 FROM Macrocycle mc WHERE mc.client_id = cc.clientId AND mc.is_active = TRUE
			)
			AND NOT EXISTS (
				SELECT 1 FROM Mesocycle ms WHERE ms.client_id = cc.clientId AND ms.is_active = TRUE
			)
			AND NOT EXISTS (
				SELECT 1 FROM Microcycle mi WHERE mi.client_id = cc.clientId AND mi.is_active = TRUE
			)`,
		[p_trainerId]
	);
export const getDietLogEntries = (
	p_log_entry_id: number | null,
	p_client_id: number | null,
	p_diet_plan_id: number | null,
	p_log_date: SqlDate | null,
	p_start_date: SqlDate | null,
	p_end_date: SqlDate | null
) =>
	queryRows(
		prisma,
		`SELECT id, dietPlanId, clientId, logDate, calories, protein, carbs, fats
		 FROM DietPlanLogEntry
		 WHERE (? IS NULL OR id = ?)
			AND (? IS NULL OR clientId = ?)
			AND (? IS NULL OR dietPlanId = ?)
			AND (? IS NULL OR logDate = ?)
			AND (? IS NULL OR logDate >= ?)
			AND (? IS NULL OR logDate <= ?)
		 ORDER BY logDate DESC`,
		[
			p_log_entry_id,
			p_log_entry_id,
			p_client_id,
			p_client_id,
			p_diet_plan_id,
			p_diet_plan_id,
			p_log_date,
			p_log_date,
			p_start_date,
			p_start_date,
			p_end_date,
			p_end_date,
		]
	);
export const getDietLogTodosByTrainer = (p_trainerId: number) =>
	queryRows(
		prisma,
		`SELECT
			cc.clientId,
			cc.first_name,
			cc.last_name,
			cc.email,
			cc.phone,
			cc.trainerId,
			ll.lastLogDate
		 FROM ClientContact cc
		 LEFT JOIN (
			SELECT dple.clientId, MAX(dple.logDate) AS lastLogDate
			FROM DietPlanLogEntry dple
			GROUP BY dple.clientId
		 ) ll ON ll.clientId = cc.clientId
		 WHERE cc.trainerId = ?
			AND EXISTS (
				SELECT 1 FROM DietPlan dp WHERE dp.clientId = cc.clientId AND dp.isActive = TRUE
			)
			AND NOT EXISTS (
				SELECT 1
				FROM DietPlanLogEntry dple
				JOIN DietPlan dp ON dp.id = dple.dietPlanId
				WHERE dp.clientId = cc.clientId
					AND dp.isActive = TRUE
					AND dple.logDate = CURDATE()
			)`,
		[p_trainerId]
	);
export const getDietPlan = (
	p_plan_id: number | null,
	p_client_id: number | null,
	p_trainer_id: number | null,
	p_is_active: boolean | null
) =>
	queryRows(
		prisma,
		`SELECT * FROM DietPlan
		 WHERE (? IS NULL OR id = ?)
			AND (? IS NULL OR clientId = ?)
			AND (? IS NULL OR trainerId = ?)
			AND (? IS NULL OR isActive = ?)`,
		[p_plan_id, p_plan_id, p_client_id, p_client_id, p_trainer_id, p_trainer_id, p_is_active, p_is_active]
	);
export const getMacrocycles = (p_client_id: number, p_active: boolean | null, p_date: SqlDate | null) =>
	queryRows(
		prisma,
		`SELECT id, cycle_name, client_id, cycle_start_date, cycle_end_date, is_active, notes
		 FROM Macrocycle
		 WHERE client_id = ?
			AND (? IS NULL OR is_active = ?)
			AND (? IS NULL OR (cycle_start_date <= ? AND cycle_end_date >= ?))`,
		[p_client_id, p_active, p_active, p_date, p_date, p_date]
	);
export const getMesocycles = (
	p_client_id: number,
	p_macrocycle_id: number | null,
	p_active: boolean | null,
	p_date: SqlDate | null
) =>
	queryRows(
		prisma,
		`SELECT
			id,
			client_id,
			cycle_name,
			macrocycle_id,
			cycle_start_date,
			cycle_end_date,
			opt_levels,
			cardio_levels,
			notes,
			is_active
		 FROM Mesocycle
		 WHERE client_id = ?
			AND (? IS NULL OR macrocycle_id = ?)
			AND (? IS NULL OR is_active = ?)
			AND (? IS NULL OR (cycle_start_date <= ? AND cycle_end_date >= ?))`,
		[p_client_id, p_macrocycle_id, p_macrocycle_id, p_active, p_active, p_date, p_date, p_date]
	);
export const getMicrocycleRoutines = (p_microcycleId: number) =>
	queryRows(prisma, 'SELECT * FROM WorkoutRoutineExercises WHERE microcycle_id = ? AND isActive = TRUE', [p_microcycleId]);
export const getMicrocycles = (
	p_cycle_id: number | null,
	p_client_id: number | null,
	p_mesocycle_id: number | null,
	p_active: boolean | null,
	p_date: SqlDate | null
) =>
	queryRows(
		prisma,
		`SELECT id, client_id, cycle_name, mesocycle_id, cycle_start_date, cycle_end_date, notes, is_active
		 FROM Microcycle
		 WHERE (? IS NULL OR id = ?)
			AND (? IS NULL OR client_id = ?)
			AND (? IS NULL OR mesocycle_id = ?)
			AND (? IS NULL OR is_active = ?)
			AND (? IS NULL OR (cycle_start_date <= ? AND cycle_end_date >= ?))`,
		[
			p_cycle_id,
			p_cycle_id,
			p_client_id,
			p_client_id,
			p_mesocycle_id,
			p_mesocycle_id,
			p_active,
			p_active,
			p_date,
			p_date,
			p_date,
		]
	);
