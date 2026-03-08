import { Button, Card, Tree } from "antd";
import { type PlannedExerciseGroup, type WorkoutRoutine } from "../../../../shared/models";

import { useEffect, useState } from "react";
import { PlannedExerciseDisplay } from "./PlannedExerciseDisplay";
import { PlannedExerciseGroupDisplay } from "./PlannedExerciseGroupDisplay";
import { WorkoutNodeType, type WorkoutRoutineCategoryNode, type WorkoutRoutineTreeNode } from "../../types/types";
import { collectAllTreeKeys, deleteNodesByKeys, getWorkoutRoutineTreeData, handleRoutineDrop, mapRoutineTreeToRoutineGroups } from "../../helpers/routine-helpers";

export interface WorkoutRoutineProps extends React.ComponentProps<typeof Card> {
    routine: WorkoutRoutine
    treeProps?: React.ComponentProps<typeof Tree>;
    isEdit?: boolean;
    onEdit?: (updatedGroups: PlannedExerciseGroup[]) => void;
}

export function WorkoutRoutineDisplay(props: WorkoutRoutineProps) {
    const { routine, treeProps, isEdit, onEdit, ...cardProps } = props;
    const treeData = getWorkoutRoutineTreeData(routine);
    const [expandedKeys, setExpandedKeys] = useState<string[]>(collectAllTreeKeys(treeData));
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    useEffect(() => {
        setExpandedKeys(collectAllTreeKeys(treeData));
        setSelectedKeys([]);
    }, [routine])

    const handleDrop = (info: any) => {
        // Update the tree from the drag and drop action
        const updatedTree = handleRoutineDrop(treeData, info.dragNode, info.node, info.dropToGap);
        onEdit?.(mapRoutineTreeToRoutineGroups(updatedTree as WorkoutRoutineCategoryNode[]));
    }

    const handleSelect = (selectedKeys: any) => {
        if (!isEdit) return;
        setSelectedKeys(selectedKeys);
    }

    const handleDelete = () => {
        if (selectedKeys.length === 0) return;
        const updatedTree = deleteNodesByKeys(treeData, selectedKeys);
        onEdit?.(mapRoutineTreeToRoutineGroups(updatedTree as WorkoutRoutineCategoryNode[]));
    }

    const titleRender = (node: WorkoutRoutineTreeNode) => {
        if (node.nodeType === WorkoutNodeType.Exercise) {
            return <PlannedExerciseDisplay exercise={node.data} restAfter={node.restAfter} />
        }

        if (node.nodeType === WorkoutNodeType.Group) {
            return <PlannedExerciseGroupDisplay group={node.data} groupTitle={node.title as string} />
        }
        
        return <span style={{
            color: "white"
        }}>{node.title}</span>;
    }

    return (
        <Card
            title={routine.routine_name ?? "Unnamed Routine"}
            {...cardProps}
        >
            <Tree
                multiple
                showIcon
                showLine
                onDrop={handleDrop}
                draggable={{
                    icon: false,
                    nodeDraggable: (node) => isEdit ?? false
                }}
                blockNode
                {...treeProps}
                expandedKeys={expandedKeys}
                onExpand={() => {}}
                treeData={treeData}
                titleRender={titleRender}
                onSelect={handleSelect}
                selectedKeys={selectedKeys}
            />
            <div style={{
                display: selectedKeys.length === 0 ? 'none' : 'flex',
                justifyContent: 'end',
                gap: '1rem',
            }}>
                <Button color="danger" variant="solid" onClick={handleDelete}>Delete</Button>
            </div>
        </Card>
    )
}