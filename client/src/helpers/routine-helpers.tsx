import { WorkoutRoutineCategory, type PlannedExerciseGroup, type WorkoutRoutine } from "../../../shared/models";
import { WorkoutNodeType, type WorkoutRoutineCategoryNode, type WorkoutRoutineExerciseNode, type WorkoutRoutineGroupNode, type WorkoutRoutineTreeNode } from "../types/types";
import { WorkoutRoutineCategoryLabels } from "./label-formatters";
import { FaFire, FaDumbbell, FaBolt, FaBrain } from "react-icons/fa6";
import { FaStar } from "react-icons/fa";
import { GiMeltingIceCube } from "react-icons/gi";
import { mapWorkoutRoutineGroupToTreeData } from "./mappers";

// Builds a workout routine tree data structure from a workout routine
export function getWorkoutRoutineTreeData(routine: WorkoutRoutine): WorkoutRoutineCategoryNode[] {
    const routineCategoryProperties = {
        checkable: false,
        isLeaf: false,
        selectable: false,
        disabled: true,
    }

    return [
        {
            title: WorkoutRoutineCategoryLabels[WorkoutRoutineCategory.Warmup],
            key: (WorkoutRoutineCategory.Warmup - 1).toString(),
            icon: <FaFire color="#F97316" size={16}/>,
            children: mapWorkoutRoutineGroupToTreeData(
                routine.exercise_groups.filter(group => group.routine_category === WorkoutRoutineCategory.Warmup)
            ),
            nodeType: WorkoutNodeType.Category,
            ...routineCategoryProperties
        },
        {
            title: WorkoutRoutineCategoryLabels[WorkoutRoutineCategory.Activation],
            key: (WorkoutRoutineCategory.Activation - 1).toString(),
            icon: <FaBolt color="#3B82F6" size={16}/>,
            nodeType: WorkoutNodeType.Category,
            children: mapWorkoutRoutineGroupToTreeData(
                routine.exercise_groups.filter(group => group.routine_category === WorkoutRoutineCategory.Activation)
            ),
            ...routineCategoryProperties
        },
        {
            title: WorkoutRoutineCategoryLabels[WorkoutRoutineCategory.SkillDevelopment],
            key: (WorkoutRoutineCategory.SkillDevelopment - 1).toString(),
            icon: <FaBrain color="#d33ebd" size={16}/>,
            nodeType: WorkoutNodeType.Category,
            children: mapWorkoutRoutineGroupToTreeData(
                routine.exercise_groups.filter(group => group.routine_category === WorkoutRoutineCategory.SkillDevelopment)
            ),
            ...routineCategoryProperties
        },
        {
            title: WorkoutRoutineCategoryLabels[WorkoutRoutineCategory.ResistanceTraining],
            key: (WorkoutRoutineCategory.ResistanceTraining - 1).toString(),
            icon: <FaDumbbell color="#64748B" size={16}/>,
            nodeType: WorkoutNodeType.Category,
            children: mapWorkoutRoutineGroupToTreeData(
                routine.exercise_groups.filter(group => group.routine_category === WorkoutRoutineCategory.ResistanceTraining)
            ),
            ...routineCategoryProperties
        },
        {
            title: WorkoutRoutineCategoryLabels[WorkoutRoutineCategory.ClientsChoice],
            key: (WorkoutRoutineCategory.ClientsChoice - 1).toString(),
            nodeType: WorkoutNodeType.Category,
            icon: <FaStar color="#FBBF24" size={16}/>,
            children: mapWorkoutRoutineGroupToTreeData(
                routine.exercise_groups.filter(group => group.routine_category === WorkoutRoutineCategory.ClientsChoice)
            ),
            ...routineCategoryProperties
        },
        {
            title: WorkoutRoutineCategoryLabels[WorkoutRoutineCategory.Cooldown],
            key: (WorkoutRoutineCategory.Cooldown - 1).toString(),
            icon: <GiMeltingIceCube color="#22D3EE" size={16}/>,
            nodeType: WorkoutNodeType.Category,
            children: mapWorkoutRoutineGroupToTreeData(
                routine.exercise_groups.filter(group => group.routine_category === WorkoutRoutineCategory.Cooldown)
            ),
            ...routineCategoryProperties
        },
    ];
}

function getNodePositionByKey(key: string, routineTree: WorkoutRoutineTreeNode[]): number[] {
    for (let i = 0; i < routineTree.length; i++) {
        const categoryNode = routineTree[i];
        if (categoryNode.key === key) {
            return [i];
        }
        if (categoryNode.children) {
            for (let j = 0; j < categoryNode.children.length; j++) {
                const groupNode = categoryNode.children[j];
                if (groupNode.key === key) {
                    return [i, j];
                }
                if (groupNode.children) {
                    for (let k = 0; k < groupNode.children.length; k++) {
                        const exerciseNode = groupNode.children[k];
                        if (exerciseNode.key === key) {
                            return [i, j, k];
                        }
                    }
                }
            }
        }
    }
    return [];
}

function getNodeAtPosition(position: number[], tree: WorkoutRoutineTreeNode[]): WorkoutRoutineTreeNode | undefined {
    if (position.length === 1) {
        return tree[position[0]];
    } else if (position.length === 2) {
        return tree[position[0]].children?.[position[1]] as WorkoutRoutineTreeNode;
    } else if (position.length === 3) {
        return tree[position[0]].children?.[position[1]].children?.[position[2]] as WorkoutRoutineTreeNode;
    }
}

/**
 * Handles drag and drop of workout routine tree nodes, returning an updated tree structure
 * @param routineTree 
 * @param sourceNode 
 * @param targetNode 
 * @param toGap 
 * @returns Updated tree structure
 */
export function handleRoutineDrop(routineTree: WorkoutRoutineTreeNode[], sourceNode: WorkoutRoutineTreeNode, targetNode: WorkoutRoutineTreeNode, toGap: boolean): WorkoutRoutineTreeNode[] {
    const updatedTree = [...routineTree];

    const sourcePos = getNodePositionByKey(sourceNode.key.toString(), routineTree);
    const sourceDepth = sourcePos.length;
    const targetDepth = getNodePositionByKey(targetNode.key.toString(), routineTree).length;

    // Cannot drag categories or move groups into other groups
    if ( sourceNode.nodeType === WorkoutNodeType.Category
        || (sourceNode.nodeType === WorkoutNodeType.Group
            && targetDepth === 3
        )
    ) {
        return updatedTree;
    }

    // Remove source node from its current position
    if (sourceDepth === 2) {
        updatedTree[sourcePos[0]].children?.splice(sourcePos[1], 1);
    } else if (sourceDepth === 3) {
        updatedTree[sourcePos[0]].children?.[sourcePos[1]].children?.splice(sourcePos[2], 1);
    }

    const targetPos = getNodePositionByKey(targetNode.key.toString(), updatedTree);

    // Dropping to category
    if (targetNode.nodeType === WorkoutNodeType.Category) {
        if (toGap) {
            (updatedTree[targetPos[0]] as WorkoutRoutineCategoryNode).children.push(sourceNode);
        } else {
            (updatedTree[targetPos[0]] as WorkoutRoutineCategoryNode).children.unshift(sourceNode);
        }
    }
    // Dragging a group node
    else if (sourceNode.nodeType === WorkoutNodeType.Group) {
        // Insert after target node
        updatedTree[targetPos[0]].children?.splice(targetPos[1] + 1, 0, sourceNode);
    // Dragging an exercise node
    } else if (sourceNode.nodeType === WorkoutNodeType.Exercise) {
        if (targetNode.nodeType === WorkoutNodeType.Group) {
            // After group
            if (toGap) {
                // Insert after target node
                updatedTree[targetPos[0]].children?.splice(targetPos[1] + 1, 0, sourceNode);
            // Into group
            } else {
                // Insert at start of group
                const newLength = updatedTree[targetPos[0]].children?.[targetPos[1]].children?.unshift({...sourceNode, restAfter: 0});
                (updatedTree[targetPos[0]] as WorkoutRoutineCategoryNode).children[targetPos[1]].title = newLength && newLength > 2 ? "Circuit" : "Superset";
            }
        } else {
            // Into group
            if (targetDepth === 3) {
                // Insert after target node
                updatedTree[targetPos[0]].children?.[targetPos[1]].children?.splice(targetPos[2] + 1, 0, {...sourceNode, restAfter: 0});
                const newLength = updatedTree[targetPos[0]].children?.[targetPos[1]].children?.length;
                (updatedTree[targetPos[0]] as WorkoutRoutineCategoryNode).children[targetPos[1]].title = newLength && newLength > 2 ? "Circuit" : "Superset";
            } else {
                // After exercise
                if (toGap) {
                    // Insert after target node
                    updatedTree[targetPos[0]].children?.splice(targetPos[1] + 1, 0, sourceNode);
                // Grouping with exercise
                } else {
                    // Create new group with target node and source node as children
                    // Replace target node with the new group
                    updatedTree[targetPos[0]].children?.splice(targetPos[1], 1, {
                        title: "Superset",
                        // This will be recalculated
                        key: "group_new",
                        data: {
                            rest_after: 0,
                            rest_between: 0,
                        },
                        nodeType: WorkoutNodeType.Group,
                        children: [{...targetNode, restAfter: 0}, {...sourceNode, restAfter: 0}],
                    } as WorkoutRoutineGroupNode);
                }
            }
        }
    }

    // If moving a group exercise
    
    if (sourceDepth === 3) {
        const updatedSourceGroupPosition = getNodePositionByKey([sourcePos[0], sourcePos[1]].join('-'), updatedTree);
        const sourceGroupNode = getNodeAtPosition([updatedSourceGroupPosition[0], updatedSourceGroupPosition[1]], updatedTree) as WorkoutRoutineGroupNode | undefined;
        (updatedTree[updatedSourceGroupPosition[0]] as WorkoutRoutineCategoryNode).children[updatedSourceGroupPosition[1]].title = sourceGroupNode && sourceGroupNode.children.length > 2 ? "Circuit" : "Superset";
        if (sourceGroupNode?.children?.length === 1) {
            // Get the remaining exercise in the group
            const remainingExerciseNode = sourceGroupNode.children[0] as WorkoutRoutineExerciseNode;
            remainingExerciseNode.restAfter = sourceGroupNode.data.rest_after;
            // Remove the group node from updated tree
            updatedTree[updatedSourceGroupPosition[0]].children?.splice(updatedSourceGroupPosition[1], 1);
            // Insert the remaining exercise node where the group node was
            updatedTree[updatedSourceGroupPosition[0]].children?.splice(updatedSourceGroupPosition[1], 0, remainingExerciseNode as WorkoutRoutineTreeNode);
        }            
    } 

    return updatedTree;
}

export function mapRoutineTreeToRoutineGroups(tree: WorkoutRoutineCategoryNode[]): PlannedExerciseGroup[] {
    const groups: PlannedExerciseGroup[] = [];
    tree.forEach((categoryNode, index) => {
        categoryNode.children.forEach(groupOrExerciseNode => {
            if (groupOrExerciseNode.nodeType === WorkoutNodeType.Group) 
            {
                if (groupOrExerciseNode.children.length !== 0) {
                    groups.push({
                        ...groupOrExerciseNode.data,
                        routine_category: index + 1,
                        exercises: groupOrExerciseNode.children.map(exerciseNode => exerciseNode.data)
                    })
                }
            } else {
                groups.push({
                    rest_between: 0,
                    rest_after: groupOrExerciseNode.restAfter ?? 0,
                    routine_category: index + 1,
                    exercises: [groupOrExerciseNode.data]
                })
            }
        })
    })
    return groups;
}

export const collectAllTreeKeys = (nodes: any[]) => {
    let keys: string[] = [];
    nodes.forEach(node => {
        if (node.children?.length) {
            keys.push(node.key);
            keys = keys.concat(collectAllTreeKeys(node.children));
        }
    });
    return keys;
}

export const deleteNodesByKeys = (tree: WorkoutRoutineCategoryNode[], keys: string[]): WorkoutRoutineCategoryNode[] => {
    const updatedTree = [...tree];
    
    keys.forEach((key) => {
        const position = getNodePositionByKey(key, tree);
        const node = getNodeAtPosition(position, tree) as WorkoutRoutineGroupNode | WorkoutRoutineExerciseNode | undefined;
        const depth = position.length;
        if (node === undefined || depth <= 1) return;

        if (depth === 2) {
            if (node.children && node.children.length > 0) {
                // Insert children nodes into category after the target node
                updatedTree[position[0]].children?.splice(position[1] + 1, 0, ...node.children as WorkoutRoutineExerciseNode[]);
            }
            // Remove the target node
            updatedTree[position[0]].children?.splice(position[1], 1);
        } else {
            // Remove node at target
            updatedTree[position[0]].children?.[position[1]].children?.splice(position[2], 1);
        }
    });
    
    return updatedTree;
}
