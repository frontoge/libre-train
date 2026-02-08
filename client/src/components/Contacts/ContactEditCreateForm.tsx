import { Button, DatePicker, Form, Input } from "antd"
import type { ContactEditCreateFormValues } from "../../types/types";
import { useState } from "react";

type FormItemValidationStatus = {
    validateStatus?: "success" | "warning" | "error" | "validating";
    help?: string;
}

export interface ContactEditCreateFormProps {
    onSubmit: (values: ContactEditCreateFormValues) => boolean | undefined;
    onCancel?: () => void;
    initialValues?: ContactEditCreateFormValues;
    onError?: (error: any) => void;
}

export function ContactEditCreateForm(props: ContactEditCreateFormProps) {

    const [form] = Form.useForm();
    const [validationStatuses, setValidationStatuses] = useState<{ [key: string]: FormItemValidationStatus }>({});

    const validateFormValues = (values: ContactEditCreateFormValues): boolean => {
        var returnValue = true;

        if (!values.firstName || values.firstName.trim() === "") {
            setValidationStatuses(prev => ({
                firstName: {
                    validateStatus: "error",
                    help: "First name is required."
                }
            }));
            returnValue = false;
        }

        if (!values.lastName || values.lastName.trim() === "") {
            setValidationStatuses(prev => ({
                ...prev,
                lastName: {
                    validateStatus: "error",
                    help: "Last name is required."
                }
            }));
            returnValue = false;
        }

        if (!values.email || values.email.trim() === "") {
            setValidationStatuses(prev => ({
                ...prev,
                email: {
                    validateStatus: "error",
                    help: "Email is required."
                }
            }));
            returnValue = false;
        } else if (!/\S+@\S+\.\S+/.test(values.email)) {
            setValidationStatuses(prev => ({
                ...prev,
                email: {
                    validateStatus: "error",
                    help: "Email is not valid."
                }
            }));
            returnValue = false;
        }

        return returnValue;
    }

    const onFinish = (values: ContactEditCreateFormValues) => {
        try {
            if (validateFormValues(values)) {
                const result = props.onSubmit(values);
                if (result === undefined || result === true) {
                    form.resetFields();
                }
            }
        } catch (error) {
            if (props.onError) {
                props.onError(error);
            }
        }
    }

    const onReset = () => {
        setValidationStatuses({});
        form.resetFields();
    }

    return (
        <div id="contact-edit-create-form-container" style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <h3 style={{
                fontSize: "1.25rem",
            }}>
                Contact Information
            </h3>
            <Form 
                form={form} 
                layout="horizontal" 
                labelCol={{ span: 12 }} 
                wrapperCol={{ span: 14 }} 
                variant="filled"
                onFinish={onFinish}
                name="contact-edit-create-form"
            >
                <Form.Item label="First Name" required name="firstName" validateStatus={validationStatuses.firstName?.validateStatus} help={validationStatuses.firstName?.help}>
                    <Input defaultValue={props.initialValues?.firstName} />
                </Form.Item>
                <Form.Item label="Last Name" required name="lastName" validateStatus={validationStatuses.lastName?.validateStatus} help={validationStatuses.lastName?.help}>
                    <Input defaultValue={props.initialValues?.lastName} />
                </Form.Item>
                <Form.Item label="Email" required name="email" validateStatus={validationStatuses.email?.validateStatus} help={validationStatuses.email?.help}>
                    <Input defaultValue={props.initialValues?.email} />
                </Form.Item>
                <Form.Item label="Phone Number" name="phoneNumber">
                    <Input defaultValue={props.initialValues?.phoneNumber} />
                </Form.Item>
                <Form.Item label="DoB" name="dob">
                    <DatePicker defaultValue={props.initialValues?.dob} />
                </Form.Item>
                <Form.Item wrapperCol={{offset: props.onCancel ? 5 : 12}}>
                    <div style={{
                        display: "flex",
                        gap: "1rem",
                    }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                        <Button htmlType="button" type="link" onClick={onReset}>
                            Reset
                        </Button>
                        {props.onCancel && (
                            <Button htmlType="button" color="danger" variant="solid" onClick={props.onCancel}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    
                </Form.Item>
            </Form>
        </div>
    )
}