import { Layout } from "antd";
import Sider from "antd/es/layout/Sider";
import { Outlet } from "react-router-dom";
import { NavMenu } from "../components/NavMenu";
import { AppContext } from "../app-context";
import { useContext } from "react";
import { Modals } from "../components/Modals";

export function RouterLayout() {
    const { state } = useContext(AppContext);

    return (
        <Layout style={{
            height: "100%",
            width: "100%",
        }}>
            {state.selectedModal !== undefined && Modals[state.selectedModal]}
            <Sider>
                <NavMenu />
            </Sider>
            <Outlet />
        </Layout>
    )
}