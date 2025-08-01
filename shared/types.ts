export type Client = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    img?: string;
    height?: number;
    age?: number;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export type Goal = {
    id: number;
    goal: string;
}

export type AddClientFormValues = {
    information: {
        firstName?: string;
        lastName?: string;
        phone?: string;
        email?: string;
        height?: number;
        age?: number;
        img64?: string;
        notes?: string;
    },
    goals: {
        goal?: number;
        targetWeight?: number;
        targetBodyFat?: number;
        targetLeanMass?: number;
        targetDate?: Date;
    },
    measurements: {
        weight?: number;
        body_fat?: number;
        wrist?: number;
        calves?: number;
        biceps?: number;
        chest?: number;
        thighs?: number;
        waist?: number;
        shoulders?: number;
        hips?: number;
        forearm?: number;
        neck?: number;
    },
}

export type DailyUpdateData = {
    weight?: number;
    body_fat?: number;
    calories?: number;
    target_calories?: number;
    protein?: number;
    target_protein?: number;
    carbs?: number;
    target_carbs?: number;
    fats?: number;
    target_fats?: number;
}

export type DailyUpdateRequest = {
    clientId: number;
    date: string; // ISO string
    data: DailyUpdateData;
}