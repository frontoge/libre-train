import type { Microcycle, WorkoutRoutine } from '@libre-train/shared';
import { Card, Empty, Result, Skeleton, theme, Typography } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { WorkoutRoutineDisplay } from '../../components/Routines/WorkoutRoutineDisplay';
import dayjs from '../../config/dayjs';
import { fetchMicrocycleRoutines } from '../../helpers/routine-helpers';
import { fetchMicrocycleById } from '../../helpers/training-helpers';
import './client-cycle-routine-view.css';
import { AppContext } from '../../app-context';

export function ClientCycleRoutineView() {
	const { microcycleId } = useParams<{ microcycleId: string }>();
	const { stateRefreshers } = useContext(AppContext);
	const { token } = theme.useToken();
	const [isLoading, setIsLoading] = useState(true);
	const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
	const [microcycle, setMicrocycle] = useState<Microcycle | undefined>(undefined);
	const [routines, setRoutines] = useState<WorkoutRoutine[]>([]);
	const [selectedRoutineIndex, setSelectedRoutineIndex] = useState<number>(0);
	const dayPickerRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		const parsedId = Number(microcycleId);
		if (!microcycleId || Number.isNaN(parsedId) || parsedId <= 0) {
			setErrorMessage('Invalid microcycle ID.');
			setMicrocycle(undefined);
			setRoutines([]);
			setIsLoading(false);
			return;
		}

		const fetchData = async () => {
			setIsLoading(true);
			setErrorMessage(undefined);
			stateRefreshers?.refreshExerciseData();

			const [fetchedMicrocycle, fetchedRoutines] = await Promise.all([
				fetchMicrocycleById(parsedId),
				fetchMicrocycleRoutines(parsedId),
			]);

			if (!fetchedMicrocycle) {
				setErrorMessage('Microcycle not found.');
				setMicrocycle(undefined);
				setRoutines([]);
				setSelectedRoutineIndex(0);
				setIsLoading(false);
				return;
			}

			setMicrocycle(fetchedMicrocycle);
			setRoutines(fetchedRoutines);
			setSelectedRoutineIndex(0);
			setIsLoading(false);
		};

		fetchData();
	}, [microcycleId]);

	const selectedRoutine = routines[selectedRoutineIndex];

	const maxVisibleCards = 5;
	const cardWidth = `calc((100% - ${maxVisibleCards - 1}rem) / ${maxVisibleCards})`;

	const handleDayPickerWheel: React.WheelEventHandler<HTMLDivElement> = (event) => {
		const container = dayPickerRef.current;
		if (!container) return;

		const canScrollHorizontally = container.scrollWidth > container.clientWidth;
		if (canScrollHorizontally && Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
			event.preventDefault();
			container.scrollLeft += event.deltaY;
		}
	};

	return (
		<PageLayout
			title={microcycle?.cycle_name ? `Microcycle: ${microcycle.cycle_name}` : 'Microcycle Routines'}
			style={{
				height: '100%',
				width: '100%',
			}}
			contentStyle={{
				padding: '1rem',
				height: '100%',
				overflow: 'auto',
			}}
		>
			<div className="client-cycle-view-wrapper">
				<Panel className="client-cycle-meta-panel">
					<div className="client-cycle-meta-row">
						<Typography.Text type="secondary">Date Range</Typography.Text>
						<Typography.Text>
							{microcycle
								? `${dayjs(microcycle.cycle_start_date).format('YYYY-MM-DD')} to ${dayjs(microcycle.cycle_end_date).format('YYYY-MM-DD')}`
								: '-'}
						</Typography.Text>
					</div>
					{microcycle?.notes && (
						<div className="client-cycle-meta-row">
							<Typography.Text type="secondary">Notes</Typography.Text>
							<Typography.Paragraph className="client-cycle-notes">{microcycle.notes}</Typography.Paragraph>
						</div>
					)}
				</Panel>

				{isLoading ? (
					<Panel>
						<Skeleton active paragraph={{ rows: 8 }} />
					</Panel>
				) : errorMessage ? (
					<Result status="error" title="Unable to load routines" subTitle={errorMessage} />
				) : routines.length === 0 ? (
					<Panel>
						<Empty description="No workout routines are available for this microcycle." />
					</Panel>
				) : (
					<>
						<Panel>
							<Typography.Title level={5} style={{ marginTop: 0 }}>
								Workout Days
							</Typography.Title>
							<div
								ref={dayPickerRef}
								className="client-cycle-day-picker"
								onWheel={handleDayPickerWheel}
								style={
									{
										display: 'flex',
										gap: '1rem',
										overflowX: 'auto',
										scrollbarWidth: 'none',
										msOverflowStyle: 'none',
									} as React.CSSProperties
								}
							>
								{routines.map((routine, index) => (
									<Card
										key={index}
										hoverable
										onClick={() => setSelectedRoutineIndex(index)}
										style={{
											flex: `0 0 ${cardWidth}`,
											minWidth: '5.5rem',
											cursor: 'pointer',
											overflow: 'hidden',
											backgroundColor:
												selectedRoutineIndex === index
													? token.colorFillSecondary
													: token.colorBgContainer,
											borderColor:
												selectedRoutineIndex === index ? token.colorBorder : token.colorBorderSecondary,
											transition: 'background-color 0.2s ease, border-color 0.2s ease',
										}}
										styles={{
											body: {
												padding: '0.75rem',
												textAlign: 'center',
												display: 'flex',
												flexDirection: 'column',
												alignItems: 'center',
												justifyContent: 'center',
												gap: '0.25rem',
											},
										}}
									>
										<span style={{ fontSize: '0.75rem', lineHeight: '1rem', color: token.colorTextTertiary }}>
											Day {index + 1}
										</span>
										<span style={{ fontSize: '0.95rem', lineHeight: '1.2rem', fontWeight: 600 }}>
											{routine.routine_name}
										</span>
									</Card>
								))}
							</div>
						</Panel>

						{selectedRoutine && (
							<WorkoutRoutineDisplay
								routine={selectedRoutine}
								isEdit={false}
								treeProps={{ selectable: false }}
								style={{ minHeight: '24rem' }}
							/>
						)}
					</>
				)}
			</div>
		</PageLayout>
	);
}
