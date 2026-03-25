import { Table, Button } from "antd";
import { AppContext } from "../../app-context";
import { useContext, useEffect, useMemo, useState } from "react";
import { fetchClientDietPlansForTrainer } from "../../helpers/api";
import { ClientDietPlanTableColumns, getClientDietPlanTableData } from "./ClientDietPlanTableColumns";
import type { ClientDietPlanTableData } from "../../types/types";
import { ClientDietPlanSearch } from "./ClientDietPlanSearch";
import stringSimilarity from "string-similarity-js";

export interface ClientDietPlanTableProps extends React.ComponentProps<typeof Table> {

}

export function ClientDietPlanTable(props: ClientDietPlanTableProps) {
    const { state: { auth: { user } } } = useContext(AppContext);
    const { ...tableProps } = props;
    const [clientPlans, setClientPlans] = useState<ClientDietPlanTableData[]>([]);
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
            setClientPlans(getClientDietPlanTableData(results));
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
    }

    const filteredPlans = useMemo(() => {
        return clientPlans.filter(plan => {
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
    }, [clientPlans, searchParams]);

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
        <Table
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
            onRow={(record, index) => ({
                onDoubleClick: (event) => handleRowClick(record),
            })}
            {...tableProps}
        />
    )
}