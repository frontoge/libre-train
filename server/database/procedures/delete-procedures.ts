import { prisma } from '../mysql-database';
import { execute, queryRows } from './procedure-utils';

export const deleteDietLogEntry = async (p_log_entry_id: number) => {
	await execute(prisma, 'DELETE FROM DietPlanLogEntry WHERE id = ?', [p_log_entry_id]);
};
export const deleteWorkoutRoutine = async (p_routine_id: number) =>
	prisma.$transaction(async (tx) => {
		const rows = await queryRows<{ microcycle_id: number; routine_index: number }>(
			tx,
			'SELECT microcycle_id, routine_index FROM WorkoutRoutine WHERE id = ?',
			[p_routine_id]
		);
		const routine = rows[0];
		if (!routine) return;

		await execute(tx, 'UPDATE WorkoutRoutine SET isActive = FALSE WHERE id = ?', [p_routine_id]);
		await execute(
			tx,
			`UPDATE WorkoutRoutine
			 SET routine_index = routine_index - 1
			 WHERE microcycle_id = ?
				AND routine_index > ?
				AND isActive = TRUE`,
			[routine.microcycle_id, routine.routine_index]
		);
	});
