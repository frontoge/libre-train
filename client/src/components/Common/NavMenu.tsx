import { Menu } from "antd";
import { items } from "../../config/nav-menu-items";
import { useNavigate } from "react-router-dom";
import { getNavigationUrl } from "../../helpers/navigation-helpers";

export function NavMenu() {
    const navigate = useNavigate();

    const onClick = (item: { key: string }) => {
        console.log('Menu item clicked:', item);
        // Navigate to the selected menu item
        navigate(getNavigationUrl(item.key));
    }

    return (
        <Menu
            theme="dark"
            mode="inline"
            defaultSelectedKeys={["1"]}
            defaultOpenKeys={["sub1"]}
            style={{
                height: "100%",
            }}
            onClick={onClick}
            items={items}
        />
    )
}