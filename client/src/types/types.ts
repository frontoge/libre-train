import type { TreeDataNode } from "antd";
import type { MenuProps } from "antd/es/menu/menu";
import type { Dayjs } from "dayjs";
import type { PlannedExercise, PlannedExerciseGroup, WorkoutRoutine } from "../../../shared/models";

export type MenuItem = Required<MenuProps>['items'][number];

export type NavMenuItem = MenuItem & {
    urlPath?: string;
    children?: NavMenuItem[];
};

export type ClientListMenuItem = MenuItem;

export type DashboardSummaryState = {
    weight?: number | string;
    weightDiff?: number;
    calories?: number | string;
    caloriesDiff?: number;
    bodyFat?: number | string;
    bodyFatDiff?: number;
    leanMass?: number | string;
    leanMassDiff?: number;
    calorieDeficiency?: number | string;
    bmr?: number | string;
    macroAdherence?: number | string;
}

export type ContactEditCreateFormValues = {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    dob?: Dayjs;
}

export type ClientEditCreateFormValues = {
    height?: number;
    notes?: string;
}

export enum ModalType {
    DeleteClient
};

export interface AssessmentFormValues {
    date?: Dayjs;
    result: string;
    notes?: string;
}

export interface AssessmentFormProps {
    onSubmit: (result: AssessmentFormValues) => void;
}

export enum WorkoutNodeType {
    Category = 1,
    Group = 2,
    Exercise = 3
}

export interface WorkoutRoutineExerciseNode extends TreeDataNode {
    nodeType: WorkoutNodeType.Exercise;
    data: PlannedExercise;
    title: string;
    restAfter?: number;
}

export interface WorkoutRoutineGroupNode extends TreeDataNode{
    nodeType: WorkoutNodeType.Group;
    title: string;
    data: Omit<PlannedExerciseGroup, 'exercises' | 'routine_category'>;
    children: WorkoutRoutineExerciseNode[];
}

export interface WorkoutRoutineCategoryNode extends TreeDataNode {
    nodeType: WorkoutNodeType.Category;
    title: string;
    children: Array<WorkoutRoutineGroupNode | WorkoutRoutineExerciseNode>;
}

export type WorkoutRoutineTreeNode = WorkoutRoutineCategoryNode | WorkoutRoutineGroupNode | WorkoutRoutineExerciseNode;

export type WorkoutRoutineEdit = Omit<WorkoutRoutine, 'id' | 'routine_index' | 'isActive'>

export type ClientDietPlanTableData = {
    planId?: number;
    clientId?: number;
    name: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}