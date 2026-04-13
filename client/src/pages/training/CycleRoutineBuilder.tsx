import { QuestionCircleOutlined } from '@ant-design/icons';
import type { Microcycle } from '@libre-train/shared';
import { Button, Popconfirm } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { RoutineEditor } from '../../components/Routines/RoutineEditor';
import { MicrocycleRoutinePicker } from '../../components/Training/MicrocycleRoutinePicker';
import { updateMicrocycleRoutines } from '../../helpers/api';
import { fetchMicrocycleRoutines } from '../../helpers/routine-helpers';
import { fetchMicrocycleById } from '../../helpers/training-helpers';
import { useMessage } from '../../hooks/useMessage';
import type { WorkoutRoutineEdit } from '../../types/types';

export function CycleRoutineBuilder() {
	const navigate = useNavigate();
	const { cycleId } = useParams<{ cycleId: string }>();
	const showMessage = useMessage();
	const [microcycle, setMicrocycle] = useState<Microcycle | undefined>(undefined);
	const [routines, setRoutines] = useState<WorkoutRoutineEdit[]>([]);
	const [selectedRoutine, setSelectedRoutine] = useState<number | undefined>(undefined);

	const handleSelectRoutine = (routineIndex: number) => {
		if (routineIndex === selectedRoutine) {
			setSelectedRoutine(undefined);
		} else {
			setSelectedRoutine(routineIndex);
		}
	};

	const handleNewRoutine = () => {
		const newRoutine: WorkoutRoutineEdit = {
			routine_name: `Routine ${routines.length + 1}`,
			microcycle_id: Number(cycleId),

			exercise_groups: [],
		};

		setRoutines((prev) => [...prev, newRoutine]);
		setSelectedRoutine(routines.length);
	};

	const handleReorderRoutine = (sourceIndex: number, targetIndex: number) => {
		setRoutines((prev) => {
			if (sourceIndex < 0 || sourceIndex >= prev.length || targetIndex < 0 || targetIndex > prev.length) {
				return prev;
			}

			const sourceRoutine = prev[sourceIndex];
			if (!sourceRoutine) {
				return prev;
			}

			const next = [...prev];
			next.splice(targetIndex, 0, { ...sourceRoutine });

			const originalSourceIndexAfterInsert = sourceIndex >= targetIndex ? sourceIndex + 1 : sourceIndex;
			next.splice(originalSourceIndexAfterInsert, 1);

			return next;
		});
	};

	const handleDeleteRoutine = (routineIndex: number) => {
		setRoutines((prev) => prev.filter((_, index) => index !== routineIndex));
		if (selectedRoutine === routineIndex) {
			setSelectedRoutine(undefined);
		} else if (selectedRoutine !== undefined && routineIndex < selectedRoutine) {
			setSelectedRoutine(selectedRoutine - 1);
		}
	};

	const fetchBuilderData = async () => {
		const results = await Promise.all([fetchMicrocycleById(Number(cycleId)), fetchMicrocycleRoutines(Number(cycleId))]);

		setMicrocycle(results[0]);
		setRoutines(results[1]);
	};

	const handleRoutineEdit = (updatedRoutine: WorkoutRoutineEdit) => {
		setRoutines((prev) => prev.map((routine, index) => (index === selectedRoutine ? updatedRoutine : routine)));
	};

	const handleSave = async () => {
		try {
			showMessage('loading', 'Saving routines...', 0);
			const result = await updateMicrocycleRoutines(Number(cycleId), routines);
			if (result.ok) {
				// Redirect to cycle browser?
				showMessage('destroy', '');
				navigate(`/training/`);
			} else {
				// Show error notification
				showMessage('destroy', '');
				showMessage('error', 'Failed to save routines');
			}
		} catch (error) {
			console.error('Error saving routines:', error);
			showMessage('error', 'An error occurred while saving routines');
		}
	};

	useEffect(() => {
		fetchBuilderData();
	}, [cycleId]);

	return (
		<PageLayout
			title={microcycle?.cycle_name ? `Microcycle: ${microcycle.cycle_name}` : 'Cycle Routine Builder'}
			contentStyle={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				margin: '2rem',
				gap: '2rem',
			}}
		>
			<Panel
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					gap: '1rem',
				}}
			>
				<MicrocycleRoutinePicker
					routines={routines}
					onSelectRoutine={handleSelectRoutine}
					selectedRoutineIndex={selectedRoutine}
					onNewRoutine={handleNewRoutine}
					onReorder={handleReorderRoutine}
					onDeleteRoutine={handleDeleteRoutine}
					style={{ width: '85%', height: '10%' }}
				/>
				{selectedRoutine !== undefined ? (
					<RoutineEditor
						style={{ width: '100%', height: '80%' }}
						routine={routines[selectedRoutine]}
						onRoutineChange={handleRoutineEdit}
					/>
				) : (
					<div
						style={{
							height: '80%',
						}}
					></div>
				)}
				<div
					style={{
						display: 'flex',
						gap: '1rem',
						height: '10%',
						alignSelf: 'flex-end',
						marginRight: '2rem',
					}}
				>
					<Button type="primary" onClick={handleSave}>
						Save
					</Button>
					<Popconfirm
						title="Are you sure you want to cancel (All unsaved changes will be lost)?"
						onConfirm={() => {}}
						okText="Yes"
						cancelText="No"
						placement="topRight"
						icon={<QuestionCircleOutlined style={{ color: 'red' }} />}
					>
						<Button>Cancel</Button>
					</Popconfirm>
				</div>
			</Panel>
		</PageLayout>
	);
}
