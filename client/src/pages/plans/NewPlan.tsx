import { Button } from "antd";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import AddPlanDetails from "../../components/Plans/AddPlanDetails";
import AddPlanDays from "../../components/Plans/AddPlanDays";


export function NewPlan() {

    return (
        <PageLayout title="Create New Plan" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '2rem',

        }}>
            <Panel style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: "100%",
                width: '50%',
                gap: '1rem'
            }}>
                <AddPlanDays />
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignSelf: 'end',
                }}>
                    <Button type="default">Prev</Button>
                    <Button type="primary" style={{marginLeft: '1rem'}}>Next</Button>
                </div>
            </Panel>
            

        </PageLayout>
    );
}