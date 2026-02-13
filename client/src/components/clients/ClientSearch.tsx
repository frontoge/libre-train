import { useContext, useState } from "react";
import { AppContext } from "../../app-context";
import { formatClientFullName } from "../../helpers/label-formatters";
import DebounceSelect from "../Common/DebounceSelect";
import { stringSimilarity } from 'string-similarity-js'

export interface ClientSearchProps extends Omit<React.ComponentProps<typeof DebounceSelect>, 'fetchOptions'> {
    onClientSelect?: (clientId: string) => void;
}

export function ClientSearch(props: ClientSearchProps) {

    interface UserValue {
        key: string;
        label: string;
        value: string;
    }

    const { state: { clients }} = useContext(AppContext);
    const [selectedClient, setSelectedClient] = useState();

    const handleChange = (value: any) => {
        console.log("Selected client:", value);
        setSelectedClient(value);
        if (props.onClientSelect) {
            props.onClientSelect(value.key);
        }
    }

    async function fetchClients(search: string): Promise<UserValue[]> {
        console.log("Fetching clients with search:", search);
        return clients
        .filter((client) => search.trim() === '' || stringSimilarity(search, formatClientFullName(client.first_name, client.last_name)) > 0.2)
        .map((client) => ({
            key: client.id.toString(),
            label: formatClientFullName(client.first_name, client.last_name),
            value: client.id.toString(),
        }))
    }

    const initialOptions = clients.map((client) => ({
        key: client.id.toString(),
        label: formatClientFullName(client.first_name, client.last_name),
        value: client.id.toString(),
    }));

    return (
        <DebounceSelect
            options={initialOptions}
            value={selectedClient}
            placeholder="Search for a client"
            fetchOptions={fetchClients}
            onChange={handleChange}
            style={{width: "100%"}}
            {...props}
        >
            
        </DebounceSelect>
        
    )
}