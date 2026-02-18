import { Button, Flex, Rate, Space, Table, type TableProps } from "antd";
import { Link } from "react-router-dom";
import { useContext, useState } from "react";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";
import { ExerciseSearch, type ExerciseSearchParams } from "./ExerciseSearch";
import { IoAddCircle } from "react-icons/io5";
import { applyExerciseTableFilters } from "../../helpers/filter-helpers";
import type { Exercise, ExerciseForm, ExerciseMovementPattern, MuscleGroup } from "../../../../shared/models";
import { MuscleGroupTag } from "./MuscleGroupTag";
import { ExerciseTypeLabels, MovementPatternLabels, MuscleGroupLabels } from "../../helpers/label-formatters";
import { AppContext } from "../../app-context";
import { CreateEditExerciseModal } from "./CreateEditExerciseModal";

export function ExerciseTable(props: any) {
    const { state: { exerciseData }, stateRefreshers} = useContext(AppContext);
    const [filterParams, setFilterParams] = useState<ExerciseSearchParams>({});
    const [isCreateEditModalOpen, setIsCreateEditModalOpen] = useState(false);
    const [exerciseIdToEdit, setExerciseIdToEdit] = useState<number | undefined>(undefined);

    const handleDelete = async (key: string) => {
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Exercise}/${key}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            stateRefreshers?.refreshExerciseData();
        } else {
            // TODO add error handling/UI feedback
            console.error("Failed to delete exercise");
        }
    }

    const handleOpenEditModal = (exerciseId: number) => {
        setExerciseIdToEdit(exerciseId);
        setIsCreateEditModalOpen(true);
    }

    const handleOpenNewExercise = () => {
        setExerciseIdToEdit(undefined);
        setIsCreateEditModalOpen(true);
    }

    const resetModalState = () => {
        setExerciseIdToEdit(undefined);
        setIsCreateEditModalOpen(false);
    }

    const ExerciseTableColumns: TableProps<Exercise>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'exercise_name',
            key: 'exercise_name',
            width: 100,
            ellipsis: true,
        },
        {
            title: 'Movement Pattern',
            dataIndex: 'movement_pattern',
            key: 'movement_pattern',
            width: 90,
            render: (value: ExerciseMovementPattern) => MovementPatternLabels[value]
        },
        {
            title: 'Type',
            dataIndex: 'exercise_form',
            key: 'exercise_form',
            width: 75,
            render: (value: ExerciseForm) => ExerciseTypeLabels[value]
        },
        {
            title: 'Muscle Groups',
            dataIndex: 'muscle_groups',
            key: 'muscle_groups',
            render: (_, { muscle_groups }) => (
                <Flex style={{ overflow: 'hidden' }}>
                    {muscle_groups.map((tag: MuscleGroup) => {
                        return (
                            <MuscleGroupTag value={tag} label={MuscleGroupLabels[tag]} />
                        );
                    })}
                </Flex>
            ),
            width: 150,
        },
        {
            title: 'Progression Level',
            dataIndex: 'progression_level',
            key: 'progression_level',
            width: 75,
            render: (value) => {
                return (
                    <Rate character={({ index = 0 }) => index + 1} allowClear disabled defaultValue={value} />
                )
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size='middle'>
                    <Link to={record.video_link ?? '#'} disabled={!record.video_link} target={record.video_link ? "_blank" : undefined} rel="noopener noreferrer">Video</Link>
                    <Button onClick={() => handleOpenEditModal(record.id)}>Edit</Button>
                    <Button onClick={() => handleDelete(record.id)} type="primary">Delete</Button>
                </Space>
            ),
            width: 80,
        },
    ];

    const tableHeader = (
        <div style={{
            display: "flex",
            width: "100%",
        }}>
            <ExerciseSearch 
                style={{
                    flexGrow: 1,
                }}
                searchProps={{
                    style: {
                        width: "25%",
                    }
                }}
                onSearchChange={setFilterParams}
            />
            <Button 
                color="default" 
                variant="filled" 
                icon={<IoAddCircle />}
                iconPosition="end"
                onClick={() => handleOpenNewExercise()}
            >
                Create New
            </Button>
        </div>
        
    )

    const filteredData = applyExerciseTableFilters(exerciseData ?? [], filterParams);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Table<Exercise> 
                columns={ExerciseTableColumns}
                dataSource={filteredData}
                bordered
                title={() => tableHeader}
                size="small"
                style={{
                    width: "100%",
                    flex: 1
                }}
                pagination={{ 
                    pageSize: 13,
                    showSizeChanger: false
                }}
            />
            {isCreateEditModalOpen && (
                <CreateEditExerciseModal 
                    open={isCreateEditModalOpen}
                    onCancel={() => setIsCreateEditModalOpen(false)}
                    initialExerciseId={exerciseIdToEdit}
                    onComplete={resetModalState}
                />
            )}
        </div>
    )
}