import { prisma } from '../mysql-database';
import { asDate, execute, getLastInsertId, queryRows, SqlDate } from './procedure-utils';

export const createAssessmentClientLog = async (
	p_client_id: number,
	p_assessment_type_id: number,
	p_assessment_value: string,
	p_assessment_date: SqlDate,
	p_notes: string | null
) => {
	await execute(
		prisma,
		`INSERT INTO AssessmentClientLog (clientId, assessmentTypeId, assessmentValue, assessmentDate, notes)
		 VALUES (?, ?, ?, IFNULL(?, CURDATE()), ?)`,
		[p_client_id, p_assessment_type_id, p_assessment_value, p_assessment_date, p_notes]
	);
};
export const createClient = async (p_client_id: number, p_trainer_id: number, p_height: number, p_notes: string | null) =>
	prisma.$transaction(async (tx) => {
		await execute(
			tx,
			'INSERT INTO Client (contactId, trainerId, height, isActive, notes) VALUES (?, ?, ?, 1, ?)',
			[p_client_id, p_trainer_id, p_height, p_notes]
		);
		return [{ id: await getLastInsertId(tx) }];
	});
export const createClientDailyLog = async (
	p_client_id: number,
	p_date: SqlDate,
	p_logged_weight: number,
	p_body_fat: number,
	p_logged_calories: number,
	p_target_calories: number,
	p_logged_protein: number,
	p_target_protein: number,
	p_logged_carbs: number,
	p_target_carbs: number,
	p_logged_fat: number,
	p_target_fat: number
) =>
	prisma.$transaction(async (tx) => {
		await execute(
			tx,
			`INSERT INTO ClientDailyLog (
				client_id, logged_weight, body_fat, logged_calories, target_calories,
				logged_protein, target_protein, logged_carbs, target_carbs, logged_fat, target_fat, created_at
			 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			 ON DUPLICATE KEY UPDATE
				logged_weight = ?,
				body_fat = ?,
				logged_calories = ?,
				target_calories = ?,
				logged_protein = ?,
				target_protein = ?,
				logged_carbs = ?,
				target_carbs = ?,
				logged_fat = ?,
				target_fat = ?,
				created_at = ?`,
			[
				p_client_id,
				p_logged_weight,
				p_body_fat,
				p_logged_calories,
				p_target_calories,
				p_logged_protein,
				p_target_protein,
				p_logged_carbs,
				p_target_carbs,
				p_logged_fat,
				p_target_fat,
				p_date,
				p_logged_weight,
				p_body_fat,
				p_logged_calories,
				p_target_calories,
				p_logged_protein,
				p_target_protein,
				p_logged_carbs,
				p_target_carbs,
				p_logged_fat,
				p_target_fat,
				p_date,
			]
		);

		return queryRows<{ id: number }>(
			tx,
			'SELECT id FROM ClientDailyLog WHERE client_id = ? AND DATE(created_at) = ? LIMIT 1',
			[p_client_id, p_date]
		);
	});
export const createClientGoal = async (
	p_client_id: number,
	p_goal_type: number,
	p_target_weight: number,
	p_target_bodyfat: number,
	p_date: SqlDate
) => {
	await execute(
		prisma,
		`INSERT INTO ClientGoal (client_id, goal_id, target_weight, target_bodyfat, created_at)
		 VALUES (?, ?, ?, ?, IFNULL(?, CONVERT_TZ(NOW(), @@session.time_zone, 'America/New_York')))`,
		[p_client_id, p_goal_type, p_target_weight, p_target_bodyfat, p_date]
	);
};
export const createContact = async (
	p_first_name: string,
	p_last_name: string,
	p_email: string,
	p_phone: string,
	p_dob: SqlDate,
	p_img: string | null
) =>
	prisma.$transaction(async (tx) => {
		await execute(
			tx,
			'INSERT INTO Contact (first_name, last_name, email, phone, date_of_birth, img) VALUES (?, ?, ?, ?, ?, ?)',
			[p_first_name, p_last_name, p_email, p_phone, p_dob, p_img]
		);
		return [{ id: await getLastInsertId(tx) }];
	});
export const createDietLogEntry = async (
	p_client_id: number,
	p_date: SqlDate,
	p_calories: number,
	p_protein: number,
	p_carbs: number,
	p_fats: number
) =>
	prisma.$transaction(async (tx) => {
		await execute(
			tx,
			`INSERT INTO DietPlanLogEntry (dietPlanId, clientId, logDate, calories, protein, carbs, fats)
			 VALUES ((SELECT id FROM DietPlan WHERE clientId = ? AND isActive = TRUE LIMIT 1), ?, COALESCE(?, CURRENT_DATE), ?, ?, ?, ?)`,
			[p_client_id, p_client_id, p_date, p_calories, p_protein, p_carbs, p_fats]
		);
		return [{ newLogEntryId: await getLastInsertId(tx) }];
	});
export const createDietPlan = async (
	p_client_id: number,
	p_trainer_id: number,
	p_plan_name: string,
	p_target_calories: number,
	p_target_protein: number,
	p_target_carbs: number,
	p_target_fats: number,
	p_notes: string | null
) =>
	prisma.$transaction(async (tx) => {
		await execute(tx, 'UPDATE DietPlan SET isActive = FALSE WHERE clientId = ? AND isActive = TRUE', [p_client_id]);
		await execute(
			tx,
			`INSERT INTO DietPlan (clientId, trainerId, planName, targetCalories, targetProtein, targetCarbs, targetFats, notes)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
			[p_client_id, p_trainer_id, p_plan_name, p_target_calories, p_target_protein, p_target_carbs, p_target_fats, p_notes]
		);
		return [{ new_plan_id: await getLastInsertId(tx) }];
	});
export const createExercise = async (
	p_exercise_name: string,
	p_muscle_groups: string,
	p_description: string | null,
	p_video_link: string | null,
	p_equipment: string | null,
	p_exercise_form: number | null,
	p_movement_pattern: number | null,
	p_progression_level: number | null
) => {
	await execute(
		prisma,
		`INSERT INTO Exercise (
			exercise_name,
			muscle_groups,
			exercise_description,
			video_link,
			equipment,
			exercise_form,
			movement_pattern,
			progression_level
		 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			p_exercise_name,
			p_muscle_groups,
			p_description,
			p_video_link,
			p_equipment,
			p_exercise_form,
			p_movement_pattern,
			p_progression_level,
		]
	);
};
export const createMacrocycle = async (
	p_client_id: number,
	p_cycle_name: string,
	p_cycle_start_date: SqlDate,
	p_cycle_end_date: SqlDate,
	p_isActive: boolean,
	p_notes: string | null
) => {
	const startDate = asDate(p_cycle_start_date);
	const endDate = asDate(p_cycle_end_date);
	if (startDate && endDate && startDate > endDate) {
		throw new Error('Start date must be before end date');
	}

	return prisma.$transaction(async (tx) => {
		if (p_isActive) {
			await execute(
				tx,
				`UPDATE Macrocycle
				 SET is_active = FALSE
				 WHERE client_id = ?
					AND is_active = TRUE
					AND cycle_end_date >= ?
					AND ? >= cycle_start_date`,
				[p_client_id, p_cycle_start_date, p_cycle_end_date]
			);
		}

		await execute(
			tx,
			`INSERT INTO Macrocycle (client_id, cycle_name, cycle_start_date, cycle_end_date, is_active, notes)
			 VALUES (?, ?, ?, ?, ?, ?)`,
			[p_client_id, p_cycle_name, p_cycle_start_date, p_cycle_end_date, p_isActive, p_notes]
		);

		return [{ macrocycle_id: await getLastInsertId(tx) }];
	});
};
export const createMesocycle = async (
	p_macrocycle_id: number,
	p_name: string,
	p_start_date: SqlDate,
	p_end_date: SqlDate,
	p_opt_levels: string | null,
	p_cardio_levels: string | null,
	p_notes: string | null,
	p_is_active: boolean | null
) =>
	prisma.$transaction(async (tx) => {
		const parentRows = await queryRows<{ client_id: number; cycle_start_date: string; cycle_end_date: string }>(
			tx,
			'SELECT client_id, cycle_start_date, cycle_end_date FROM Macrocycle WHERE id = ?',
			[p_macrocycle_id]
		);
		const macro = parentRows[0];
		if (!macro) throw new Error('Macrocycle not found');

		const macroStart = asDate(macro.cycle_start_date);
		const macroEnd = asDate(macro.cycle_end_date);
		const startDate = asDate(p_start_date);
		const endDate = asDate(p_end_date);

		if (startDate && endDate && startDate > endDate) throw new Error('Start date must be before end date');
		if ((macroStart && startDate && startDate < macroStart) || (macroEnd && endDate && endDate > macroEnd)) {
			throw new Error('Mesocycle dates must be within macrocycle dates');
		}

		if (p_is_active || p_is_active === null) {
			await execute(
				tx,
				`UPDATE Mesocycle
				 SET is_active = FALSE
				 WHERE macrocycle_id = ?
					AND is_active = TRUE
					AND cycle_start_date <= ?
					AND cycle_end_date >= ?`,
				[p_macrocycle_id, p_end_date, p_start_date]
			);
		}

		await execute(
			tx,
			`INSERT INTO Mesocycle (
				client_id, cycle_name, macrocycle_id, cycle_start_date, cycle_end_date,
				opt_levels, cardio_levels, notes, is_active
			 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[macro.client_id, p_name, p_macrocycle_id, p_start_date, p_end_date, p_opt_levels, p_cardio_levels, p_notes, p_is_active]
		);

		return [{ mesocycle_id: await getLastInsertId(tx) }];
	});
export const createMicrocycle = async (
	p_mesocycle_id: number,
	p_name: string,
	p_start_date: SqlDate,
	p_end_date: SqlDate,
	p_notes: string | null,
	p_is_active: boolean | null
) =>
	prisma.$transaction(async (tx) => {
		const parentRows = await queryRows<{ client_id: number; cycle_start_date: string; cycle_end_date: string }>(
			tx,
			'SELECT client_id, cycle_start_date, cycle_end_date FROM Mesocycle WHERE id = ?',
			[p_mesocycle_id]
		);
		const meso = parentRows[0];
		if (!meso) throw new Error('Mesocycle not found');

		const mesoStart = asDate(meso.cycle_start_date);
		const mesoEnd = asDate(meso.cycle_end_date);
		const startDate = asDate(p_start_date);
		const endDate = asDate(p_end_date);

		if (startDate && endDate && startDate > endDate) throw new Error('Start date must be before end date');
		if ((mesoStart && startDate && startDate < mesoStart) || (mesoEnd && endDate && endDate > mesoEnd)) {
			throw new Error('Microcycle dates must be within mesocycle dates');
		}

		if (p_is_active || p_is_active === null) {
			await execute(
				tx,
				`UPDATE Microcycle
				 SET is_active = FALSE
				 WHERE mesocycle_id = ?
					AND is_active = TRUE
					AND cycle_start_date <= ?
					AND cycle_end_date >= ?`,
				[p_mesocycle_id, p_end_date, p_start_date]
			);
		}

		await execute(
			tx,
			`INSERT INTO Microcycle (mesocycle_id, client_id, cycle_name, cycle_start_date, cycle_end_date, notes, is_active)
			 VALUES (?, ?, ?, ?, ?, ?, ?)`,
			[p_mesocycle_id, meso.client_id, p_name, p_start_date, p_end_date, p_notes, p_is_active]
		);

		return [{ microcycle_id: await getLastInsertId(tx) }];
	});
export const createPlannedExercise = async (
	p_exercise_id: number,
	p_exercise_group_id: number,
	p_exercise_group_index: number,
	p_repetitions: number | null,
	p_exercise_sets: number | null,
	p_exercise_weight: number | null,
	p_exercise_duration: number | null,
	p_exercise_distance: number | null,
	p_target_heart_rate: number | null,
	p_pace: string | null,
	p_rpe: number | null,
	p_target_calories: number | null,
	p_target_mets: number | null
) =>
	prisma.$transaction(async (tx) => {
		await execute(
			tx,
			`INSERT INTO PlannedExercise (
				exercise_id, exercise_group_id, exercise_group_index, repetitions, exercise_sets,
				exercise_weight, exercise_duration, exercise_distance, target_heart_rate,
				pace, rpe, target_calories, target_mets
			 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				p_exercise_id,
				p_exercise_group_id,
				p_exercise_group_index,
				p_repetitions,
				p_exercise_sets,
				p_exercise_weight,
				p_exercise_duration,
				p_exercise_distance,
				p_target_heart_rate,
				p_pace,
				p_rpe,
				p_target_calories,
				p_target_mets,
			]
		);
		const insertedId = await getLastInsertId(tx);
		await execute(
			tx,
			`UPDATE PlannedExercise
			 SET exercise_group_index = exercise_group_index + 1
			 WHERE exercise_group_id = ?
				AND exercise_group_index >= ?
				AND id != ?`,
			[p_exercise_group_id, p_exercise_group_index, insertedId]
		);
		return [{ planned_exercise_id: insertedId }];
	});
export const createPlannedExerciseGroup = async (
	p_workout_routine_id: number,
	p_group_index: number,
	p_rest_between: number | null,
	p_rest_after: number | null,
	p_routine_category: number | null
) =>
	prisma.$transaction(async (tx) => {
		await execute(
			tx,
			`INSERT INTO PlannedExerciseGroup (workout_routine_id, group_index, rest_between, rest_after, routine_category)
			 VALUES (?, ?, ?, ?, ?)`,
			[p_workout_routine_id, p_group_index, p_rest_between, p_rest_after, p_routine_category]
		);
		const insertedId = await getLastInsertId(tx);
		await execute(
			tx,
			`UPDATE PlannedExerciseGroup
			 SET group_index = group_index + 1
			 WHERE workout_routine_id = ?
				AND group_index >= ?
				AND id != ?`,
			[p_workout_routine_id, p_group_index, insertedId]
		);
		return [{ planned_exercise_group_id: insertedId }];
	});
export const createUser = async (p_username: string, p_password: string) =>
	prisma.$transaction(async (tx) => {
		await execute(tx, 'INSERT INTO User (username, pass) VALUES (?, ?)', [p_username, p_password]);
		return [{ id: await getLastInsertId(tx) }];
	});
export const createWorkoutRoutine = async (
	p_microcycle_id: number,
	p_routine_index: number,
	p_routine_name: string,
	p_isActive: boolean
) =>
	prisma.$transaction(async (tx) => {
		await execute(
			tx,
			'INSERT INTO WorkoutRoutine (microcycle_id, routine_index, routine_name, isActive) VALUES (?, ?, ?, ?)',
			[p_microcycle_id, p_routine_index, p_routine_name, p_isActive]
		);
		const insertedId = await getLastInsertId(tx);
		if (p_isActive) {
			const exists = await queryRows<{ has_match: number }>(
				tx,
				`SELECT CASE WHEN EXISTS (
					SELECT 1 FROM WorkoutRoutine
					WHERE microcycle_id = ?
						AND routine_index = ?
						AND id != ?
				) THEN 1 ELSE 0 END AS has_match`,
				[p_microcycle_id, p_routine_index, insertedId]
			);
			if (exists[0]?.has_match === 1) {
				await execute(
					tx,
					`UPDATE WorkoutRoutine
					 SET routine_index = routine_index + 1
					 WHERE microcycle_id = ?
						AND routine_index >= ?
						AND id != ?
						AND isActive = TRUE`,
					[p_microcycle_id, p_routine_index, insertedId]
				);
			}
		}
		return [{ workout_routine_id: insertedId }];
	});
