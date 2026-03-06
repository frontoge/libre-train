import { Card, Tree } from "antd";
import { type WorkoutRoutine } from "../../../../shared/models";

import { useEffect, useState } from "react";
import { PlannedExerciseDisplay } from "./PlannedExerciseDisplay";
import { PlannedExerciseGroupDisplay } from "./PlannedExerciseGroupDisplay";
import { WorkoutNodeType, type WorkoutRoutineTreeNode } from "../../types/types";
import { collectAllTreeKeys, getInitialWorkoutRoutineTreeData, handleRoutineDrop } from "../../helpers/routine-helpers";

export interface WorkoutRoutineProps extends React.ComponentProps<typeof Card> {
    routine: WorkoutRoutine
    treeProps?: React.ComponentProps<typeof Tree>;
    isEdit?: boolean;
    onEdit?: (updatedRoutine: WorkoutRoutine) => void;
}

export function WorkoutRoutineDisplay(props: WorkoutRoutineProps) {
    const { routine, treeProps, isEdit, onEdit, ...cardProps } = props;
    const [treeData, setTreeData] = useState<WorkoutRoutineTreeNode[]>(getInitialWorkoutRoutineTreeData(routine));

    const [expandedKeys, setExpandedKeys] = useState<string[]>(collectAllTreeKeys(treeData));

    useEffect(() => {
        setExpandedKeys(collectAllTreeKeys(treeData));
        if (isEdit && onEdit) {
            // TODO call the onEdit with the updated routine data
        }
    }, [treeData])

    useEffect(() => {
        setTreeData(getInitialWorkoutRoutineTreeData(routine));
    }, [routine])

    const handleDrop = (info: any) => {
        // Update the tree from the drag and drop action
        const updatedTree = handleRoutineDrop(treeData, info.dragNode, info.node, info.dropToGap);
        setTreeData(updatedTree);
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
                showIcon
                showLine
                checkable={isEdit}
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
            />
        </Card>
    )
}