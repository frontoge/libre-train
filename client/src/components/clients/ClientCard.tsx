import { Avatar, Card, Descriptions } from "antd";
import { useContext, useMemo } from "react";
import { AppContext } from "../../app-context";
import { getYearsSinceDate } from "../../helpers/date-helpers";
import { FaUserAlt } from "react-icons/fa";

export interface ClientCardProps extends React.ComponentProps<typeof Card> {
    clientId: number;
}

export function ClientCard(props: ClientCardProps) {
    const { state: { clients } } = useContext(AppContext);
    const { clientId, style, ...cardProps } = props;

    const client = useMemo(() => {
        return clients.find(c => c.id === clientId);
    }, [clients, clientId]);

    if (!client) {
        return (
            <Card
                style={{
                    ...style,
                }}
                {...cardProps}
            >
                Client not found
            </Card>
        )
    }

    const clientDescriptions = [
        {
            key: 'email',
            label: 'Email',
            children: client.email,
        },
        {
            key: 'phone',
            label: 'Phone',
            children: client.phone,
        },
        {
            key: 'age',
            label: 'Age',
            children: client.date_of_birth !== undefined ? getYearsSinceDate(client.date_of_birth) : 'N/A',
        }
    ]

    console.log('Client in ClientCard:', clientDescriptions);

    return (
        <Card
            style={{
                ...style,
            }}
            {...cardProps}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '2rem',
                    height: '100%',
                }}
            >
                <div style={{
                    height: '50%',
                }}>
                    <Avatar 
                        size={64}
                        src={client.img || undefined}
                        onError={() => false}
                        draggable={false}
                        icon={<FaUserAlt />}
                    />
                </div>
                <div style={{
                    flexGrow: 1,
                    height: "100%",
                }}>
                    <h3 style={{
                        margin: 0,
                    }}>
                        {`${client.first_name} ${client.last_name}`}
                    </h3>
                    <Descriptions
                        column={1}
                        size="small"
                        items={clientDescriptions}
                    >

                    </Descriptions>
                </div>
            </div>
        </Card>
    )
}