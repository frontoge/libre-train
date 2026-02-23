import useMessage from "antd/es/message/useMessage";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { CreateEditTrainingPlan, type CreateEditTrainingPlanFormValues } from "../../components/Training/CreateEditTrainingPlan";
import { cycleCreateHelpers } from "../../helpers/training-helpers";

export function NewPlan() {
    const [messageApi, contextHolder] = useMessage();
    const handleSubmit = async (values: CreateEditTrainingPlanFormValues) => {
        const result = await cycleCreateHelpers[values.cycleType](values);
        if (result) {
            messageApi.success("Training plan created successfully!");
            // Navigate to training plan viewer for the newly created plan
        } else {
            messageApi.error("Failed to create training plan.");
        }
    }

    return (
        <PageLayout title="New Training Plan" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '2rem',

        }}>
            {contextHolder}
            <Panel style={{
                height: "100%",
                width: '50%',
                display: 'flex',
                justifyContent: 'center',
                paddingTop: '2rem',
            }}>
                <CreateEditTrainingPlan onSubmit={handleSubmit} />
            </Panel>
        </PageLayout>
    );
}