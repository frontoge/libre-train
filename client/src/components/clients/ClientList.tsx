import { List, Skeleton, Avatar } from "antd";
import { AppContext } from "../../app-context";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/ClientDashboard/client-list.css"
import { ModalType } from "../../types/types";

export function ClientList() {

    const { state, setState } = useContext(AppContext);
    const navigate = useNavigate();
    const {id} = useParams();

    const selectClient = (clientId: number) => {
        setState(prev => ({
            ...prev,
            selectedClient: prev.clients.find(c => c.id === clientId)
        }));
        navigate(`/clients/${clientId}`);
    }

    const openDeleteModal = (clientId: number) => {
        setState(prev => ({
            ...prev,
            selectedModal: ModalType.DeleteClient,
            selectedClient: prev.clients.find(c => c.id === clientId)
        }))
    }

    const list = state.clients.map(client => ({
        id: client.id,
        name: client.first_name + ' ' + client.last_name,
        avatar: client?.img,
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
                    className={`client-list-item ${id !== undefined && item.id == parseInt(id, 10) ? 'client-list-item-selected' : ''}`}
                    onClick={() => selectClient(item.id)}
                    key={item.id}
                    actions={[
                        <a key="list-loadmore-edit">edit</a>,
                        <a key="list-loadmore-more" onClick={() => {openDeleteModal(item.id)}}>remove</a>
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
