import { Route, Routes } from 'react-router-dom';
import { RequirePermission } from '../../auth/RequirePermission';
import { NoPage } from '../NoPage';
import { AssessmentHistory } from './AssessmentHistory';
import { CreateAssessment } from './CreateAssessment';

export function AssessmentRouter() {
	return (
		<Routes>
			<Route index element={<AssessmentHistory />} />
			<Route
				path="create"
				element={
					<RequirePermission permission="assessments.manage">
						<CreateAssessment />
					</RequirePermission>
				}
			/>
			<Route path="*" element={<NoPage />} />
		</Routes>
	);
}
