import type { ClientDietPlan } from '@libre-train/shared';
import { Button, Popconfirm, Table } from 'antd';
import type { TableProps } from 'antd/es/table';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../app-context';
import { createDietPlan, deleteDietPlan, fetchClientDietPlansForTrainer } from '../../helpers/api';
import { compareStrings } from '../../helpers/filter-helpers';
import { useMessage } from '../../hooks/useMessage';
import type { ClientDietPlanTableData } from '../../types/types';
import { ClientDietPlanSearch } from './ClientDietPlanSearch';
import { ClientDietPlanTableColumns, getClientDietPlanTableData } from './ClientDietPlanTableColumns';
import type { CreateEditDietPlanFormValues } from './CreateEditDietPlanForm';
import { CreateEditDietPlanModal } from './CreateEditDietPlanModal';
import { ViewDietPlanModal } from './ViewDietPlanModal';

export type ClientDietPlanTableProps = Omit<TableProps<ClientDietPlanTableData>, 'columns' | 'dataSource'>;

export function ClientDietPlanTable(props: ClientDietPlanTableProps) {
	const {
		state: {
			auth: { user },
		},
	} = useContext(AppContext);
	const { ...tableProps } = props;
	const [clientPlans, setClientPlans] = useState<ClientDietPlan[]>([]);
	const [openModalType, setOpenModalType] = useState<'view' | 'edit' | 'create' | undefined>(undefined);
	const [selectedClientId, setSelectedClientId] = useState<number | undefined>(undefined);
	const showMessage = useMessage();
	const [searchParams, setSearchParams] = useState<ClientDietPlanSearch>({
		searchText: '',
		hasPlan: 'both',
	});

	const fetchClientPlans = async () => {
		try {
			if (!user) {
				console.error('No user found in context. Cannot fetch client diet plans.');
				return;
			}
			const results = await fetchClientDietPlansForTrainer(user);
			setClientPlans(results);
		} catch (error) {
			// show error notification
			console.error('Failed to fetch client diet plans:', error);
			showMessage('error', 'Failed to fetch client diet plans');
		}
	};

	useEffect(() => {
		fetchClientPlans();
	}, [user]);

	const handleSearchChange = (search: ClientDietPlanSearch) => {
		setSearchParams(search);
	};

	const handleEdit = (record: ClientDietPlanTableData) => {
		// Edit Diet plan modal
		setSelectedClientId(record.clientId);
		setOpenModalType('edit');
	};

	const handleCreate = (record: ClientDietPlanTableData) => {
		// Create Diet plan modal
		setSelectedClientId(record.clientId);
		setOpenModalType('create');
	};

	const handleRowClick = (record: ClientDietPlanTableData) => {
		// View Diet plan modal
		if (record.planId === undefined) {
			return;
		}
		setSelectedClientId(record.clientId);
		setOpenModalType('view');
	};

	const handleCloseModal = () => {
		setSelectedClientId(undefined);
		setOpenModalType(undefined);
	};

	const handleCreatePlan = async (values: CreateEditDietPlanFormValues) => {
		if (!user) {
			console.error('No user found in context. Cannot create diet plan.');
			return;
		}

		try {
			await createDietPlan({
				clientId: parseInt(values.clientId),
				trainerId: user,
				planName: values.planName ?? '',
				notes: values.notes,
				targetCalories: values.targetCalories,
				targetProtein: values.targetProtein,
				targetCarbs: values.targetCarbs,
				targetFats: values.targetFats,
			});
			showMessage('success', 'Diet plan created successfully');
			fetchClientPlans();
			handleCloseModal();
		} catch (error) {
			console.error('Failed to create diet plan', error);
			showMessage('error', 'Failed to create diet plan');
		}
	};

	const handleDeletePlan = async (dietPlanId: number | undefined) => {
		if (dietPlanId === undefined) {
			console.error('No diet plan ID provided for deletion.');
			return;
		}

		try {
			await deleteDietPlan(dietPlanId);
			fetchClientPlans();
			showMessage('success', 'Diet plan deleted successfully');
		} catch (error) {
			console.error('Failed to delete diet plan', error);
			showMessage('error', 'Failed to delete diet plan');
		}
	};

	const tablePlanData = useMemo(() => {
		return getClientDietPlanTableData(clientPlans);
	}, [clientPlans]);

	const filteredPlans = useMemo<ClientDietPlanTableData[]>(() => {
		return tablePlanData.filter((plan) => {
			if (searchParams.searchText.trim() !== '' && !compareStrings(plan.name, searchParams.searchText, 0.3)) {
				return false;
			}

			if (searchParams.hasPlan === 'yes' && plan.calories === undefined) {
				return false;
			}

			if (searchParams.hasPlan === 'no' && plan.calories !== undefined) {
				return false;
			}

			return true;
		});
	}, [tablePlanData, searchParams]);

	const selectedPlan = useMemo(() => {
		if (selectedClientId === undefined) {
			return undefined;
		}
		return clientPlans.find((plan) => plan.clientId === selectedClientId);
	}, [selectedClientId, clientPlans]);

	const tableColumns: NonNullable<TableProps<ClientDietPlanTableData>['columns']> = [
		...(ClientDietPlanTableColumns ?? []),
		{
			title: 'Actions',
			key: 'actions',
			width: '10%',
			render: (_value, record: ClientDietPlanTableData) => {
				const hasPlan = record.calories !== undefined;
				return (
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'end',
							gap: '1rem',
						}}
					>
						<Button
							color={hasPlan ? 'primary' : 'default'}
							variant={hasPlan ? 'solid' : 'filled'}
							onClick={() => (hasPlan ? handleEdit(record) : handleCreate(record))}
						>
							{hasPlan ? 'Edit' : 'Create'}
						</Button>
						{hasPlan && (
							<Popconfirm
								title="Are you sure you want to delete this diet plan?"
								onConfirm={() => handleDeletePlan(record.planId)}
								okText="Yes"
								cancelText="No"
							>
								<Button color="danger" variant="solid">
									Delete
								</Button>
							</Popconfirm>
						)}
					</div>
				);
			},
		},
	];

	const tableHeader = (
		<div
			style={{
				display: 'flex',
				width: '100%',
			}}
		>
			<ClientDietPlanSearch onSearchChange={handleSearchChange} />
		</div>
	);

	return (
		<>
			<Table<ClientDietPlanTableData>
				columns={tableColumns}
				dataSource={filteredPlans}
				bordered
				title={() => tableHeader}
				style={{
					width: '100%',
					flex: 1,
				}}
				pagination={{
					pageSize: 12,
					showSizeChanger: false,
				}}
				onRow={(record: ClientDietPlanTableData) => ({
					onDoubleClick: () => handleRowClick(record),
				})}
				{...tableProps}
			/>
			{openModalType === 'view' && selectedPlan !== undefined && (
				<ViewDietPlanModal
					open={openModalType === 'view'}
					okButtonProps={{ style: { display: 'none' } }}
					closable={false}
					mask={{
						closable: true,
					}}
					dietPlan={selectedPlan}
					onCancel={handleCloseModal}
				/>
			)}
			{(openModalType === 'edit' || openModalType === 'create') && selectedPlan !== undefined && (
				<CreateEditDietPlanModal
					open={openModalType === 'edit' || openModalType === 'create'}
					onCancel={handleCloseModal}
					onFinish={handleCreatePlan}
					mask={{
						closable: true,
					}}
					initialValues={{ ...selectedPlan, clientId: selectedPlan.clientId.toString() }}
					isEdit
				/>
			)}
		</>
	);
}
