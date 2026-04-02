import { Select } from 'antd';
import { stringSimilarity } from 'string-similarity-js';
import { muscleGroupOptions } from '../../helpers/enum-select-options';
import { MuscleGroupTag } from './MuscleGroupTag';

export function MuscleGroupSearch(props: React.ComponentProps<typeof Select>) {
	const handleSearch = (searchValue: string, option: any) => {
		return option?.label && stringSimilarity(searchValue, String(option.label)) > 0.3;
	};

	return (
		<Select
			placeholder="Muscle groups"
			allowClear
			mode="multiple"
			showSearch={{
				filterOption: handleSearch,
			}}
			tagRender={MuscleGroupTag}
			options={muscleGroupOptions}
			{...props}
		/>
	);
}
