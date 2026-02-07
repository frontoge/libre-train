import { Button, Select, Steps } from "antd";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { WorkoutRoutine } from "../../components/Plans/WorkoutRoutine";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "../../app-context";
import { getAppConfiguration } from "../../config/app.config";
import type { Plan } from "../../../../shared/types";
import { Routes } from "../../../../shared/routes";
import { DeletePlanModal } from "../../components/Plans/DeletePlanModal";

export function ManagePlans() {

    const { state } = useContext(AppContext);
    const [selectedClientId, setSelectedClientId] = useState<number | undefined>(undefined);
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>(undefined);
    const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

    const selectedPlan = plans.find(plan => plan.id === selectedPlanId);

    useEffect(() => {
        if (selectedClientId === undefined) {
            setPlans([]);
            return;
        }
        setSelectedPlanId(undefined);
        const fetchClientPlans = async (clientId: number) => {
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
            const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.ClientPlan}/${clientId}`, requestOptions);
            if (response.ok) {
                const data = await response.json();
                setPlans(data);
            }
        }

        fetchClientPlans(selectedClientId as number);
    }, [selectedClientId]);

    const clientOptions = state.clients?.map(client => ({
        label: client.first_name + " " + client.last_name,
        value: client.id
    }))

    const planOptions = plans.map((plan: Plan) => ({
        label: plan.planName,
        value: plan.id
    }))

    const title = selectedClientId && selectedPlan ? selectedPlan?.planName : "Select a client and plan";

    const dayOptions = selectedPlan?.workoutRoutines.map((routine) => ({
        title: routine.dayName,
    })) ?? [];

    const onSuccessfulDelete = () => {
        setSelectedPlanId(undefined);
        setSelectedClientId(undefined);
        setPlans([]);
        setSelectedDayIndex(0);
    }

    return (
        <PageLayout title="Manage Plans" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '1rem',

        }}>
            <Panel style={{
                width: "75%",
                height: "100%",
                display: 'flex',
                flexDirection: 'column',
                gap: '3rem'
            }}>
                <div style={{
                    display: 'flex',
                    height: "10%",
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <h2 style={{
                        flexGrow: 1
                    }}>
                        {title}
                    </h2>
                    <Select 
                        placeholder="Select Client"
                        options={clientOptions}
                        style={{
                            width: "20%"
                        }}
                        value={selectedClientId}
                        onChange={(value) => setSelectedClientId(value)}
                    />
                    <Select
                        placeholder="Select Plan"
                        disabled={selectedClientId === undefined}
                        options={planOptions}
                        style={{
                            width: "20%"
                        }}
                        value={selectedPlanId}
                        onChange={(value) => setSelectedPlanId(value)}
                        
                    />
                </div>
                {selectedPlanId !== undefined && <>
                    <Steps size="small" current={selectedDayIndex} items={dayOptions || []} onChange={(current) => setSelectedDayIndex(current)}/>
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
                        <WorkoutRoutine selectedRoutine={selectedPlan?.workoutRoutines[selectedDayIndex]} style={{ width: '100%', height: '100%' }} />
                    </div>
                    <div style={{
                        height: "7.5%",
                        alignSelf: 'end',
                    }}>
                        <Button variant="solid" color="danger" disabled={!selectedPlanId} onClick={() => setIsDeleteModalOpen(true)}>Delete</Button>
                    </div>
                </>}
                {isDeleteModalOpen && (
                    <DeletePlanModal planId={selectedPlanId!} onCancel={() => setIsDeleteModalOpen(false)} onComplete={onSuccessfulDelete}/>
                )}
            </Panel>
        </PageLayout>
    )
}