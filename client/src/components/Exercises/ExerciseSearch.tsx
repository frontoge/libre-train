import { Button, Popover } from "antd";
import Search from "antd/es/input/Search";
import { useEffect, useState } from "react";
import { MdFilterList } from "react-icons/md";
import { ExerciseFilterOptions, type ExerciseFilterOptionsValues } from "./ExerciseFilterOptions";

export interface ExerciseSearchParams extends ExerciseFilterOptionsValues {
    name?: string;
}

export interface ExerciseSearchProps extends React.ComponentProps<'div'>{
    searchProps?: React.ComponentProps<typeof Search>;
    popoverProps?: React.ComponentProps<typeof Popover>;
    onSearchChange?: (search: ExerciseSearchParams) => void;
}

export function ExerciseSearch(props: ExerciseSearchProps) {
    const { searchProps, popoverProps, onSearchChange, ...divProps } = props;
    const [filtersVisible, setFiltersVisible] = useState(false);
    const [filterParams, setFilterParams] = useState<ExerciseSearchParams>({});

    const handleNameSearch = (search: string) => {
        setFilterParams(prev => ({
            ...prev,
            name: search,
        }))
    }

    const handleApplyFilters = (values: ExerciseFilterOptionsValues) => {
        setFilterParams(prev => ({
            name: prev.name,
            movementPattern: values.movementPattern ?? undefined,
            exerciseType: values.exerciseType ?? undefined,
            muscleGroups: values.muscleGroups ?? undefined,
            progressionLevel: values.progressionLevel ?? undefined,
        }))
    }

    const handleResetFilters = () => {
        setFilterParams(prev => ({
            name: prev.name,
        }))
    };

    useEffect(() => {
        props.onSearchChange?.(filterParams);
    }, [filterParams])

    return (
        <div 
            {...divProps}
            style={{
                display: 'flex',
                gap: '0.5rem',
                ...divProps.style
            }}
        >
            <Search
                placeholder="Search exercises..."
                onSearch={handleNameSearch}
                {...searchProps}
            />
            <Popover
                title="Filters"
                trigger="click"
                placement="rightBottom"
                content={<ExerciseFilterOptions onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} />}
                open={filtersVisible}
                onOpenChange={(open) => setFiltersVisible(open)}
                {...popoverProps}
            >
                <Button 
                    icon={<MdFilterList />}
                />
            </Popover>
        </div>
        
    )
}