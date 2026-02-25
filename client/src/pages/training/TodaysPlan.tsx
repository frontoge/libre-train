import type { Macrocycle } from "../../../../shared/models";
import PageLayout from "../../components/PageLayout";
import { MacrocycleDisplay } from "../../components/Training/MacrocycleDisplay";

export function TodaysPlan(props: any) {

    const macrocycle: Macrocycle = {
        id: 1,
        cycle_name: "Macrocycle 1",
        cycle_start_date: new Date("2026-01-01"),
        cycle_end_date: new Date("2026-03-31"),
        isActive: true,
        client_id: 34
    }

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
                macrocycle={macrocycle}
                style={{
                    width: '100%',
                }}
            />
        </PageLayout>
    )
}