import { Input } from 'antd';
import { useState } from 'react';

export interface TimeInputProps extends React.ComponentProps<typeof Input> {}

const formatTimeValue = (value: string): string => {
	const input = value.replace(/\D/g, '').slice(0, 6);

	let formatted = input;
	if (input.length > 2) {
		formatted = input.slice(0, -2) + ':' + input.slice(-2);
	}
	if (input.length > 4) {
		formatted = input.slice(0, -4) + ':' + input.slice(-4, -2) + ':' + input.slice(-2);
	}

	return formatted;
};

export function TimeInput(props: TimeInputProps) {
	const { onChange, value, defaultValue, ...inputProps } = props;
	const [textValue, setTextValue] = useState(() => formatTimeValue(String(defaultValue ?? '')));

	const isControlled = value !== undefined;
	const resolvedValue = isControlled ? formatTimeValue(String(value ?? '')) : textValue;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const formatted = formatTimeValue(e.target.value);

		if (!isControlled) {
			setTextValue(formatted);
		}

		onChange?.({
			...e,
			target: { ...e.target, value: formatted },
			currentTarget: { ...e.currentTarget, value: formatted },
		} as React.ChangeEvent<HTMLInputElement>);
	};

	return <Input {...inputProps} onChange={handleChange} value={resolvedValue} />;
}
