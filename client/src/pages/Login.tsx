/// <reference types="vite/client" />
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Routes } from '@libre-train/shared';
import { Alert, Button, Card, Col, Divider, Form, Input, Layout, Row, Space, theme, Typography, type FormProps } from 'antd';
import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logo from '../assets/logo.svg';
import { getAppConfiguration } from '../config/app.config';
import { useAuth } from '../hooks/useAuth';

const BRANDING = {
	productName: 'LibreTrain',
	tagline: 'Coach smarter. Track better.',
	description:
		'Configure this area for your organization with logos, product messaging, release notes, or seasonal campaign content.',
	logoText: 'Your Logo',
	helpText: 'Need access? Contact your admin or support team.',
	links: [
		{ label: 'Docs', href: '#' },
		{ label: 'Support', href: '#' },
		{ label: 'Status', href: '#' },
	],
} as const;

const FORGOT_PASSWORD_URL = '#';

export function Login() {
	const { token } = theme.useToken();
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { refreshAuthentication, auth, setAuth } = useAuth();
	const hasAttemptedRefresh = React.useRef(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [loginError, setLoginError] = React.useState<string | null>(null);

	React.useEffect(() => {
		if (auth.user !== undefined) {
			// User is already authenticated, redirect to home
			const redirect = searchParams.get('redirect');
			navigate(redirect ?? '/', { replace: true });
			return;
		}

		if (hasAttemptedRefresh.current) {
			return;
		}

		hasAttemptedRefresh.current = true;

		// Try to refresh authentication using refresh token
		void refreshAuthentication();
	}, [auth.user, navigate, refreshAuthentication, searchParams]);

	type FieldType = {
		username?: string;
		password?: string;
	};

	const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
		setIsSubmitting(true);
		setLoginError(null);

		try {
			const res = await fetch(`${getAppConfiguration().apiUrl}${Routes.AuthLogin}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({
					username: values.username,
					password: values.password,
				}),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'Login failed');
			}

			const { accessToken, user } = await res.json();
			setAuth({ authToken: accessToken, user });
		} catch (e: any) {
			console.log('Login error:', e);
			setLoginError(e?.message ?? 'Unable to sign in. Please verify your credentials and try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
		console.log('Failed:', errorInfo);
		setLoginError('Please complete the required fields.');
	};

	if (auth.user !== undefined) {
		return null;
	}

	return (
		<Layout
			style={{
				minHeight: '100vh',
				background: `radial-gradient(circle at 20% 20%, ${token.colorPrimaryBg} 0%, transparent 35%), ${token.colorBgLayout}`,
				overflow: 'hidden',
				position: 'relative',
			}}
		>
			<div
				style={{
					position: 'absolute',
					width: 340,
					height: 340,
					borderRadius: '50%',
					background: token.colorPrimaryBgHover,
					top: -120,
					right: -80,
					opacity: 0.5,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					width: 420,
					height: 420,
					borderRadius: '50%',
					background: token.colorPrimaryBg,
					bottom: -160,
					left: -120,
					opacity: 0.35,
				}}
			/>

			<Layout.Content style={{ padding: 24, position: 'relative' }}>
				<Row justify="center" align="middle" style={{ minHeight: 'calc(100vh - 48px)' }}>
					<Col xs={24} sm={22} md={20} lg={18} xl={16}>
						<Card
							bordered={false}
							style={{
								borderRadius: 24,
								background: token.colorBgContainer,
								border: `1px solid ${token.colorBorderSecondary}`,
								boxShadow: token.boxShadowSecondary,
							}}
						>
							<Row gutter={[48, 32]}>
								<Col xs={24} md={11}>
									<Space direction="vertical" size={20} style={{ width: '100%' }}>
										<div
											style={{
												height: 72,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												overflow: 'hidden',
											}}
										>
											<img
												src={logo}
												alt={`${BRANDING.productName} logo`}
												style={{ width: '100%', height: '170%' }}
											/>
										</div>

										<Space direction="vertical" size={8}>
											<Typography.Text style={{ color: token.colorPrimary, fontWeight: 600 }}>
												Welcome to
											</Typography.Text>
											<Typography.Title level={2} style={{ margin: 0, color: token.colorTextHeading }}>
												{BRANDING.productName}
											</Typography.Title>
											<Typography.Text style={{ fontSize: 16, color: token.colorText }}>
												{BRANDING.tagline}
											</Typography.Text>
										</Space>

										<Typography.Paragraph style={{ marginBottom: 0, color: token.colorTextDescription }}>
											{BRANDING.description}
										</Typography.Paragraph>

										<Divider style={{ margin: '4px 0' }} />

										<Space size={[8, 8]} wrap>
											{BRANDING.links.map((item) => (
												<Button
													key={item.label}
													type="link"
													href={item.href}
													style={{ paddingInline: 0 }}
												>
													{item.label}
												</Button>
											))}
										</Space>

										<Typography.Text type="secondary">{BRANDING.helpText}</Typography.Text>
									</Space>
								</Col>

								<Col xs={24} md={13}>
									<Space direction="vertical" size={16} style={{ width: '100%' }}>
										<Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
											Sign in
										</Typography.Title>
										<Typography.Text type="secondary">
											Use your account credentials to access your training workspace.
										</Typography.Text>

										{loginError && <Alert message={loginError} type="error" showIcon />}

										<Form
											name="login"
											layout="vertical"
											size="large"
											onFinish={onFinish}
											onFinishFailed={onFinishFailed}
											autoComplete="off"
											requiredMark={false}
										>
											<Form.Item<FieldType>
												name="username"
												label="Username"
												rules={[{ required: true, message: 'Please input a username' }]}
											>
												<Input prefix={<UserOutlined />} placeholder="Enter your username" />
											</Form.Item>

											<Form.Item<FieldType>
												name="password"
												label="Password"
												rules={[{ required: true, message: 'Please input your password' }]}
											>
												<Input.Password prefix={<LockOutlined />} placeholder="Enter your password" />
											</Form.Item>

											<Form.Item style={{ marginBottom: 8 }}>
												<Button type="primary" htmlType="submit" block loading={isSubmitting}>
													Log in
												</Button>
											</Form.Item>

											<Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
												<Button type="link" href={FORGOT_PASSWORD_URL} style={{ paddingInline: 0 }}>
													Forgot password?
												</Button>
											</Form.Item>
										</Form>

										{/* Show this after SSO is set up
										<Divider style={{ margin: '4px 0' }}>Secure Sign-In</Divider>
										<Typography.Text type="secondary" style={{ fontSize: 13 }}>
											Session security and account policies are configurable from server settings.
										</Typography.Text> */}
									</Space>
								</Col>
							</Row>
						</Card>
					</Col>
				</Row>
			</Layout.Content>
		</Layout>
	);
}
