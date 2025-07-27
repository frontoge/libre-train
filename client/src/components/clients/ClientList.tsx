import { List, Skeleton, Avatar } from "antd";

const list = new Array(4).fill({name: 'Matt Widenhouse', avatar: 'https://joeschmoe.io/api/v1/random'});

export function ClientList() {
    return (
        <List
            className="client-list"
            itemLayout="horizontal"
            dataSource={list}
            renderItem={(item) => (
                <List.Item
                    actions={[
                        <a key="list-loadmore-edit">edit</a>,
                        <a key="list-loadmore-more">remove</a>
                ]}>
                <Skeleton avatar title={false} loading={item.loading} active>
                    <List.Item.Meta
                        avatar={<Avatar src={item.avatar} />}
                        title={<div>{item.name}</div>}
                        description="Matt Widenhouse"
                    />
                </Skeleton>
                </List.Item>
            )}
        />
    );
}
