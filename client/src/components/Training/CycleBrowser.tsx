import { Segmented } from 'antd';
import { useEffect, useState } from 'react';
import { cycleTypeOptions } from '../../helpers/enum-select-options';
import { fetchClientMacrocycles, fetchClientMesocycles, fetchClientMicrocycles } from '../../helpers/training-helpers';
import { MacrocycleDisplay } from './MacrocycleDisplay';
import { MesocycleDisplay } from './MesocycleDisplay';
import { MicrocycleDisplay } from './MicrocycleDisplay';

export interface CycleBrowserProps extends React.HTMLAttributes<HTMLDivElement> {
	clientId?: number;
}

export function CycleBrowser(props: CycleBrowserProps) {
	const { clientId, ...divProps } = props;
	const [selectedCycleType, setSelectedCycleType] = useState<number>(0);
	const [cycleData, setCycleData] = useState<any[]>([]);

	const fetchCycleData = async (clientId: number) => {
		const responses = await Promise.all([
			fetchClientMacrocycles(clientId),
			fetchClientMesocycles(clientId),
			fetchClientMicrocycles(clientId),
		]);
		setCycleData(responses);
	};

	useEffect(() => {
		// Fetch macro/meso/microcycle data for the client
		if (!clientId) return;
		fetchCycleData(clientId);
	}, [props.clientId]);

	const handleChange = () => {
		if (!clientId) return;
		fetchCycleData(clientId);
	};

	const segmentOptions = [
		...cycleTypeOptions.map((option, index) => ({
			label: option.label + 's',
			value: option.value - 1,
			disabled: cycleData[option.value - 1] === undefined || cycleData[option.value - 1].length === 0,
		})),
	];

	return (
		<div
			{...divProps}
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: '1rem',
				height: '100%',
				overflow: 'hidden',
				...divProps.style,
			}}
		>
			<Segmented
				options={segmentOptions}
				value={selectedCycleType}
				onChange={setSelectedCycleType}
				size="large"
				style={{
					width: 'fit-content',
				}}
			/>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					overflowY: 'auto',
					height: '100%',
					maxHeight: '100%',
					paddingBottom: '1rem',
				}}
			>
				{cycleData[selectedCycleType]?.map((cycle) => {
					if (selectedCycleType === 0) {
						return <MacrocycleDisplay key={1} onChange={handleChange} macrocycle={cycle} />;
					} else if (selectedCycleType === 1) {
						return <MesocycleDisplay key={1} onChange={handleChange} mesocycle={cycle} />;
					} else if (selectedCycleType === 2) {
						return <MicrocycleDisplay key={1} onChange={handleChange} microcycle={cycle} />;
					}
				})}
			</div>
		</div>
	);
}
