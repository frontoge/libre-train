export type TargetMetric = {
    id: number;
    metric_name: string;
    target_unit: string;
}

export type WorkoutRoutineStage = {
    id: number;
    stage_name: string;
}

export type Contact = {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    date_of_birth?: string; 
    img?: string;
    notes?: string;
}

export type Client = {
    id: number;
    height?: number;
    created_at: Date;
    updated_at: Date;
}

export type ClientContact = Client & Omit<Contact, "id">;

export type AssessmentType = {
    id: number;
    name: string;
    assessmentUnit: string;
    assessmentGroupId: number;
}

export type AssessmentClientLog = {
    id: number;
    clientId: number;
    assessmentTypeId: number;
    assessmentValue: string;
    assessmentDate: string;
    notes?: string;
}

export enum AssessmentGroup {
    Posture = 1,
    Composition = 2,
    Performance = 3,
}