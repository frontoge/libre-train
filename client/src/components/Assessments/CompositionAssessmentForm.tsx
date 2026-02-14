import { Button, DatePicker, Form, Input } from "antd";
import type { AssessmentFormProps, AssessmentFormValues } from "../../types/types";
import { AppContext } from "../../app-context";
import { useContext, useState } from "react";
import TextArea from "antd/es/input/TextArea";

export interface CompositionAssessmentFormProps extends AssessmentFormProps, React.ComponentProps<typeof Form> {
    assessmentTypeId: number;
}

export interface CompositionAssessmentFormValues extends AssessmentFormValues {
}

export function CompositionAssessmentForm(props: CompositionAssessmentFormProps) {
    const { state: { assessmentTypes }} = useContext(AppContext);
    const [form] = Form.useForm();
    const [isInvalidResult, setInvalidResult] = useState(false);

    const assessmentType = assessmentTypes?.find(type => type.id === props.assessmentTypeId);

    const handleReset = () => {
        form.resetFields();
        setInvalidResult(false);
    }

    const handleSubmit = (values: CompositionAssessmentFormValues) => {
        if (values.result === undefined || values.result.trim() === '') {
            setInvalidResult(true);
            return;
        }
        if (props.onSubmit) {
            props.onSubmit(values);
        }
        setInvalidResult(false);
    }
    return (
        
        <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            initialValues={props?.initialValues}
            style={{
                width: "100%"
            }}
        >
            <Form.Item label="Date" name="date">
                <DatePicker style={{
                    width: "40%"
                }} />
            </Form.Item>
            <Form.Item 
                label="Result" 
                name="result" 
                required
                validateStatus={isInvalidResult ? "error" : undefined}
                help={isInvalidResult ? "Invalid input" : undefined}
            >
                <Input 
                    suffix={assessmentType?.assessmentUnit ? assessmentType.assessmentUnit : undefined}
                    style={{
                        width: "40%"
                    }} 
                />
            </Form.Item>
            <Form.Item label="Notes" name="notes">
                <TextArea rows={6} placeholder="notes" />
            </Form.Item>
            <Form.Item>
                <div style={{
                    display: "flex",
                    justifyContent: 'end',
                    gap: "1rem",
                }}>
                    <Button type="primary" htmlType="submit">
                        Submit
                    </Button>
                    <Button htmlType="button" type="link" onClick={handleReset}>
                        Reset
                    </Button>
                </div>
                
            </Form.Item>
        </Form>
    )
}