import React from "react";

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

export const defaultFormValues: AddClientFormValues = {
    information: {
        firstName: undefined,
        lastName: undefined,
        phone: undefined,
        email: undefined,
        height: undefined,
        age: undefined,
        img64: undefined
    },
    goals: {
        goal: undefined,
        targetWeight: undefined,
        targetBodyFat: undefined,
        targetLeanMass: undefined,
        targetDate: undefined
    },
    measurements: {
        wrist: undefined,
        calves: undefined,
        biceps: undefined,
        chest: undefined,
        thighs: undefined,
        waist: undefined,
        shoulders: undefined,
        hips: undefined,
        forearm: undefined,
        neck: undefined
    }
}

export const AddClientFormContext = React.createContext<{
    formValues: AddClientFormValues,
    setFormValues: React.Dispatch<React.SetStateAction<AddClientFormValues>>}>
({formValues: defaultFormValues, setFormValues: () => {}});