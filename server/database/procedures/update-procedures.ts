import { prisma } from '../mysql-database';
import { asDate, execute, queryRows, SqlDate } from './procedure-utils';

export const updateAssessmentClientLog = async (
	p_id: number,
	p_clientId: number | null,
	p_assessmentTypeId: number | null,
	p_assessmentValue: string | null,
	p_assessmentDate: SqlDate | null,
	p_notes: string | null
) => {
	await execute(
		prisma,
		`UPDATE AssessmentClientLog
		 SET
			clientId = COALESCE(?, clientId),
			assessmentTypeId = COALESCE(?, assessmentTypeId),
			assessmentValue = COALESCE(?, assessmentValue),
			assessmentDate = COALESCE(?, assessmentDate),
			notes = COALESCE(?, notes)
		 WHERE id = ?`,
		[p_clientId, p_assessmentTypeId, p_assessmentValue, p_assessmentDate, p_notes, p_id]
	);
};
export const updateClient = async (p_id: number, p_height: number | null, p_notes: string | null, p_trainer_id: number | null) => {
	await execute(
		prisma,
		`UPDATE Client
		 SET
			height = COALESCE(?, height),
			notes = COALESCE(?, notes),
			trainerId = COALESCE(?, trainerId)
		 WHERE id = ?`,
		[p_height, p_notes, p_trainer_id, p_id]
	);
};
export const updateContact = async (
	p_id: number,
	p_first_name: string | null,
	p_last_name: string | null,
	p_email: string | null,
	p_phone: string | null,
	p_date_of_birth: SqlDate | null,
	p_img: string | null
) => {
	await execute(
		prisma,
		`UPDATE Contact
		 SET
			first_name = COALESCE(?, first_name),
			last_name = COALESCE(?, last_name),
			email = COALESCE(?, email),
			phone = COALESCE(?, phone),
			date_of_birth = COALESCE(?, date_of_birth),
			img = COALESCE(?, img)
		 WHERE id = ?`,
		[p_first_name, p_last_name, p_email, p_phone, p_date_of_birth, p_img, p_id]
	);
};
export const updateDietLogEntry = async (
	p_log_entry_id: number,
	p_calories: number | null,
	p_protein: number | null,
	p_carbs: number | null,
	p_fats: number | null
) => {
	await execute(
		prisma,
		`UPDATE DietPlanLogEntry
		 SET
			calories = COALESCE(?, calories),
			protein = COALESCE(?, protein),
			carbs = COALESCE(?, carbs),
			fats = COALESCE(?, fats)
		 WHERE id = ?`,
		[p_calories, p_protein, p_carbs, p_fats, p_log_entry_id]
	);
};
export const updateDietPlan = async (
	p_plan_id: number,
	p_plan_name: string | null,
	p_target_calories: number | null,
	p_target_protein: number | null,
	p_target_carbs: number | null,
	p_target_fats: number | null,
	p_is_active: boolean | null,
	p_notes: string | null
) =>
	prisma.$transaction(async (tx) => {
		const affected = await execute(
			tx,
			`UPDATE DietPlan
			 SET
				planName = COALESCE(?, planName),
				targetCalories = COALESCE(?, targetCalories),
				targetProtein = COALESCE(?, targetProtein),
				targetCarbs = COALESCE(?, targetCarbs),
				targetFats = COALESCE(?, targetFats),
				isActive = COALESCE(?, isActive),
				notes = COALESCE(?, notes)
			 WHERE id = ?`,
			[p_plan_name, p_target_calories, p_target_protein, p_target_carbs, p_target_fats, p_is_active, p_notes, p_plan_id]
		);

		if (affected === 0) {
			throw new Error('Diet plan not found');
		}

		if (p_is_active) {
			await execute(
				tx,
				`UPDATE DietPlan
				 SET isActive = FALSE
				 WHERE id != ?
					AND clientId = (SELECT clientId FROM DietPlan WHERE id = ?)`,
				[p_plan_id, p_plan_id]
			);
		}
	});
export const updateExercise = async (
	p_exercise_id: number,
	p_exercise_name: string | null,
	p_muscle_groups: string | null,
	p_exercise_description: string | null,
	p_video_link: string | null,
	p_equipment: string | null,
	p_exercise_form: number | null,
	p_movement_pattern: number | null,
	p_progression_level: number | null
) => {
	await execute(
		prisma,
		`UPDATE Exercise
		 SET
			exercise_name = COALESCE(?, exercise_name),
			muscle_groups = COALESCE(?, muscle_groups),
			exercise_description = COALESCE(?, exercise_description),
			video_link = COALESCE(?, video_link),
			equipment = COALESCE(?, equipment),
			exercise_form = COALESCE(?, exercise_form),
			movement_pattern = COALESCE(?, movement_pattern),
			progression_level = COALESCE(?, progression_level)
		 WHERE id = ?`,
		[
			p_exercise_name,
			p_muscle_groups,
			p_exercise_description,
			p_video_link,
			p_equipment,
			p_exercise_form,
			p_movement_pattern,
			p_progression_level,
			p_exercise_id,
		]
	);
};
export const updateMacrocycle = async (
	p_id: number,
	p_cycle_name: string | null,
	p_cycle_start_date: SqlDate | null,
	p_cycle_end_date: SqlDate | null,
	p_isActive: boolean | null,
	p_notes: string | null
) =>
	prisma.$transaction(async (tx) => {
		const rows = await queryRows<{ cycle_start_date: string; cycle_end_date: string }>(
			tx,
			'SELECT cycle_start_date, cycle_end_date FROM Macrocycle WHERE id = ?',
			[p_id]
		);
		const current = rows[0];
		if (!current) return;

		const currentStart = asDate(current.cycle_start_date);
		const currentEnd = asDate(current.cycle_end_date);
		const nextStart = asDate(p_cycle_start_date);
		const nextEnd = asDate(p_cycle_end_date);

		if (
			(nextStart && nextEnd && nextStart > nextEnd) ||
			(nextStart && !nextEnd && currentEnd && nextStart > currentEnd) ||
			(nextEnd && !nextStart && currentStart && nextEnd < currentStart)
		) {
			throw new Error('Start must be before end date');
		}

		await execute(
			tx,
			`UPDATE Macrocycle
			 SET
				cycle_name = COALESCE(?, cycle_name),
				cycle_start_date = COALESCE(?, cycle_start_date),
				cycle_end_date = COALESCE(?, cycle_end_date),
				is_active = COALESCE(?, is_active),
				notes = COALESCE(?, notes)
			 WHERE id = ?`,
			[p_cycle_name, p_cycle_start_date, p_cycle_end_date, p_isActive, p_notes, p_id]
		);

		await execute(
			tx,
			`UPDATE Macrocycle mc
			 INNER JOIN (
				SELECT client_id, cycle_start_date, cycle_end_date
				FROM Macrocycle
				WHERE id = ?
					AND is_active = TRUE
			 ) AS updatedRecord ON mc.client_id = updatedRecord.client_id
			 SET mc.is_active = FALSE
			 WHERE mc.is_active = TRUE
				AND mc.id != ?
				AND mc.cycle_end_date >= updatedRecord.cycle_start_date
				AND updatedRecord.cycle_end_date >= mc.cycle_start_date`,
			[p_id, p_id]
		);
	});
export const updateMesocycle = async (
	p_mesocycle_id: number,
	p_name: string | null,
	p_start_date: SqlDate | null,
	p_end_date: SqlDate | null,
	p_opt_levels: string | null,
	p_cardio_levels: string | null,
	p_notes: string | null,
	p_is_active: boolean | null
) =>
	prisma.$transaction(async (tx) => {
		const rows = await queryRows<{
			macro_start: string;
			macro_end: string;
			to_update_start: string;
			to_update_end: string;
		}>(
			tx,
			`SELECT
				m.cycle_start_date AS macro_start,
				m.cycle_end_date AS macro_end,
				ms.cycle_start_date AS to_update_start,
				ms.cycle_end_date AS to_update_end
			 FROM Macrocycle m
			 INNER JOIN Mesocycle ms ON m.id = ms.macrocycle_id
			 WHERE ms.id = ?`,
			[p_mesocycle_id]
		);
		const current = rows[0];
		if (!current) return;

		const macroStart = asDate(current.macro_start);
		const macroEnd = asDate(current.macro_end);
		const updateStart = asDate(current.to_update_start);
		const updateEnd = asDate(current.to_update_end);
		const nextStart = asDate(p_start_date);
		const nextEnd = asDate(p_end_date);

		if ((nextStart && macroStart && nextStart < macroStart) || (nextEnd && macroEnd && nextEnd > macroEnd)) {
			throw new Error('Mesocycle dates must be within macrocycle dates');
		}
		if (
			(nextStart && nextEnd && nextStart > nextEnd) ||
			(nextStart && !nextEnd && updateEnd && nextStart > updateEnd) ||
			(nextEnd && !nextStart && updateStart && nextEnd < updateStart)
		) {
			throw new Error('Start must be before end date');
		}

		await execute(
			tx,
			`UPDATE Mesocycle
			 SET
				cycle_name = COALESCE(?, cycle_name),
				cycle_start_date = COALESCE(?, cycle_start_date),
				cycle_end_date = COALESCE(?, cycle_end_date),
				opt_levels = COALESCE(?, opt_levels),
				cardio_levels = COALESCE(?, cardio_levels),
				notes = COALESCE(?, notes),
				is_active = COALESCE(?, is_active)
			 WHERE id = ?`,
			[p_name, p_start_date, p_end_date, p_opt_levels, p_cardio_levels, p_notes, p_is_active, p_mesocycle_id]
		);

		await execute(
			tx,
			`UPDATE Mesocycle ms
			 INNER JOIN (
				SELECT macrocycle_id, cycle_start_date, cycle_end_date
				FROM Mesocycle
				WHERE id = ?
					AND is_active = TRUE
			 ) AS updatedRecord ON ms.macrocycle_id = updatedRecord.macrocycle_id
			 SET ms.is_active = FALSE
			 WHERE ms.is_active = TRUE
				AND ms.id != ?
				AND ms.cycle_end_date >= updatedRecord.cycle_start_date
				AND updatedRecord.cycle_end_date >= ms.cycle_start_date`,
			[p_mesocycle_id, p_mesocycle_id]
		);
	});
export const updateMicrocycle = async (
	p_microcycle_id: number,
	p_name: string | null,
	p_start_date: SqlDate | null,
	p_end_date: SqlDate | null,
	p_notes: string | null,
	p_is_active: boolean | null
) =>
	prisma.$transaction(async (tx) => {
		const rows = await queryRows<{
			meso_start: string;
			meso_end: string;
			to_update_start: string;
			to_update_end: string;
		}>(
			tx,
			`SELECT
				m.cycle_start_date AS meso_start,
				m.cycle_end_date AS meso_end,
				mi.cycle_start_date AS to_update_start,
				mi.cycle_end_date AS to_update_end
			 FROM Mesocycle m
			 INNER JOIN Microcycle mi ON m.id = mi.mesocycle_id
			 WHERE mi.id = ?`,
			[p_microcycle_id]
		);
		const current = rows[0];
		if (!current) return;

		const mesoStart = asDate(current.meso_start);
		const mesoEnd = asDate(current.meso_end);
		const updateStart = asDate(current.to_update_start);
		const updateEnd = asDate(current.to_update_end);
		const nextStart = asDate(p_start_date);
		const nextEnd = asDate(p_end_date);

		if ((nextStart && mesoStart && nextStart < mesoStart) || (nextEnd && mesoEnd && nextEnd > mesoEnd)) {
			throw new Error('Microcycle dates must be within mesocycle dates');
		}
		if (
			(nextStart && nextEnd && nextStart > nextEnd) ||
			(nextStart && !nextEnd && updateEnd && nextStart > updateEnd) ||
			(nextEnd && !nextStart && updateStart && nextEnd < updateStart)
		) {
			throw new Error('Start must be before end date');
		}

		await execute(
			tx,
			`UPDATE Microcycle
			 SET
				cycle_name = COALESCE(?, cycle_name),
				cycle_start_date = COALESCE(?, cycle_start_date),
				cycle_end_date = COALESCE(?, cycle_end_date),
				notes = COALESCE(?, notes),
				is_active = COALESCE(?, is_active)
			 WHERE id = ?`,
			[p_name, p_start_date, p_end_date, p_notes, p_is_active, p_microcycle_id]
		);

		await execute(
			tx,
			`UPDATE Microcycle mi
			 INNER JOIN (
				SELECT mesocycle_id, cycle_start_date, cycle_end_date
				FROM Microcycle
				WHERE id = ?
					AND is_active = TRUE
			 ) AS updatedRecord ON mi.mesocycle_id = updatedRecord.mesocycle_id
			 SET mi.is_active = FALSE
			 WHERE mi.is_active = TRUE
				AND mi.id != ?
				AND mi.cycle_end_date >= updatedRecord.cycle_start_date
				AND updatedRecord.cycle_end_date >= mi.cycle_start_date`,
			[p_microcycle_id, p_microcycle_id]
		);
	});
