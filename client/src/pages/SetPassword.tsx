/// <reference types="vite/client" />
import { LockOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Col, Divider, Form, Input, Layout, Row, Space, theme, Typography, type FormProps } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { setPassword as setPasswordRequest } from '../api/auth';
import { AppContext, DEFAULT_AUTH_TAGLINE, DEFAULT_BRAND_NAME } from '../app-context';
import logo from '../assets/logo.svg';
import { useAuth } from '../hooks/useAuth';

// Copy specific to the first-sign-in set-password screen. Layout mirrors the login screen so
// the two read as the same product surface.
const STATIC = {
	helpText: 'Trouble setting your password? Contact your admin or support team.',
} as const;

export function SetPassword() {
	const { token } = theme.useToken();
	const navigate = useNavigate();
	const { auth, setAuth, refreshAuthentication } = useAuth();
	const {
		state: { branding },
	} = React.useContext(AppContext);

	const productName = branding.brand_name || DEFAULT_BRAND_NAME;
	const tagline = branding.auth_tagline || DEFAULT_AUTH_TAGLINE;
	const logoSrc = branding.logoUrl ?? logo;

	const hasAttemptedRefresh = React.useRef(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const [error, setError] = React.useState<string | null>(null);

	React.useEffect(() => {
		// Nobody is signed in here: try the refresh cookie once, then fall back to login.
		if (auth.user === undefined) {
			if (hasAttemptedRefresh.current) {
				navigate('/login', { replace: true });
				return;
			}
			hasAttemptedRefresh.current = true;
			void refreshAuthentication();
			return;
		}
		// Signed in but no temp password outstanding — nothing to do here.
		if (!auth.mustChangePassword) {
			navigate('/', { replace: true });
		}
	}, [auth.user, auth.mustChangePassword, navigate, refreshAuthentication]);

	type FieldType = {
		password?: string;
		confirmPassword?: string;
	};

	const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
		if (!auth.authToken) {
			setError('Your session has expired. Please sign in again.');
			return;
		}
		setIsSubmitting(true);
		setError(null);

		try {
			await setPasswordRequest(values.password ?? '', auth.authToken);
			setAuth({ ...auth, mustChangePassword: false });
			navigate('/', { replace: true });
		} catch (e: any) {
			setError(e?.message ?? 'Unable to set your password. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (auth.user === undefined || !auth.mustChangePassword) {
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
							variant="borderless"
							style={{
								borderRadius: 24,
								background: token.colorBgContainer,
								border: `1px solid ${token.colorBorderSecondary}`,
								boxShadow: token.boxShadowSecondary,
							}}
						>
							<Row gutter={[48, 32]}>
								<Col xs={24} md={11}>
									<Space orientation="vertical" size={20} style={{ width: '100%' }}>
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
												src={logoSrc}
												alt={`${productName} logo`}
												style={{ width: '100%', height: '170%' }}
											/>
										</div>

										<Space orientation="vertical" size={8}>
											<Typography.Text style={{ color: token.colorPrimary, fontWeight: 600 }}>
												Welcome to
											</Typography.Text>
											<Typography.Title level={2} style={{ margin: 0, color: token.colorTextHeading }}>
												{productName}
											</Typography.Title>
											<Typography.Text style={{ fontSize: 16, color: token.colorText }}>
												{tagline}
											</Typography.Text>
										</Space>

										<Typography.Paragraph style={{ marginBottom: 0, color: token.colorTextDescription }}>
											You signed in with a temporary password. Choose a permanent password to finish setting
											up your account.
										</Typography.Paragraph>

										<Divider style={{ margin: '4px 0' }} />

										<Typography.Text type="secondary">{STATIC.helpText}</Typography.Text>
									</Space>
								</Col>

								<Col xs={24} md={13}>
									<Space orientation="vertical" size={16} style={{ width: '100%' }}>
										<Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
											Set a new password
										</Typography.Title>
										<Typography.Text type="secondary">
											Your new password replaces the temporary one you were given.
										</Typography.Text>

										{error && <Alert title={error} type="error" showIcon />}

										<Form
											name="set-password"
											layout="vertical"
											size="large"
											onFinish={onFinish}
											autoComplete="off"
											requiredMark={false}
										>
											<Form.Item<FieldType>
												name="password"
												label="New password"
												rules={[
													{ required: true, message: 'Please choose a password' },
													{ min: 8, message: 'Password must be at least 8 characters long' },
													{
														pattern: /[A-Z]/,
														message: 'Password must contain at least one uppercase letter',
													},
													{ pattern: /[0-9]/, message: 'Password must contain at least one number' },
												]}
												hasFeedback
											>
												<Input.Password prefix={<LockOutlined />} placeholder="Enter a new password" />
											</Form.Item>

											<Form.Item<FieldType>
												name="confirmPassword"
												label="Confirm password"
												dependencies={['password']}
												hasFeedback
												rules={[
													{ required: true, message: 'Please confirm your password' },
													({ getFieldValue }) => ({
														validator(_, value) {
															if (!value || getFieldValue('password') === value) {
																return Promise.resolve();
															}
															return Promise.reject(new Error('The passwords do not match'));
														},
													}),
												]}
											>
												<Input.Password
													prefix={<LockOutlined />}
													placeholder="Re-enter your new password"
												/>
											</Form.Item>

											<Form.Item style={{ marginBottom: 0 }}>
												<Button type="primary" htmlType="submit" block loading={isSubmitting}>
													Save password
												</Button>
											</Form.Item>
										</Form>
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
