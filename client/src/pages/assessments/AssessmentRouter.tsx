import { Route, Routes } from 'react-router-dom';
import { NoPage } from '../NoPage';
import { AssessmentHistory } from './AssessmentHistory';
import { CreateAssessment } from './CreateAssessment';

export function AssessmentRouter() {
	return (
		<Routes>
			<Route index element={<AssessmentHistory />} />
			<Route path="create" element={<CreateAssessment />} />
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
