import { Button, Popover } from "antd";
import { ClientSearch } from "../clients/ClientSearch";
import { MdFilterList } from "react-icons/md";
import { useEffect, useState } from "react";
import { AssessmentFilterOptions, type AssessmentFilterOptionsValues } from "./AssessmentFilterOptions";

export type AssessmentHistorySearchQuery = {
    clientId: string;
    group?: string;
    type?: string;
    start?: string;
    end?: string;
}

export interface AssessmentHistoryFiltersProps extends React.HTMLAttributes<HTMLDivElement> {
    onUpdateSearchQuery: (values: AssessmentHistorySearchQuery) => void;
}

export function AssessmentHistoryFilters(props: AssessmentHistoryFiltersProps) {
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
    const [selectedFilters, setSelectedFilters] = useState<AssessmentFilterOptionsValues | undefined>(undefined);
    const { style, ...otherProps } = props;

    useEffect(() => {
        if (!selectedClientId) return;
        
        const queryValues: AssessmentHistorySearchQuery = {
            clientId: selectedClientId,
            group: selectedFilters?.group,
            type: selectedFilters?.assessmentType,
            start: selectedFilters?.startDate?.format("YYYY-MM-DD"),
            end: selectedFilters?.endDate?.format("YYYY-MM-DD"),
        }

        props.onUpdateSearchQuery(queryValues);

    }, [selectedClientId, selectedFilters])

    const handleApplyFilters = (values: AssessmentFilterOptionsValues) => {
        setSelectedFilters(values);
        setFiltersVisible(false);
    }

    const handleResetFilters = () => {
        setSelectedFilters(undefined);
    }

    const handleClientSelect = (clientId: string) => {
        setSelectedClientId(clientId);
    }

    return (
        <div
            style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'start',
                alignItems: 'center',
                ...style
            }}
            {...otherProps}
        >
            <ClientSearch
                onClientSelect={handleClientSelect}
                style={{
                    width: "20%"
                }}
            />
            <Popover
                title="Filters"
                trigger="click"
                placement="bottomLeft"
                content={<AssessmentFilterOptions onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} />}
                open={filtersVisible}
                onOpenChange={(open) => setFiltersVisible(open)}
            >
                <Button 
                    icon={<MdFilterList />}
                />
            </Popover>
        </div>
    )
}