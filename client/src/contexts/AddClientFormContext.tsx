import React from "react";

import { type AddClientFormValues } from "../../../shared/types";

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
        weight: undefined,
        body_fat: undefined,
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