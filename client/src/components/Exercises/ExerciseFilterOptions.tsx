import { Button, Form, Rate, Select } from "antd"
import { exerciseFormOptions, exerciseMovementPatternOptions } from "../../helpers/enum-select-options";
import { MuscleGroupSearch } from "./MuscleGroupSearch";

export interface ExerciseFilterOptionsValues {
    movementPattern?: number;
    exerciseType?: number;
    muscleGroups?: number[];
    progressionLevel?: number;
}

export interface ExerciseFilterOptionsProps extends React.ComponentProps<typeof Form> {
    onApplyFilters?: (values: ExerciseFilterOptionsValues) => void;
    onResetFilters?: () => void;
}

export function ExerciseFilterOptions(props: ExerciseFilterOptionsProps) {
    const [form] = Form.useForm();

    const handleApplyFilters = (values: ExerciseFilterOptionsValues) => {
        if (props.onApplyFilters) {
            props.onApplyFilters(values);
        }
    }

    const handleResetFilters = () => {
        form.resetFields();
        if (props.onResetFilters) {
            props.onResetFilters();
        }
    }
    
    return (
        <Form
            form={form}
            layout="horizontal"
            labelCol={{span: 10}}
            wrapperCol={{span: 20, offset: 1}}
            onFinish={handleApplyFilters}
            style={{
                width: "400px",
            }}
            {...props}
        >
            <Form.Item label="Movement Pattern" name="movementPattern">
                <Select placeholder="Movement pattern" allowClear options={exerciseMovementPatternOptions}/>
            </Form.Item>
            <Form.Item label="Type" name="exerciseType">
                <Select placeholder="Exercise type" allowClear options={exerciseFormOptions}/>
            </Form.Item>

            <Form.Item label="Muscle Groups" name="muscleGroups">
                <MuscleGroupSearch defaultValue={props.initialValues?.muscleGroups}/>
            </Form.Item>
            <Form.Item label="Progression Level" name="progressionLevel">
                <Rate character={({ index = 0 }) => index + 1} allowClear/>
            </Form.Item>
            <Form.Item wrapperCol={{}}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                }}>
                    <Button color="primary" variant="solid" htmlType="submit">Apply</Button>
                    <Button onClick={handleResetFilters}>Clear</Button>
                </div>
            </Form.Item>
        </Form>
    )
}