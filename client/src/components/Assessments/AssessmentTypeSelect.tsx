import { AssessmentGroup } from '@libre-train/shared';
import { Select, type SelectProps } from 'antd';
import { useContext, useState } from 'react';
import { AppContext } from '../../app-context';
import { compareStrings } from '../../helpers/filter-helpers';

export interface AssessmentTypeSelectProps extends Omit<SelectProps, 'options' | 'onChange'> {
	onAssessmentTypeSelect?: (assessmentTypeId: string) => void;
}

export function AssessmentTypeSelect(props: AssessmentTypeSelectProps) {
	const {
		state: { assessmentTypes },
	} = useContext(AppContext);

	const { onAssessmentTypeSelect, ...otherProps } = props;

	const getOptions = (search?: string) => {
		const similarityThreshold = 0.3; // Adjust this threshold as needed
		const groupedOptions = [];

		const postureOptions =
			assessmentTypes
				?.filter((type) => type.assessmentGroupId === AssessmentGroup.Posture)
				.filter((type) => !search || compareStrings(search, type.name, similarityThreshold))
				.map((type) => ({
					label: type.name,
					value: type.id,
				})) || [];

		const compositionOptions =
			assessmentTypes
				?.filter((type) => type.assessmentGroupId === AssessmentGroup.Composition)
				.filter((type) => !search || compareStrings(search, type.name, similarityThreshold))
				.map((type) => ({
					label: type.name,
					value: type.id,
				})) || [];

		const performanceOptions =
			assessmentTypes
				?.filter((type) => type.assessmentGroupId === AssessmentGroup.Performance)
				.filter((type) => !search || compareStrings(search, type.name, similarityThreshold))
				.map((type) => ({
					label: type.name,
					value: type.id,
				})) || [];

		postureOptions.length > 0
			&& groupedOptions.push({
				label: <span>Posture</span>,
				title: 'Posture',
				options: postureOptions,
			});

		compositionOptions.length > 0
			&& groupedOptions.push({
				label: <span>Composition</span>,
				title: 'Composition',
				options: compositionOptions,
			});

		performanceOptions.length > 0
			&& groupedOptions.push({
				label: <span>Performance</span>,
				title: 'Performance',
				options: performanceOptions,
			});

		return groupedOptions;
	};

	const [options, setOptions] = useState(getOptions());

	const handleOptionSearch = (search: string) => {
		setOptions(getOptions(search));
	};

	const handleChange = (assessmentTypeId: string) => {
		onAssessmentTypeSelect?.(assessmentTypeId);
	};

	return (
		<Select
			placeholder="Select an assessment type"
			style={{ width: '100%' }}
			options={options}
			showSearch={{
				onSearch: handleOptionSearch,
				filterOption: false,
			}}
			onChange={handleChange}
			{...otherProps}
		></Select>
	);
}
