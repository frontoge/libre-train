import { Button, Layout } from "antd";
import { Content } from "antd/es/layout/layout";

export function NoPage() {
    return (
        <Layout style={{
            height: "100%",
            width: "100%",
            color: "white",
        }}>
            <Content style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <h1>404 - Page Not Found</h1>
                <Button type="primary" href="/">Go to Home</Button>
            </Content>
        </Layout>
    )
}