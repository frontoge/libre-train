import { Button, Form, Input, Select, Tag, type FormProps, type SelectProps } from "antd";
import { muscleGroupOptions, muscleValueToColor } from "../../../../shared/MuscleGroups";
import { Panel } from "../Panel";
import { getAppConfiguration } from "../../config/app.config";
import { Routes } from "../../../../shared/routes";
import { useContext } from "react";
import { ExerciseContext } from "../../contexts/ExercisesContext";

type FieldType = {
    name?: string;
    muscleGroups?: string[];
    description?: string;
    videoLink?: string;
}

type TagRender = SelectProps['tagRender']

const tagRender: TagRender = (props) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  console.log(props, value)
  return (
    <Tag
      color={muscleValueToColor[value as string] ?? 'gray'}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {label}
    </Tag>
  );
};



export function AddExercise() {

    const {refreshExercises} = useContext(ExerciseContext);

    const [form] = Form.useForm();

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        console.log('Success:', values);
        const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.ExerciseCreate}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });

        if (response.ok) {
            form.resetFields();
            refreshExercises();
        } else {
            console.error('Failed to add exercise');
        }
    }

    return (
        <Panel style={{
            display: 'flex',
            gap: '2rem',
            flexDirection: 'column',
            height: '100%',
        }}>
            <h2 style={{alignSelf: 'center'}}>Add New Exercise</h2>
            <Form 
                name={'add-exercise'}
                style={{color: "white", width: "85%", display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'end'}}
                onFinish={onFinish}
                onFinishFailed={() => {}}
                form={form}
                labelCol={{ span: 8 }}
                autoComplete="off"
            >
                <Form.Item<FieldType>
                    name="name"
                    label="Exercise Name"
                    rules={[{required: true, message: "Please input an exercise name"}]}
                >
                    <Input />

                </Form.Item>
                <Form.Item<FieldType>
                    name="muscleGroups"
                    label="Muscle Groups"
                    style={{
                        width: '100%'
                    }}
                >
                    <Select 
                        mode="multiple"
                        allowClear
                        style={{ width: '100%' }}
                        placeholder="Please select muscle groups"
                        tagRender={tagRender}
                        options={muscleGroupOptions}
                    >
                    </Select>
                </Form.Item>
                <Form.Item<FieldType>
                    name="description"
                    label="Description"
                >
                    <Input.TextArea rows={4} maxLength={255}/>
                </Form.Item>
                <Form.Item<FieldType>
                    name="videoLink"
                    label="Video Link"
                >
                    <Input maxLength={512}/>
                </Form.Item>
                <Form.Item label={null}>
                    <Button type="primary" htmlType="submit">
                        Add Exercise
                    </Button>
                </Form.Item>
            </Form>
        </Panel>
    )
}