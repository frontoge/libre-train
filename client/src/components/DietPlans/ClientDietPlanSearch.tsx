import { Segmented } from 'antd';
import Search from 'antd/es/input/Search';
import { useEffect, useState } from 'react';

export interface ClientDietPlanSearchProps extends React.ComponentProps<'div'> {
	searchProps?: React.ComponentProps<typeof Search>;
	onSearchChange?: (search: any) => void;
}

export type ClientDietPlanSearch = {
	searchText: string;
	hasPlan: 'both' | 'yes' | 'no';
};

export function ClientDietPlanSearch(props: ClientDietPlanSearchProps) {
	const { searchProps, onSearchChange, style: divStyle, ...divProps } = props;
	const [searchValues, setSearchValues] = useState<ClientDietPlanSearch>({
		searchText: '',
		hasPlan: 'both',
	});

	const planOptions = [
		{ label: 'Both', value: 'both' },
		{ label: 'Yes', value: 'yes' },
		{ label: 'No', value: 'no' },
	];

	useEffect(() => {
		if (onSearchChange) {
			onSearchChange(searchValues);
		}
	}, [searchValues]);

	return (
		<div
			{...divProps}
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: '1rem',
				...divStyle,
			}}
		>
			<Search
				placeholder="Search clients..."
				onSearch={(value) => setSearchValues((prev) => ({ ...prev, searchText: value }))}
				onClear={() => setSearchValues((prev) => ({ ...prev, searchText: '' }))}
				allowClear
				{...searchProps}
			/>
			<div
				style={{
					textWrap: 'nowrap',
				}}
			>
				Has Plan:
			</div>
			<Segmented
				options={planOptions}
				onChange={(value) => setSearchValues((prev) => ({ ...prev, hasPlan: value as 'both' | 'yes' | 'no' }))}
			/>
		</div>
	);
}
