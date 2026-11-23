import { Route, Routes } from 'react-router-dom';
import { RequirePermission } from '../../auth/RequirePermission';
import { NoPage } from '../NoPage';
import { CycleRoutineBuilder } from './CycleRoutineBuilder';
import { ManagePlans } from './ManagePlans';
import { NewPlan } from './NewPlan';
import { TodaysPlan } from './TodaysPlan';

function CycleRoutes() {
	return (
		<Routes>
			<Route
				path=":cycleId/builder"
				element={
					<RequirePermission permission="training.edit">
						<CycleRoutineBuilder />
					</RequirePermission>
				}
			/>
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}

export function TrainingRouter() {
	return (
		<Routes>
			<Route index element={<ManagePlans />} />
			<Route
				path="create"
				element={
					<RequirePermission permission="training.create">
						<NewPlan />
					</RequirePermission>
				}
			/>
			<Route path="view" element={<TodaysPlan />} />
			<Route path="cycle/*" element={<CycleRoutes />} />
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
