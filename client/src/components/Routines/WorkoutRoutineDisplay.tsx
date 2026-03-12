import { Button, Card, Input, Tree } from "antd";
import { type PlannedExerciseGroup, type WorkoutRoutine } from "../../../../shared/models";

import { useEffect, useState } from "react";
import { PlannedExerciseDisplay } from "./PlannedExerciseDisplay";
import { PlannedExerciseGroupDisplay } from "./PlannedExerciseGroupDisplay";
import { WorkoutNodeType, type WorkoutRoutineCategoryNode, type WorkoutRoutineTreeNode } from "../../types/types";
import { collectAllTreeKeys, deleteNodesByKeys, getWorkoutRoutineTreeData, handleRoutineDrop, mapRoutineTreeToRoutineGroups } from "../../helpers/routine-helpers";
import { MdEdit } from "react-icons/md";

export interface WorkoutRoutineProps extends React.ComponentProps<typeof Card> {
    routine: WorkoutRoutine
    treeProps?: React.ComponentProps<typeof Tree>;
    isEdit?: boolean;
    onEdit?: (updatedGroups: PlannedExerciseGroup[]) => void;
    onRename?: (newName: string) => void;
    onSelectNode?: (node: WorkoutRoutineTreeNode | undefined) => void;
}

export function WorkoutRoutineDisplay(props: WorkoutRoutineProps) {
    const { routine, treeProps, isEdit, onEdit, onSelectNode, onRename, ...cardProps } = props;
    const treeData = getWorkoutRoutineTreeData(routine);
    const [expandedKeys, setExpandedKeys] = useState<string[]>(collectAllTreeKeys(treeData));
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
    const [updatingTitle, setUpdatingTitle] = useState(false);

    useEffect(() => {
        setExpandedKeys(collectAllTreeKeys(treeData));
        setSelectedKeys([]);
    }, [routine])

    const handleDrop = (info: any) => {
        // Update the tree from the drag and drop action
        const updatedTree = handleRoutineDrop(treeData, info.dragNode, info.node, info.dropToGap);
        onEdit?.(mapRoutineTreeToRoutineGroups(updatedTree as WorkoutRoutineCategoryNode[]));
    }

    const handleSelect = (newSelection: any, info: any) => {
        if (!isEdit) return;
        setSelectedKeys(newSelection);
        console.log(newSelection, selectedKeys, info);
        if (newSelection.length === 1) {
            onSelectNode?.(info.selectedNodes[0] as WorkoutRoutineTreeNode);
        }
    }

    const handleDelete = () => {
        if (selectedKeys.length === 0) return;
        const updatedTree = deleteNodesByKeys(treeData, selectedKeys);
        onEdit?.(mapRoutineTreeToRoutineGroups(updatedTree as WorkoutRoutineCategoryNode[]));
        clearSelection();
    }

    const clearSelection = () => {
        setSelectedKeys([]);
    }

    const toggleTitleUpdate = () => {
        setUpdatingTitle((prev) => !prev);
    }

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUpdatingTitle(false);
        onRename?.(e.target.value);
    }

    useEffect(() => {
        if (selectedKeys.length === 0) {
            onSelectNode?.(undefined);
        }
    }, [selectedKeys])

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
            title={updatingTitle ? <Input defaultValue={routine.routine_name} autoFocus onBlur={handleTitleChange} /> : routine.routine_name}
            extra={isEdit ? <Button color="default" variant="text" icon={<MdEdit />} onClick={toggleTitleUpdate} /> : undefined}
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
                <Button color="default" variant="filled" onClick={clearSelection}>Clear Selection</Button>
                <Button color="danger" variant="solid" onClick={handleDelete}>Delete</Button>
            </div>
        </Card>
    )
}