import type { Macrocycle, Mesocycle } from "../../../../shared/models";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { MacrocycleDisplay } from "../../components/Training/MacrocycleDisplay";
import { MesocycleDisplay } from "../../components/Training/MesocycleDisplay";

export function TodaysPlan(props: any) {

    const macrocycle: Macrocycle = {
        id: 1,
        cycle_name: "Macrocycle Test",
        // @ts-ignore
        cycle_start_date: "2026-01-01",
        // @ts-ignore
        cycle_end_date: "2026-12-31",
        isActive: true,
        client_id: 34
    }

    const mesocycle: Mesocycle = {
        id: 1,
        macrocycle_id: 1,
        cycle_name: "Mesocycle Test",
        // @ts-ignore
        cycle_start_date: "2026-01-01",
        // @ts-ignore
        cycle_end_date: "2026-03-31",
        optLevels: [1, 2, 3],
        cardioLevels: [1],
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
                gap: '2rem'
            }}
        >
            <Panel  
                style={{
                    width: '100%',
                    height: "100%",
                    display: 'flex',
                    gap: '1rem',
                    flexDirection: 'column',
                }}
            >
                <MacrocycleDisplay
                    macrocycle={macrocycle}
                    style={{
                        width: "100%"
                    }}
                />
                <MesocycleDisplay
                    mesocycle={mesocycle}
                    style={{
                        width: '100%',
                    }}
                />
            </Panel>
            
        </PageLayout>
    )
}