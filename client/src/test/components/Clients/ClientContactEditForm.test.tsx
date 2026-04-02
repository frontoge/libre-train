import type { ClientContact } from '@libre-train/shared';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { describe, expect, it, vi } from 'vitest';
import { ClientContactEditForm } from '../../../components/clients/ClientContactEditForm';

const renderForm = (props: React.ComponentProps<typeof ClientContactEditForm> = {}) =>
	render(<ClientContactEditForm {...props} />);

describe('ClientContactEditForm', () => {
	it('renders core form controls with default actions', () => {
		renderForm();

		expect(screen.getByPlaceholderText('Enter first name')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter last name')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter email address')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter phone number')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter height in inches')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('Enter client notes')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Save Contact' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
	});

	it('maps initialValues into form fields', () => {
		const initialValues: Partial<ClientContact> = {
			first_name: 'Ada',
			last_name: 'Lovelace',
			email: 'ada@example.com',
			phone: '+1 555 0100',
			notes: 'Initial contact note',
			height: 64,
		};

		renderForm({ initialValues });

		expect(screen.getByDisplayValue('Ada')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Lovelace')).toBeInTheDocument();
		expect(screen.getByDisplayValue('ada@example.com')).toBeInTheDocument();
		expect(screen.getByDisplayValue('+1 555 0100')).toBeInTheDocument();
		expect(screen.getByDisplayValue('Initial contact note')).toBeInTheDocument();
		expect(screen.getByDisplayValue('64')).toBeInTheDocument();
	});

	it('submits valid values to onSubmit', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		const initialValues: Partial<ClientContact> = {
			first_name: 'Grace',
			last_name: 'Hopper',
			date_of_birth: '1906-12-09',
		};

		renderForm({ initialValues, onSubmit });

		const firstNameInput = screen.getByPlaceholderText('Enter first name');
		const lastNameInput = screen.getByPlaceholderText('Enter last name');
		await user.clear(firstNameInput);
		await user.type(firstNameInput, 'Katherine');
		await user.clear(lastNameInput);
		await user.type(lastNameInput, 'Johnson');
		await user.click(screen.getByRole('button', { name: 'Save Contact' }));

		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));

		const submittedValues = onSubmit.mock.calls[0][0];
		expect(submittedValues.firstName).toBe('Katherine');
		expect(submittedValues.lastName).toBe('Johnson');
		expect(dayjs.isDayjs(submittedValues.dob)).toBe(true);
		expect(submittedValues.dob?.format('YYYY-MM-DD')).toBe('1906-12-09');
	});

	it('shows validation errors and does not submit when required names are missing', async () => {
		const user = userEvent.setup();
		const onSubmit = vi.fn();
		const initialValues: Partial<ClientContact> = {
			first_name: 'Temp',
			last_name: 'User',
		};

		renderForm({ initialValues, onSubmit });

		await user.clear(screen.getByPlaceholderText('Enter first name'));
		await user.clear(screen.getByPlaceholderText('Enter last name'));
		await user.click(screen.getByRole('button', { name: 'Save Contact' }));

		expect(await screen.findByText('Please enter first name')).toBeInTheDocument();
		expect(await screen.findByText('Please enter last name')).toBeInTheDocument();
		expect(onSubmit).not.toHaveBeenCalled();
	});

	it('resets fields back to initialValues when reset is clicked', async () => {
		const user = userEvent.setup();
		const initialValues: Partial<ClientContact> = {
			first_name: 'Original',
			last_name: 'Name',
		};

		renderForm({ initialValues });

		const firstNameInput = screen.getByPlaceholderText('Enter first name');
		await user.clear(firstNameInput);
		await user.type(firstNameInput, 'Changed');
		expect(screen.getByDisplayValue('Changed')).toBeInTheDocument();

		await user.click(screen.getByRole('button', { name: 'Reset' }));

		await waitFor(() => {
			expect(screen.getByDisplayValue('Original')).toBeInTheDocument();
		});
	});

	it('calls onCancel and respects showCancel/showReset options', async () => {
		const user = userEvent.setup();
		const onCancel = vi.fn();

		const { rerender } = render(<ClientContactEditForm showCancel={false} showReset={false} onCancel={onCancel} />);

		expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'Reset' })).not.toBeInTheDocument();

		rerender(<ClientContactEditForm showCancel onCancel={onCancel} />);
		await user.click(screen.getByRole('button', { name: 'Cancel' }));

		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it('calls onError when onSubmit rejects', async () => {
		const user = userEvent.setup();
		const error = new Error('submit failed');
		const onSubmit = vi.fn().mockRejectedValue(error);
		const onError = vi.fn();
		const initialValues: Partial<ClientContact> = {
			first_name: 'Alan',
			last_name: 'Turing',
		};

		renderForm({ initialValues, onSubmit, onError });

		await user.click(screen.getByRole('button', { name: 'Save Contact' }));

		await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
		await waitFor(() => expect(onError).toHaveBeenCalledWith(error));
	});
});
