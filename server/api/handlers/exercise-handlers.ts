import { Exercise, ResponseWithError } from '@libre-train/shared';
import { Request, Response } from 'express';
import dayjs from '../../config/dayjs';
import { prisma } from '../../database/mysql-database';

export const handleExerciseCreate = async (req: Request<{}, {}, Omit<Exercise, 'id'>>, res: Response) => {
	try {
		const {
			exercise_name,
			muscle_groups,
			exercise_description,
			video_link,
			equipment,
			exercise_form,
			movement_pattern,
			progression_level,
		} = req.body;

		await prisma.exercise.create({
			data: {
				exercise_name,
				muscle_groups: muscle_groups ? muscle_groups.join(',') : null,
				exercise_description: exercise_description ?? null,
				video_link: video_link ?? null,
				equipment: equipment ?? null,
				exercise_form,
				movement_pattern: movement_pattern ?? null,
				progression_level: progression_level ?? null,
			},
		});

		res.status(201).json({ message: 'Exercise created successfully' });
	} catch (error) {
		console.error('Error creating exercise:', error);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export const handleGetAllExercises = async (req: Request, res: Response<ResponseWithError<Exercise[]>>) => {
	try {
		const results = await prisma.exercise.findMany();

		const formattedResults: Exercise[] = results.map((row) => ({
			id: row.id,
			exercise_name: row.exercise_name,
			muscle_groups: (row.muscle_groups ?? '')
				.split(',')
				.filter((mg) => mg.length > 0)
				.map((mg) => parseInt(mg, 10)),
			video_link: row.video_link ?? undefined,
			exercise_description: row.exercise_description ?? undefined,
			equipment: row.equipment ?? undefined,
			exercise_form: row.exercise_form ?? undefined,
			movement_pattern: row.movement_pattern ?? undefined,
			progression_level: row.progression_level,
			created_at: dayjs.utc(row.created_at).format('YYYY-MM-DD'),
			updated_at: dayjs.utc(row.updated_at).format('YYYY-MM-DD'),
		}));
		res.status(200).json(formattedResults);
	} catch (error) {
		console.error('Error fetching exercises:', error);
		res.status(500).json({ hasError: true, errorMessage: 'Internal server error' });
	}
};

export const handleDeleteExercise = async (req: Request<{ id: string }>, res: Response) => {
	const { id } = req.params;

	if (!id) {
		return res.status(400).json({ message: 'Exercise ID is required' });
	}

	try {
		await prisma.exercise.delete({ where: { id: parseInt(id, 10) } });

		res.status(204).send();
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error deleting exercise:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error deleting exercise:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};

export const handleUpdateExercise = async (req: Request<{ id: string }, {}, Omit<Partial<Exercise>, 'id'>>, res: Response) => {
	try {
		const { id } = req.params;
		const parsedId = parseInt(id, 10);
		const {
			exercise_name,
			muscle_groups,
			exercise_description,
			video_link,
			equipment,
			exercise_form,
			movement_pattern,
			progression_level,
		} = req.body;

		if (!id) {
			return res.status(400).json({ message: 'Exercise ID is required' });
		}

		await prisma.exercise.update({
			where: { id: parsedId },
			data: {
				exercise_name: exercise_name ?? undefined,
				muscle_groups: muscle_groups ? muscle_groups.join(',') : undefined,
				exercise_description: exercise_description ?? undefined,
				video_link: video_link ?? undefined,
				equipment: equipment ?? undefined,
				exercise_form: exercise_form ?? undefined,
				movement_pattern: movement_pattern ?? undefined,
				progression_level: progression_level ?? undefined,
			},
		});

		res.status(204).send();
	} catch (error) {
		if (error instanceof Error) {
			console.error('Error updating exercise:', error.message);
			res.status(500).json({ message: error.message });
			return;
		}
		console.error('Unexpected error updating exercise:', error);
		res.status(500).json({ message: 'An unexpected error occurred.' });
	}
};
