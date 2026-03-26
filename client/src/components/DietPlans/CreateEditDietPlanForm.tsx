import { Button, Form, Input, InputNumber } from "antd";
import { ClientSearch } from "../clients/ClientSearch";

export interface CreateEditDietPlanFormValues {
    clientId: string;
    planName?: string;
    targetCalories: number;
    targetProtein: number;
    targetCarbs: number;
    targetFats: number;
    notes?: string;
}

export interface CreateEditDietPlanFormProps extends React.ComponentProps<typeof Form<CreateEditDietPlanFormValues>> {
    isEdit?: boolean;
}


export function CreateEditDietPlanForm(props: CreateEditDietPlanFormProps) {
    const { isEdit, initialValues, ...formProps } = props;
    const [form] = Form.useForm();

    return (
        <Form<CreateEditDietPlanFormValues>
            form={form}
            layout="vertical"
            initialValues={initialValues}
            {...formProps}
        >
            <Form.Item label="Client" name="clientId" required >
                <ClientSearch disabled={isEdit} />
            </Form.Item>
            <Form.Item label="Plan Name" name="planName">
                <Input />
            </Form.Item>
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                width: '100%',
            }}>
                <Form.Item label="Calories" name="targetCalories" required style={{width: '25%'}}>
                    <InputNumber suffix="kcal" style={{width: '100%'}}/>
                </Form.Item>
                <Form.Item label="Protein" name="targetProtein" required style={{width: '25%'}}>
                    <InputNumber suffix="g" style={{width: '100%'}}/>
                </Form.Item>
                <Form.Item label="Carbs" name="targetCarbs" required style={{width: '25%'}}>
                    <InputNumber suffix="g" style={{width: '100%'}}/>
                </Form.Item>
                <Form.Item label="Fats" name="targetFats" required style={{width: '25%'}}>
                    <InputNumber suffix="g" style={{width: '100%'}}/>
                </Form.Item>

            </div>
            <Form.Item label="Notes" name="notes">
                <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                    }}
                >
                        <Button onClick={() => form.resetFields()} type="default">Reset</Button>
                        <Button htmlType="submit" type="primary">Submit</Button>   
                </div>
            </Form.Item>
        </Form>
    )
}