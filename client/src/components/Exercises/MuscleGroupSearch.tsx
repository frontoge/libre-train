import { Select } from 'antd';
import { muscleGroupOptions } from '../../helpers/enum-select-options';
import { compareStrings } from '../../helpers/filter-helpers';
import { MuscleGroupTag } from './MuscleGroupTag';

export function MuscleGroupSearch(props: React.ComponentProps<typeof Select>) {
	const handleSearch = (searchValue: string, option: any) => {
		return option?.label && compareStrings(searchValue, String(option.label));
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
