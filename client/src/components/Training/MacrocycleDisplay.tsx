import type { Macrocycle, Mesocycle } from '@libre-train/shared';
import { Card, Popconfirm, Result, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { MdEdit } from 'react-icons/md';
import dayjs from '../../config/dayjs';
import { deleteMacrocycle } from '../../helpers/api';
import { fetchChildMesocycles } from '../../helpers/training-helpers';
import { useMessage } from '../../hooks/useMessage';
import { MesocycleCard } from './MesocycleCard';

export interface MacrocycleDisplayProps extends React.ComponentProps<typeof Card> {
	macrocycle: Macrocycle;
	onChange?: () => void;
}

export function MacrocycleDisplay(props: MacrocycleDisplayProps) {
	const [isLoading, setIsLoading] = useState(true);
	const [subCards, setSubCards] = useState<Mesocycle[]>([]);
	const showMessage = useMessage();

	const gridStyle: React.CSSProperties = {
		width: subCards.length >= 5 ? 'calc(100% / 6)' : `calc(100% / ${subCards.length})`,
		padding: '0.25rem',
	};

	const handleDelete = async () => {
		try {
			await deleteMacrocycle(props.macrocycle.id);
			showMessage('success', 'Macrocycle deleted successfully');
			props.onChange?.();
		} catch (error) {
			console.error('Error deleting macrocycle:', error);
			showMessage('error', 'Error deleting macrocycle');
		}
	};

	const handleEdit = () => {};

	const fetchMesocycles = async () => {
		setIsLoading(true);
		const mesocycles = await fetchChildMesocycles(props.macrocycle.id, props.macrocycle.client_id);
		mesocycles.sort((a, b) => new Date(a.cycle_start_date).getTime() - new Date(b.cycle_start_date).getTime());
		setSubCards(mesocycles);
		setIsLoading(false);
	};

	useEffect(() => {
		fetchMesocycles();
	}, [props.macrocycle]);

	const cardActions = [
		<div key="edit" style={{ width: '100%' }} onClick={handleEdit}>
			<MdEdit onClick={handleEdit} />
		</div>,
		<Popconfirm
			key="delete"
			title="Are you sure you want to delete this macrocycle? This action cannot be undone."
			onConfirm={handleDelete}
		>
			<div key="delete" style={{ width: '100%' }}>
				<FaTrash />
			</div>
		</Popconfirm>,
	];

	const loadingSkeleton = Array.from({ length: 6 }).map((_, index) => (
		<Card.Grid
			key={index}
			style={{
				width: 'calc(100% / 6)',
				padding: '0.25rem',
			}}
		>
			<Skeleton active>
				<MesocycleCard />
			</Skeleton>
		</Card.Grid>
	));

	const resultContent =
		subCards.length > 0 ? (
			subCards.map((subCard, index) => (
				<Card.Grid key={index} style={gridStyle}>
					<MesocycleCard mesocycleData={subCard} index={index} />
				</Card.Grid>
			))
		) : (
			<Result
				status="warning"
				title="No Mesocycles Available"
				subTitle="There are no mesocycles to display for this macrocycle."
			/>
		);

	return (
		<Card
			title={`${props.macrocycle.cycle_name} (${dayjs(props.macrocycle.cycle_start_date).format('YYYY-MM-DD')} - ${dayjs(props.macrocycle.cycle_end_date).format('YYYY-MM-DD')})`}
			actions={cardActions}
			{...props}
		>
			{isLoading ? loadingSkeleton : resultContent}
		</Card>
	);
}
