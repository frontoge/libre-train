import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { Outlet } from "react-router-dom";
import { NavMenu } from "../components/NavMenu";

export function RouterLayout() {
    return (
        <Layout style={{
            height: "100%",
            width: "100%",
        }}>
            <Sider>
                <NavMenu />
            </Sider>
            <Outlet />
        </Layout>
    )
}