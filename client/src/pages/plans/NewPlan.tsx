import { Button } from "antd";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import AddPlanDetails from "../../components/Plans/AddPlanDetails";
import AddPlanDays from "../../components/Plans/AddPlanDays";
import React, { useEffect } from "react";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";
import { defaultPlanState, NewPlanContext, type NewPlanState } from "../../contexts/NewPlanContext";
import type { SubmitPlanRequest } from "../../../../shared/types";

export function NewPlan() {
    const [page, setPage] = React.useState(0);
    const [planState, setPlanState] = React.useState<NewPlanState>(defaultPlanState as NewPlanState);

    const updatePlanState = (newState: Partial<NewPlanState>) => {
        setPlanState( prev => ({
            ...prev,
            ...newState
        }))
    }

    const handleSubmit = async () => {

        if (!planState.selectedClient ||
            !planState.selectedDates ||
            !planState.selectedTargetMetricType ||
            !planState.targetMetricValue
        )
            return;

        // Submit new plan
        const planSubmissionBody: SubmitPlanRequest = {
            clientId: planState.selectedClient,
            planLabel: planState.planName,
            parentPlanId: planState.parentPlanId,
            plan_phase: planState.planStage ?? 1,
            dates: planState.selectedDates,
            targetMetricId: planState.selectedTargetMetricType?.id,
            targetMetricValue: planState.targetMetricValue,
            workoutRoutines: planState.workoutRoutines
        }
        console.log("Submitting new plan:", planSubmissionBody);
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(planSubmissionBody)
        }
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Plan}/create`, requestOptions);

        if (response.ok) {
            console.log("Plan created successfully");
        } else {
            console.error("Failed to create plan");
        }
    }

    const handleNext = () => {
        if (page === 0) {
            setPage(page + 1);
        } else {
            handleSubmit();
        }

    }

    const handleBack = () => {
        if (page === 0) return;
        setPage(page - 1);
    }

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Clients}`, requestOptions);
                const data = await response.json();
                updatePlanState({ clientOptions: data });
            } catch (error) {
                console.error("Error fetching client data:", error);
            }
        };

        const fetchTargetMetricTypes = async () => {
            try {
                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
                const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.TargetMetricTypes}`, requestOptions);
                const data = await response.json();
                updatePlanState({ targetMetricTypes: data });
            } catch (error) {
                console.error("Error fetching target metric types:", error);
            }
        }

        fetchClients();
        fetchTargetMetricTypes();
    }, [])

    return (
        <NewPlanContext.Provider value={{ state: planState, updateState: updatePlanState }}>
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
                    width: '60%',
                    gap: '1rem'
                }}>
                    {page === 0 ? <AddPlanDetails /> : <AddPlanDays />}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignSelf: 'end',
                    }}>
                        <Button type="default" disabled={page === 0} onClick={handleBack}>Prev</Button>
                        <Button type="primary" style={{marginLeft: '1rem'}} onClick={handleNext}>{page === 0 ? "Next" : "Finish"}</Button>
                    </div>
                </Panel>
            </PageLayout>
        </NewPlanContext.Provider>
    );
}