import { Button, DatePicker, Form, Select } from "antd";
import { AssessmentTypeSelect } from "./AssessmentTypeSelect";
import type { Dayjs } from "dayjs";
import { AssessmentGroup } from "../../../../shared/models";

export type AssessmentFilterOptionsValues = {
    startDate?: Dayjs;
    endDate?: Dayjs;
    group?: string;
    assessmentType?: string;
}

export interface AssessmentFilterOptionsProps extends React.ComponentProps<typeof Form> {
    onApplyFilters?: (values: AssessmentFilterOptionsValues) => void;
    onResetFilters?: () => void;
}

export function AssessmentFilterOptions(props: AssessmentFilterOptionsProps) {
    const [form] = Form.useForm();

    const { onApplyFilters, onResetFilters, ...formProps } = props;

    const handleApplyFilters = (values: Omit<AssessmentFilterOptionsValues, 'assessmentType'> & { assessmentType?: any }) => {
        props.onApplyFilters?.(values);
    }

    const handleClearFilters = () => {
        form.resetFields();
        props.onResetFilters?.();
    }

    const assessmentGroupOptions = [
        { label: "Posture Assessment", value: AssessmentGroup.Posture},
        { label: "Composition Assessment", value: AssessmentGroup.Composition},
        { label: "Performance Assessment", value: AssessmentGroup.Performance},
    ]

    return (
        <Form 
            layout="horizontal" 
            form={form}
            labelCol={{ span: 7 }} 
            wrapperCol={{ span: 16, offset: 1 }} 
            onFinish={handleApplyFilters}
            {...formProps}
        >
            <Form.Item label="Dates" name="dateRange">
                <div style={{
                    display: "flex",
                    gap: "1rem"
                }}>
                    <Form.Item name="startDate" noStyle>
                        <DatePicker placeholder="Start Date" />
                    </Form.Item>
                    <Form.Item name="endDate" noStyle>
                        <DatePicker placeholder="End Date" />
                    </Form.Item>
                </div>
            </Form.Item>
            <Form.Item label="Group" name="group">
                <Select placeholder="Assessment Group"
                    options={assessmentGroupOptions}
                    allowClear
                >
                </Select>
            </Form.Item>
            <Form.Item label="Assessment" name="assessmentType">
                <AssessmentTypeSelect />
            </Form.Item>
            <Form.Item wrapperCol={{}}>
                <div style={{
                    display: "flex",
                    justifyContent: 'flex-end',
                    gap: "1rem"
                }}>
                    <Button color="primary" variant="solid" htmlType="submit">
                        Apply
                    </Button>
                    <Button htmlType="button" type="link" onClick={handleClearFilters}>
                        Reset
                    </Button>
                </div>
            </Form.Item>
        </Form>
    )
}