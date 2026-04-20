import type { ClientGoalWithRelations, CreateClientGoalRequest, UpdateClientGoalRequest } from '@libre-train/shared';
import { Modal } from 'antd';
import { createClientGoal, updateClientGoal } from '../../helpers/goals-api';
import { useMessage } from '../../hooks/useMessage';
import { GoalForm } from './GoalForm';

export interface GoalModalProps {
	open: boolean;
	/** Pre-selected client. When omitted, the modal's form renders a client picker instead. */
	clientId?: number;
	existingGoal?: ClientGoalWithRelations;
	onClose: () => void;
	onSaved?: () => void;
}

export function GoalModal({ open, clientId, existingGoal, onClose, onSaved }: GoalModalProps) {
	const showMessage = useMessage();

	const handleSubmit = async (body: CreateClientGoalRequest | UpdateClientGoalRequest, isEdit: boolean) => {
		try {
			if (isEdit && existingGoal) {
				await updateClientGoal(existingGoal.id, body as UpdateClientGoalRequest);
				showMessage('success', 'Goal updated');
			} else {
				await createClientGoal(body as CreateClientGoalRequest);
				showMessage('success', 'Goal created');
			}
			onSaved?.();
			onClose();
		} catch (error) {
			showMessage('error', error instanceof Error ? error.message : 'Failed to save goal');
		}
	};

	return (
		<Modal
			open={open}
			title={existingGoal ? 'Edit Goal' : 'New Goal'}
			onCancel={onClose}
			footer={null}
			destroyOnHidden
			width="min(640px, 100%)"
		>
			{open && <GoalForm clientId={clientId} existingGoal={existingGoal} onSubmit={handleSubmit} onCancel={onClose} />}
		</Modal>
	);
}
