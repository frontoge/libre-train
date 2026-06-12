import { UploadOutlined } from '@ant-design/icons';
import { Alert, Button, Col, ColorPicker, Divider, Grid, Input, Row, Space, Tag, theme, Typography, Upload } from 'antd';
import { useContext, useState, type CSSProperties } from 'react';
import { FaBullseye, FaHouse, FaUser } from 'react-icons/fa6';
import { updateBranding, uploadLogo } from '../../api/branding';
import { AppContext, DEFAULT_BRAND_NAME } from '../../app-context';
import PageLayout from '../../components/PageLayout';
import { DEFAULT_BRANDING, deriveSiderBg } from '../../config/themes';
import { useMessage } from '../../hooks/useMessage';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,image/svg+xml';

export function Customization() {
	const { token } = theme.useToken();
	const screens = Grid.useBreakpoint();
	const isMobile = !screens.md;
	const showMessage = useMessage();
	const {
		state: { branding },
		stateRefreshers,
	} = useContext(AppContext);

	const [brandName, setBrandName] = useState(branding.brand_name || DEFAULT_BRAND_NAME);
	const [primary, setPrimary] = useState(branding.primary_color || DEFAULT_BRANDING.primaryColor);
	const [secondary, setSecondary] = useState(branding.secondary_color || DEFAULT_BRANDING.secondaryColor);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [saving, setSaving] = useState(false);

	const currentLogo = logoPreview ?? branding.logoUrl;
	const siderBg = deriveSiderBg(primary);

	const stageLogo = (file: File): boolean => {
		if (file.size > MAX_LOGO_BYTES) {
			showMessage('error', 'Logo must be 2 MB or smaller.');
			return false;
		}
		setLogoFile(file);
		setLogoPreview(URL.createObjectURL(file));
		return false; // prevent antd's auto-upload; we submit on save
	};

	const handleReset = () => {
		setBrandName(branding.brand_name || DEFAULT_BRAND_NAME);
		setPrimary(branding.primary_color || DEFAULT_BRANDING.primaryColor);
		setSecondary(branding.secondary_color || DEFAULT_BRANDING.secondaryColor);
		setLogoFile(null);
		setLogoPreview(null);
	};

	const handleSave = async () => {
		if (!brandName.trim()) {
			showMessage('error', 'Brand name is required.');
			return;
		}
		setSaving(true);
		try {
			await updateBranding({
				brand_name: brandName.trim(),
				primary_color: primary,
				secondary_color: secondary,
			});
			if (logoFile) {
				await uploadLogo(logoFile);
			}
			stateRefreshers?.refreshBranding();
			setLogoFile(null);
			setLogoPreview(null);
			showMessage('success', 'Branding updated.');
		} catch (error) {
			console.error('Error saving branding:', error);
			showMessage('error', 'Failed to update branding.');
		} finally {
			setSaving(false);
		}
	};

	const cardStyle: CSSProperties = {
		background: token.colorBgContainer,
		borderRadius: token.borderRadiusLG,
		border: `1px solid ${token.colorBorderSecondary}`,
		boxShadow: `0 1px 2px ${token.colorBgElevated}`,
		padding: '1.5rem',
	};

	const previewNavItems = [
		{ label: 'Home', icon: <FaHouse />, selected: false },
		{ label: 'Clients', icon: <FaUser />, selected: true },
		{ label: 'Goals', icon: <FaBullseye />, selected: false },
	];

	return (
		<PageLayout title="Customization" contentStyle={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
			<div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
				<div>
					<Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
						Branding
					</Typography.Title>
					<Typography.Text type="secondary">
						Customize how your workspace looks — brand name, colors, and logo apply across the entire app.
					</Typography.Text>
				</div>

				<Row gutter={[16, 16]}>
					{/* Form */}
					<Col xs={24} md={14}>
						<div style={cardStyle}>
							<Typography.Title level={5} style={{ marginTop: 0 }}>
								Brand name
							</Typography.Title>
							<Input
								size="large"
								value={brandName}
								maxLength={100}
								onChange={(e) => setBrandName(e.target.value)}
								placeholder="Your brand name"
							/>

							<Divider />

							<Typography.Title level={5} style={{ marginTop: 0 }}>
								Brand colors
							</Typography.Title>
							<Space size="large" wrap>
								<Space orientation="vertical" size={4}>
									<Typography.Text type="secondary">Primary</Typography.Text>
									<ColorPicker
										value={primary}
										onChange={(color) => setPrimary(color.toHexString())}
										showText
										disabledAlpha
										size="large"
									/>
								</Space>
								<Space orientation="vertical" size={4}>
									<Typography.Text type="secondary">Secondary</Typography.Text>
									<ColorPicker
										value={secondary}
										onChange={(color) => setSecondary(color.toHexString())}
										showText
										disabledAlpha
										size="large"
									/>
								</Space>
							</Space>
							<Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
								Primary drives the accent palette (buttons, links, the active nav item). Secondary is used for
								informational accents.
							</Typography.Paragraph>

							<Divider />

							<Typography.Title level={5} style={{ marginTop: 0 }}>
								Logo
							</Typography.Title>
							<Space align="center" size="large" wrap>
								<div
									style={{
										width: 120,
										height: 56,
										borderRadius: token.borderRadius,
										border: `1px dashed ${token.colorBorder}`,
										background: siderBg,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										overflow: 'hidden',
									}}
								>
									{currentLogo ? (
										<img
											src={currentLogo}
											alt="Logo preview"
											style={{ maxHeight: '85%', maxWidth: '90%', objectFit: 'contain' }}
										/>
									) : (
										<Typography.Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>
											No logo
										</Typography.Text>
									)}
								</div>
								<Upload accept={ACCEPTED_TYPES} maxCount={1} showUploadList={false} beforeUpload={stageLogo}>
									<Button icon={<UploadOutlined />}>{currentLogo ? 'Replace logo' : 'Upload logo'}</Button>
								</Upload>
							</Space>
							<Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
								PNG, JPEG, WEBP, or SVG up to 2 MB. Leave unset to use the default logo.
							</Typography.Paragraph>

							<Divider />

							<Space>
								<Button type="primary" size="large" loading={saving} onClick={handleSave}>
									Save changes
								</Button>
								<Button size="large" onClick={handleReset} disabled={saving}>
									Reset
								</Button>
							</Space>
						</div>
					</Col>

					{/* Live preview */}
					<Col xs={24} md={10}>
						<div style={cardStyle}>
							<Typography.Text
								type="secondary"
								style={{ textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}
							>
								Live preview
							</Typography.Text>

							<div
								style={{
									marginTop: 12,
									display: 'flex',
									borderRadius: token.borderRadiusLG,
									overflow: 'hidden',
									border: `1px solid ${token.colorBorderSecondary}`,
									minHeight: 220,
								}}
							>
								{/* Mock sidebar */}
								<div style={{ width: 150, background: siderBg, padding: '12px 8px' }}>
									<div
										style={{
											height: 36,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											marginBottom: 12,
										}}
									>
										{currentLogo ? (
											<img
												src={currentLogo}
												alt={brandName}
												style={{ maxHeight: 28, maxWidth: '90%', objectFit: 'contain' }}
											/>
										) : (
											<Typography.Text strong style={{ color: '#fff', fontSize: 13 }}>
												{brandName}
											</Typography.Text>
										)}
									</div>
									<Space orientation="vertical" size={4} style={{ width: '100%' }}>
										{previewNavItems.map((item) => (
											<div
												key={item.label}
												style={{
													display: 'flex',
													alignItems: 'center',
													gap: 8,
													padding: '6px 10px',
													borderRadius: token.borderRadius,
													fontSize: 13,
													background: item.selected ? primary : 'transparent',
													color: item.selected ? '#fff' : 'rgba(255,255,255,0.65)',
												}}
											>
												{item.icon}
												<span>{item.label}</span>
											</div>
										))}
									</Space>
								</div>

								{/* Mock content */}
								<div style={{ flex: 1, padding: 16, background: token.colorBgContainer }}>
									<Typography.Title level={5} style={{ marginTop: 0 }}>
										{brandName}
									</Typography.Title>
									<Space wrap>
										<Button type="primary" style={{ background: primary, borderColor: primary }}>
											Primary
										</Button>
										<Button>Default</Button>
									</Space>
									<div style={{ marginTop: 12 }}>
										<Space wrap>
											<Tag color={primary}>Primary tag</Tag>
											<Tag color={secondary}>Secondary tag</Tag>
										</Space>
									</div>
									<div style={{ marginTop: 12 }}>
										<Alert
											type="info"
											showIcon
											title="Informational accent"
											style={{ borderColor: secondary }}
										/>
									</div>
								</div>
							</div>
						</div>
					</Col>
				</Row>
			</div>
		</PageLayout>
	);
}
