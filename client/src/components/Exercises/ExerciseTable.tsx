import { Button, Flex, Space, Table, Tag, type TableProps } from "antd";
import { muscleValueToColor } from "../../../../shared/MuscleGroups";
import { type ExerciseData, type MuscleGroupOption } from "../../../../shared/MuscleGroups";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { ExerciseContext } from "../../contexts/ExercisesContext";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";

export function ExerciseTable(props: any) {
    const { exerciseData, refreshExercises } = useContext(ExerciseContext);

    const handleDelete = async (key: string) => {
        console.log("Delete exercise with key:", key);
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Exercise}/${key}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            console.log("Exercise deleted successfully");
            refreshExercises();
        } else {
            console.error("Failed to delete exercise");
        }
    }

    const ExerciseTableColumns: TableProps<ExerciseData>['columns'] = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: 100,
            maxWidth: 200,
            ellipsis: true,
        },
        {
            title: 'Muscle Groups',
            dataIndex: 'muscleGroups',
            key: 'muscleGroups',
            render: (_, { muscleGroups }) => (
                <Flex gap="small" wrap>
                    {muscleGroups.map((tag: MuscleGroupOption) => {
                        return (
                            <Tag color={muscleValueToColor[tag.value]} key={tag.value}>
                                {tag.label}
                            </Tag>
                        );
                    })}
                </Flex>
            ),
            width: 250,
            maxWidth: 300,
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            width: 250,
            maxWidth: 400,
            ellipsis: {
                showTitle: false,
            },
            render: (text) => (
                <span title={text}>{text}</span>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size='middle'>
                    <Link to={record.videoLink ?? '#'} target={record.videoLink ? "_blank" : undefined} rel="noopener noreferrer">Video</Link>
                    <Link to={`/exercises/edit/${record.key}`}>Edit</Link>
                    <Button onClick={() => handleDelete(record.key)} type="primary">Delete</Button>
                </Space>
            ),
            width: 150,
            maxWidth: 150,
        }
    ];

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Table<ExerciseData> 
                columns={ExerciseTableColumns}
                dataSource={exerciseData}
                style={{
                    width: "100%",
                    flex: 1
                }}
                pagination={{ 
                    pageSize: 9,
                    showSizeChanger: false
                }}
                size="middle"
            />
        </div>
    )
}