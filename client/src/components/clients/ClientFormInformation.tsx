import { Input, InputNumber } from "antd"
import React from "react";
import { AddClientFormContext, type AddClientFormValues } from "../../contexts/AddClientFormContext";

export default function ClientFormInformation() {

    const { formValues, setFormValues } = React.useContext(AddClientFormContext);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormValues((prev: AddClientFormValues) => ({
                    ...prev,
                    information: {
                        ...prev.information,
                        img64: reader.result as string
                    }
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div style={{
            height: '50%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: '1rem',
        }}>
            <h3 style={{
                margin: 0,
                alignSelf: 'center',
                fontSize: '1.5rem'
            }}>
                Basic Information
            </h3>
            <div style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: 'repeat(3, 1fr)',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <Input placeholder="First Name" style={{ width: '100%' }} value={formValues.information.firstName} onChange={(e) => setFormValues(prev => ({...prev, information: {...prev.information, firstName: e.target.value}}))} />
                <Input placeholder="Last Name" style={{ width: '100%' }} value={formValues.information.lastName} onChange={(e) => setFormValues(prev => ({...prev, information: {...prev.information, lastName: e.target.value}}))} />
                <Input type="tel" placeholder="Phone Number" style={{ width: '100%' }} value={formValues.information.phone} onChange={(e) => setFormValues(prev => ({...prev, information: {...prev.information, phone: e.target.value}}))} />
                <Input placeholder="Email" style={{ width: '100%' }} value={formValues.information.email} onChange={(e) => setFormValues(prev => ({...prev, information: {...prev.information, email: e.target.value}}))} />
                <InputNumber placeholder="Height" style={{ width: '100%' }} min={0} suffix={"in"} value={formValues.information.height} onChange={(val) => setFormValues(prev => ({...prev, information: {...prev.information, height: val === null ? undefined : val}}))} />
                <InputNumber placeholder="Age" style={{ width: '100%' }} min={0} value={formValues.information.age} onChange={(val) => setFormValues(prev => ({...prev, information: {...prev.information, age: val === null ? undefined : val}}))} />
            </div>
            <input 
                type="file"
                accept=".jpg,.jpeg,.png"
                onChange={handleFileUpload}
            />
        </div>
    )
}