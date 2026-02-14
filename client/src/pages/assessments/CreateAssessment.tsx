import { AssessmentCreateEditForm } from "../../components/Assessments/AssessmentCreateEditForm";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";

export function CreateAssessment() {
    return ( 
        <PageLayout title="New Assessment" style={{
            padding: "2rem 3rem",
            display: "flex",
            justifyContent: "center",
        }}>
            <Panel style={{
                width: "50%",
                display: "flex",
                flexDirection: "column",
                padding: "2rem 3rem",
                alignItems: "center",
            }}>
                <AssessmentCreateEditForm />       
            </Panel>
        </PageLayout>
    )
}