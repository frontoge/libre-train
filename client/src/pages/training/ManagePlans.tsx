import { useState } from 'react';
import { ClientSearch } from '../../components/clients/ClientSearch';
import PageLayout from '../../components/PageLayout';
import { Panel } from '../../components/Panel';
import { CycleBrowser } from '../../components/Training/CycleBrowser';

export function ManagePlans() {
	const [selectedClient, setSelectedClient] = useState<number | undefined>(undefined);

	const handleClientSelect = (clientId?: string) => {
		setSelectedClient(clientId ? Number(clientId) : undefined);
	};

	return (
		<PageLayout
			title="Browse Plans"
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				margin: '1rem',
			}}
		>
			<Panel
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					gap: '1rem',
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						width: '20%',
						gap: '0.5rem',
					}}
				>
					<span
						style={{
							marginLeft: '0.5rem',
							fontSize: '1rem',
						}}
					>
						Client
					</span>
					<ClientSearch onClientSelect={handleClientSelect} />
				</div>
				{selectedClient && <CycleBrowser clientId={selectedClient} />}
			</Panel>
		</PageLayout>
	);
}
