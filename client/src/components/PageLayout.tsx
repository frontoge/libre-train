import { Layout } from "antd";
import { Content, Header } from "antd/es/layout/layout";

type PageLayoutProps = {
    title?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
}

export default function PageLayout(props: PageLayoutProps) {
    return (
        <Layout>
            <Header style={{
            }}>
                <h1 style={{
                    margin: 0,
                    padding: 0,
                    fontSize: '1.5rem',
                }}>
                    {props.title || "Page Title"}
                </h1>
            </Header>
            <Content style={props.style || {
                padding: "2rem 3rem",
            }}>
                {props.children}
            </Content>
        </Layout>
    );
}