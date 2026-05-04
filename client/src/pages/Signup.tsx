import { Button, Form, Input, Layout, type FormProps } from 'antd';
import { Content } from 'antd/es/layout/layout';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { signupUser } from '../api/auth';
import { useAuth } from '../hooks/useAuth';

export function Signup() {
	const [shouldRedirect, setShouldRedirect] = React.useState<boolean>(false);
	const location = useLocation();

	const { setAuth } = useAuth();

	type FieldType = {
		username?: string;
		password?: string;
	};

	const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
		try {
			const { accessToken, user } = await signupUser({
				username: values.username ?? '',
				password: values.password ?? '',
			});

			setAuth({ authToken: accessToken, user });
			setShouldRedirect(true);
		} catch (e: any) {
			console.log('Signup error:', e);
		}
	};

	const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo);
	};

	if (shouldRedirect) {
		return <Navigate to="/" replace state={{ from: location }} />;
	}

	return (
		<Layout
			style={{
				height: '100%',
				width: '100%',
				color: 'white',
			}}
		>
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
					textAlign: 'center',
				}}
			>
				LibreTrain
			</h1>
			<Content
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<h2>Create Account</h2>
				<Form
					name="signup"
					labelCol={{ span: 8 }}
					wrapperCol={{ span: 16 }}
					style={{ maxWidth: 1200, color: 'white' }}
					onFinish={onFinish}
					onFinishFailed={onFinishFailed}
					autoComplete="off"
				>
					{/* Form fields would go here */}
					<Form.Item<FieldType>
						name="username"
						label="Username"
						rules={[{ required: true, message: 'Please input a username' }]}
					>
						<Input />
					</Form.Item>
					<Form.Item<FieldType> name="password" label="Password">
						<Input.Password />
					</Form.Item>
					<div style={{ display: 'flex', gap: '3rem' }}>
						<Form.Item label={null}>
							<Button type="primary" htmlType="submit">
								Sign Up
							</Button>
						</Form.Item>
						<a
							href="/login"
							style={{
								fontSize: '16px',
								color: 'green',
								transition: 'color 0.2s',
								fontWeight: 'bold',
								marginTop: '8px',
							}}
							onMouseDown={(e) => (e.currentTarget.style.color = '#006400')}
							onMouseUp={(e) => (e.currentTarget.style.color = 'green')}
							onMouseLeave={(e) => (e.currentTarget.style.color = 'green')}
						>
							Log in
						</a>
					</div>
				</Form>
			</Content>
		</Layout>
	);
}
