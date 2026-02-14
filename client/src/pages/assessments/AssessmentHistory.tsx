import { useContext, useState } from "react";
import { Routes } from "../../../../shared/routes";
import { AppContext } from "../../app-context";
import { AssessmentHistoryFilters, type AssessmentHistorySearchQuery } from "../../components/Assessments/AssessmentHistoryFilters";
import { AssessmentHistoryTable, type AssessmentHistoryTableEntry } from "../../components/Assessments/AssessmentHistoryTable";
import PageLayout from "../../components/PageLayout";
import { Panel } from "../../components/Panel";
import { getAppConfiguration } from "../../config/app.config";
import { mapAssessmentLogToDataTableEntry } from "../../helpers/mappers";
import { createSearchParams } from "../../helpers/fetch-helpers";


export function AssessmentHistory() {
    const { state: { clients, assessmentTypes } } = useContext(AppContext);
    const [tableData, setTableData] = useState<AssessmentHistoryTableEntry[]>([]);

    const getNewClientLogData = async (searchQuery: AssessmentHistorySearchQuery) => {
        try {
            const { clientId, ...parameters } = searchQuery;
            const requestOptions = {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            };
            const url = new URL(`${getAppConfiguration().apiUrl}${Routes.AssessmentLog}/${searchQuery.clientId}`);
            url.search = createSearchParams(parameters).toString();

            const response = await fetch(url, requestOptions);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const mappedData = data ? mapAssessmentLogToDataTableEntry(data, clients, assessmentTypes) : [];
            setTableData(mappedData);

        } catch (error) {
            console.error("Error fetching assessment history data:", error);
        }
    }

    const handleUpdateSearchQuery = (values: AssessmentHistorySearchQuery) => {
        getNewClientLogData(values);
    }

    return (
        <PageLayout title="Assessment History" style={{
            padding: "2rem 3rem",
            display: "flex",
            justifyContent: "center",
        }}>
            <Panel style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                padding: "1rem 3rem",
                gap: "1rem",
                justifyContent: "center",
            }}>
                <AssessmentHistoryFilters 
                    style={{
                        height: "10%",
                        width: "100%",
                    }}
                    onUpdateSearchQuery={handleUpdateSearchQuery}
                />
                <AssessmentHistoryTable 
                    style={{
                        height: "90%",
                        width: "100%"
                    }}
                    dataSource={tableData}
                />
            </Panel>
        </PageLayout>
    )
}