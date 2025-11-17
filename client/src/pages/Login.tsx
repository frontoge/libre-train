import { Layout, Form, type FormProps, Input, Button } from "antd";
import { Content } from "antd/es/layout/layout";
import React from "react";
import { Routes } from "../../../shared/routes";
import { getAppConfiguration } from "../config/app.config";
import { AppContext } from "../app-context";
import { Navigate, useLocation } from "react-router-dom";

export function Login() {

    const [error, setError] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    const location = useLocation();

    const { setAuth, isAuthenticated } = React.useContext(AppContext);

    // Use useEffect to redirect when authentication state changes
    React.useEffect(() => {
        if (isAuthenticated()) {
            // User is already authenticated, redirect to home
            return;
        }
    }, [isAuthenticated]);

    type FieldType = {
        username?: string;
        password?: string;
    }

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        setError('');
        setLoading(true);
        
        try {
            const res = await fetch(`${getAppConfiguration().apiUrl}${Routes.AuthLogin}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: values.username,
                    password: values.password,
                }),
            })

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Login failed');
            }

            const { accessToken, user } = await res.json();

            setAuth({authToken: accessToken, user});

        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }

    const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
        console.log('Failed:', errorInfo);
    }

    // If user is already authenticated, redirect to home page
    if (isAuthenticated()) {
        return (
            <Navigate to="/" replace state={{ from: location }}/>
        )
    }

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
                justifyContent: 'center',
                position: 'relative',
                minHeight: '100vh'
            }}>
                <h1
                    style={{
                        color: 'white',
                        fontSize: 64,
                        alignSelf: 'flex-start',
                        position: 'absolute',
                        top: 32,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        margin: 0,
                        width: '100%',
                        textAlign: 'center'
                    }}
                >
                    LibreTrain
                </h1>
                <div style={{ marginTop: 120, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <h2>Login</h2>
                    <Form
                        name="login"
                        labelCol={{span: 8}}
                        wrapperCol={{span: 16}}
                        style={{ maxWidth: 1200, color: "white"}}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >
                        {/* Form fields would go here */}
                        <Form.Item<FieldType> 
                            name="username"
                            label="Username"
                            rules={[{required: true, message: "Please input a username"}]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item<FieldType> name="password" label="Password">
                            <Input.Password />
                        </Form.Item>
                        
                        <Form.Item label={null}>
                            <Button type="primary" htmlType="submit">
                                Log in
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </Content>
        </Layout>
    )
}