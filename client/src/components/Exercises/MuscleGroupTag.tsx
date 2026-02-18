import { Tag, type SelectProps } from "antd";
import { muscleGroupColors } from "../../helpers/label-formatters";
import type { MuscleGroup } from "../../../../shared/models";

type TagRender = SelectProps['tagRender'];

export type MuscleGroupTagProps = {
    label: React.ReactNode;
    value: MuscleGroup;
    closable?: boolean;
    onClose?: () => void;
}

export const MuscleGroupTag: TagRender = (props: MuscleGroupTagProps) => {
    const { label, value, closable, onClose } = props;

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const color = muscleGroupColors[value] || 'default';

    return (
        <Tag
            color={color}
            onMouseDown={onPreventMouseDown}
            closable={closable}
            onClose={onClose}
            style={{ marginInlineEnd: 4 }}
        >
            {label}
        </Tag>
    );
}