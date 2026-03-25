import { Table, Button } from "antd";
import { AppContext } from "../../app-context";
import { useContext, useEffect, useMemo, useState } from "react";
import { fetchClientDietPlansForTrainer } from "../../helpers/api";
import { ClientDietPlanTableColumns, getClientDietPlanTableData } from "./ClientDietPlanTableColumns";
import type { ClientDietPlanTableData } from "../../types/types";
import { ClientDietPlanSearch } from "./ClientDietPlanSearch";
import stringSimilarity from "string-similarity-js";
import { ViewDietPlanModal } from "./ViewDietPlanModal";
import type { ClientDietPlan } from "../../../../shared/models";

export interface ClientDietPlanTableProps extends React.ComponentProps<typeof Table> {

}

export function ClientDietPlanTable(props: ClientDietPlanTableProps) {
    const { state: { auth: { user } } } = useContext(AppContext);
    const { ...tableProps } = props;
    const [clientPlans, setClientPlans] = useState<ClientDietPlan[]>([]);
    const [openModalType, setOpenModalType] = useState<'view' | 'edit' | 'create' | undefined>(undefined);
    const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>(undefined);
    const [searchParams, setSearchParams] = useState<ClientDietPlanSearch>({
        searchText: '',
        hasPlan: 'both',
    });

    const fetchClientPlans = async () => {
        try {
            if (!user) {
                console.error('No user found in context. Cannot fetch client diet plans.');
                return;
            }
            const results = await fetchClientDietPlansForTrainer(user);
            setClientPlans(results);
        } catch (error) {
            // show error notification
        }
    }

    useEffect(() => {
        fetchClientPlans();
    }, [user])

    const handleSearchChange = (search: ClientDietPlanSearch) => {
        setSearchParams(search);
    }

    const handleEdit = (record: ClientDietPlanTableData) => {
        // Edit Diet plan modal
    }

    const handleCreate = (record: ClientDietPlanTableData) => {
        // Create Diet plan modal
    }

    const handleRowClick = (record: ClientDietPlanTableData) => {
        // View Diet plan modal
        console.log(record);
        if (record.planId === undefined) {
            return;
        }
        setSelectedPlanId(record.planId);
        setOpenModalType('view');
    }

    const handleCloseModal = () => {
        setSelectedPlanId(undefined);
        setOpenModalType(undefined);
    }

    const tablePlanData = useMemo(() => {
        return getClientDietPlanTableData(clientPlans);
    }, [clientPlans])

    const filteredPlans = useMemo(() => {
        return tablePlanData.filter(plan => {
            if (searchParams.searchText.trim() !== '' && stringSimilarity(plan.name, searchParams.searchText) < 0.3) {
                return false;
            }

            if (searchParams.hasPlan === 'yes' && plan.calories === undefined) {
                return false;
            }

            if (searchParams.hasPlan === 'no' && plan.calories !== undefined) {
                return false;
            }

            return true;
        })
    }, [tablePlanData, searchParams]);

    const selectedPlan = useMemo(() => {
        if (selectedPlanId === undefined) {
            return undefined;
        }
        return clientPlans.find(plan => plan.dietPlanId === selectedPlanId);
    }, [selectedPlanId, clientPlans])

    const tableColumns = [
        ...(ClientDietPlanTableColumns || []),
        {
            title: 'Actions',
            key: 'actions',
            width: "10%",
            render: (_: any, record: ClientDietPlanTableData) => {
                const hasPlan = record.calories !== undefined;
                return (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'end',
                        gap: '1rem'
                    }}>
                        <Button color={hasPlan ? "primary" : "default"} variant={hasPlan ? "solid" : "filled"} onClick={() => hasPlan ? handleEdit(record) : handleCreate(record)}>{hasPlan ? 'Edit' : 'Create'}</Button>
                        {hasPlan && (
                            <Button color="danger" variant="solid">Delete</Button>
                        )}
                    </div>
                )
            } 
        }
    ]

    const tableHeader = (
        <div style={{
            display: "flex",
            width: "100%",
        }}>
            <ClientDietPlanSearch
                onSearchChange={handleSearchChange}
            />
        </div>
        
    )

    return (
        <>
            <Table<ClientDietPlanTableData>
                columns={tableColumns}
                dataSource={filteredPlans}
                bordered
                title={() => tableHeader}
                style={{
                    width: "100%",
                    flex: 1
                }}
                pagination={{ 
                    pageSize: 12,
                    showSizeChanger: false
                }}
                onRow={(record: ClientDietPlanTableData, index) => ({
                    onDoubleClick: (event) => handleRowClick(record),
                })}
                {...tableProps}
            />
            { (openModalType === 'view' && selectedPlan !== undefined) && (
                <ViewDietPlanModal 
                    open={openModalType === 'view'}
                    dietPlan={selectedPlan} 
                    onCancel={handleCloseModal}
                />
            )}
        </>
    )
}