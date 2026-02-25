import PageLayout from "../../components/PageLayout";
import { MacrocycleDisplay } from "../../components/Training/MacrocycleDisplay";

export function TodaysPlan(props: any) {
    return (
        <PageLayout 
        title="Training Plan Snapshot" 
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '2rem',
            }}
        >
            <MacrocycleDisplay 
                style={{
                    width: '100%',
                }}
            />
        </PageLayout>
    )
}