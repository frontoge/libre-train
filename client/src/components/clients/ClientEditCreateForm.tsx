import { Button, Form, InputNumber } from "antd";
import TextArea from "antd/es/input/TextArea";
import type { ClientEditCreateFormValues } from "../../types/types";

export interface ClientEditCreateFormProps {
    onCancel?: () => void;
    onSubmit?: (values: ClientEditCreateFormValues) => boolean | void;
    onError?: (error: any) => void;
    initialValues?: ClientEditCreateFormValues;
}

export function ClientEditCreateForm(props: ClientEditCreateFormProps) {

    const [form] = Form.useForm();

    const onFinish = (values: ClientEditCreateFormValues) => {
        try {
            const result = props.onSubmit?.(values);
            if (result === undefined || result === true) {
                form.resetFields();
            }

        } catch (error) {
            if (props.onError) {
                props.onError(error);
            }
        }
    }

    const onReset = () => {
        form.resetFields();
    }

    return (
        <div id="client-edit-create-form-container"
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
            }}
        >
            <h3>Client Information</h3>
            <Form
                form={form}
                style={{
                    width: "100%",
                }}
                labelCol={{span: 8}}
                layout="horizontal"
                variant="filled"
                name="client-edit-create-form"
                onFinish={onFinish}
            >
                <Form.Item 
                    label="Client height" 
                    name="height"
                    wrapperCol={{span: 12}}
                >
                    <InputNumber suffix="in." />
                </Form.Item>
                <Form.Item 
                    label="Client notes" 
                    name="notes"
                    wrapperCol={{span: 12}}
                >
                    <TextArea rows={4} maxLength={500} />
                </Form.Item>
                <Form.Item wrapperCol={{offset: props.onCancel ? 13 : 16}}>
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