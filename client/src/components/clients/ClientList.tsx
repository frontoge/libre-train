import { List, Skeleton, Avatar } from "antd";
import { AppContext } from "../../app-context";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

export function ClientList() {

    const { state } = useContext(AppContext);
    const navigate = useNavigate();

    const list = state.clients.map(client => ({
        id: client.id,
        name: client.first_name + ' ' + client.last_name,
        avatar: client?.img ?? 'https://joeschmoe.io/api/v1/random',
        email: client.email,
        loading: false // You can set this based on your loading state
    }));

    return (
        <List
            className="client-list"
            itemLayout="horizontal"
            dataSource={list}
            renderItem={(item) => (
                <List.Item
                    onClick={() => navigate(`/clients/${item.id}`)}
                    key={item.id}
                    actions={[
                        <a key="list-loadmore-edit">edit</a>,
                        <a key="list-loadmore-more">remove</a>
                ]}>
                <Skeleton avatar title={false} loading={item.loading} active>
                    <List.Item.Meta
                        avatar={<Avatar src={item.avatar} />}
                        title={<div>{item.name}</div>}
                        description={item.email}
                    />
                </Skeleton>
                </List.Item>
            )}
        />
    );
}
