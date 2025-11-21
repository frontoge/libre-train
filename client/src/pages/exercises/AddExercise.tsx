import { Button, Form, Input, Layout, Select, Tag, type FormProps, type SelectProps } from "antd";
import { Content } from "antd/es/layout/layout";
import { muscleGroupOptions, muscleValueToColor } from "./MuscleGroups";

type FieldType = {
    name?: string;
    muscleGroups?: string[];
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

const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {

}

export function AddExercise() {
    return (
        <Layout style={{
            height: "100%",
            width: "100%",
            color: "white",
        }}>
            <Content style={{
                display: 'flex',
                gap: '2rem',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                marginTop: "2rem",
            }}>
                <h1>Add New Exercise</h1>
                <Form 
                    name={'add-exercise'}
                    style={{color: "white", gap: "1rem", width: "85%", display: 'flex', flexDirection: 'column', alignItems: 'center'}}
                    onFinish={() =>  {}}
                    onFinishFailed={() => {}}
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
                            width: '100%',
                            height: "5rem"
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
                    <Form.Item label={null}>
                        <Button type="primary" htmlType="submit">
                            Add Exercise
                        </Button>
                    </Form.Item>
                </Form>
            </Content>
        </Layout>
    )
}