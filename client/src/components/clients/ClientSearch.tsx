import { useContext, useState } from "react";
import { AppContext } from "../../app-context";
import { formatClientFullName } from "../../helpers/label-formatters";
import { stringSimilarity } from 'string-similarity-js'
import { Select } from "antd";

export interface ClientSearchProps extends Omit<React.ComponentProps<typeof Select>, 'fetchOptions'> {
    onClientSelect?: (clientId: string) => void;
}

export function ClientSearch(props: ClientSearchProps) {

    const { state: { clients }} = useContext(AppContext);
    const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined);

    const handleChange = (value: any) => {
        setSelectedClient(value);
        if (props.onClientSelect) {
            props.onClientSelect(value);
        }
    }

    function fetchClients(search: string): {key: string; label: string; value: string}[] {
        return clients
        .filter((client) => search.trim() === '' || stringSimilarity(search, formatClientFullName(client.first_name, client.last_name)) > 0.2)
        .map((client) => ({
            key: client.id.toString(),
            label: formatClientFullName(client.first_name, client.last_name),
            value: client.id.toString(),
        }))
    }

    const initialOptions = clients
        .map((client) => ({
            key: client.id.toString(),
            label: formatClientFullName(client.first_name, client.last_name),
            value: client.id.toString(),
        }))

    return (
        <Select<string>
            options={initialOptions}
            value={selectedClient}
            placeholder="Search for a client"
            onSearch={fetchClients}
            onChange={handleChange}
            style={{width: "100%"}}
            {...props}
        >
            
        </Select>
        
    )
}