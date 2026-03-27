import { Route, Routes } from 'react-router-dom';
import { NoPage } from '../NoPage';
import { CycleRoutineBuilder } from './CycleRoutineBuilder';
import { ManagePlans } from './ManagePlans';
import { NewPlan } from './NewPlan';
import { TodaysPlan } from './TodaysPlan';

function CycleRoutes() {
	return (
		<Routes>
			<Route path=":cycleId/builder" element={<CycleRoutineBuilder />} />
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}

export function TrainingRouter() {
	return (
		<Routes>
			<Route index element={<ManagePlans />} />
			<Route path="create" element={<NewPlan />} />
			<Route path="view" element={<TodaysPlan />} />
			<Route path="cycle/*" element={<CycleRoutes />} />
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
