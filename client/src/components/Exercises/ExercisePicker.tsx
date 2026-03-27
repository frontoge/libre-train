import { Button, Popover, Select } from 'antd';
import { useContext, useState } from 'react';
import { MdFilterList } from 'react-icons/md';
import { stringSimilarity } from 'string-similarity-js';
import { AppContext } from '../../app-context';
import { applyExerciseTableFilters } from '../../helpers/filter-helpers';
import { ExerciseFilterOptions, type ExerciseFilterOptionsValues } from './ExerciseFilterOptions';

export interface ExercisePickerProps extends React.ComponentProps<typeof Select> {
	divProps?: React.ComponentProps<'div'>;
	popoverProps?: React.ComponentProps<typeof Popover>;
}

export function ExercisePicker(props: ExercisePickerProps) {
	const { divProps, popoverProps, ...selectProps } = props;
	const {
		state: { exerciseData },
	} = useContext(AppContext);
	const [filtersVisible, setFiltersVisible] = useState(false);
	const [filterOptions, setFilterOptions] = useState<ExerciseFilterOptionsValues>({});

	const handleApplyFilters = (values: ExerciseFilterOptionsValues) => {
		setFilterOptions(values);
	};

	const handleResetFilters = () => {
		setFilterOptions({});
	};

	const filteredData = applyExerciseTableFilters(exerciseData ?? [], filterOptions);

	const selectOptions = filteredData.map((exercise) => ({
		label: exercise.exercise_name,
		value: exercise.id,
	}));

	return (
		<div
			{...divProps}
			style={{
				display: 'flex',
				gap: '0.5rem',
				...divProps?.style,
			}}
		>
			<Select
				placeholder="Search exercises..."
				allowClear
				options={selectOptions}
				showSearch
				filterOption={(input, option) => {
					return stringSimilarity(option?.label ?? '', input) > 0.3;
				}}
				{...selectProps}
			/>
			<Popover
				title="Filters"
				trigger="click"
				placement="rightBottom"
				content={<ExerciseFilterOptions onApplyFilters={handleApplyFilters} onResetFilters={handleResetFilters} />}
				open={filtersVisible}
				onOpenChange={(open) => setFiltersVisible(open)}
				{...popoverProps}
			>
				<Button icon={<MdFilterList />} />
			</Popover>
		</div>
	);
}
