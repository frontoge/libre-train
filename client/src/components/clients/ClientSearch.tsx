import { Select } from 'antd';
import { useContext, useMemo, useState } from 'react';
import { stringSimilarity } from 'string-similarity-js';
import { AppContext } from '../../app-context';
import { formatClientFullName } from '../../helpers/label-formatters';

export interface ClientSearchProps extends Omit<React.ComponentProps<typeof Select<string>>, 'fetchOptions'> {
	onClientSelect?: (clientId?: string) => void;
}

export function ClientSearch(props: ClientSearchProps) {
	const { onClientSelect, value: initalValue, ...otherProps } = props;
	const {
		state: { clients },
	} = useContext(AppContext);
	const [selectedClient, setSelectedClient] = useState<string | undefined>(initalValue ? initalValue.toString() : undefined);

	const handleChange = (value?: string) => {
		setSelectedClient(value);
		if (onClientSelect) {
			onClientSelect(value);
		}
	};

	function fetchClients(search: string): { key: string; label: string; value: string }[] {
		return clients
			.filter(
				(client) =>
					search.trim() === ''
					|| stringSimilarity(search, formatClientFullName(client.first_name, client.last_name)) > 0.2
			)
			.map((client) => ({
				key: client.ClientId.toString(),
				label: formatClientFullName(client.first_name, client.last_name),
				value: client.ClientId.toString(),
			}));
	}

	const initialOptions = useMemo(
		() =>
			clients.map((client) => ({
				key: client.ClientId.toString(),
				label: formatClientFullName(client.first_name, client.last_name),
				value: client.ClientId.toString(),
			})),
		[clients]
	);

	return (
		<Select<string>
			options={initialOptions}
			value={selectedClient}
			placeholder="Search for a client"
			onSearch={fetchClients}
			onChange={handleChange}
			style={{ width: '100%' }}
			allowClear
			{...otherProps}
		></Select>
	);
}
