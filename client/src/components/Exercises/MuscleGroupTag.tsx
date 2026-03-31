import type { MuscleGroup } from '@libre-train/shared';
import { Tag, type SelectProps } from 'antd';
import { muscleGroupColors } from '../../helpers/label-formatters';

type TagRender = SelectProps['tagRender'];

export interface MuscleGroupTagProps extends React.ComponentProps<typeof Tag> {
	label: React.ReactNode;
	value: MuscleGroup;
	closable?: boolean;
	onClose?: () => void;
}

export const MuscleGroupTag = (props: MuscleGroupTagProps) => {
	const { label, value, closable, onClose, ...tagProps } = props;

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
			{...tagProps}
		>
			{label}
		</Tag>
	);
};
