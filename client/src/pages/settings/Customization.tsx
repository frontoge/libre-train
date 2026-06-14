import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import type { NavDisplay } from '@libre-train/shared';
import { Alert, Button, Col, ColorPicker, Divider, Grid, Input, Radio, Row, Space, Tag, theme, Typography, Upload } from 'antd';
import { useContext, useState, type CSSProperties } from 'react';
import { FaBullseye, FaHouse, FaUser } from 'react-icons/fa6';
import { clearIcon, clearLogo, updateBranding, uploadIcon, uploadLogo } from '../../api/branding';
import { AppContext, DEFAULT_BRAND_NAME } from '../../app-context';
import icon from '../../assets/icon.svg';
import logo from '../../assets/logo.svg';
import PageLayout from '../../components/PageLayout';
import { DEFAULT_BRANDING, deriveSiderBg } from '../../config/themes';
import { useMessage } from '../../hooks/useMessage';

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,image/svg+xml';

const NAV_DISPLAY_OPTIONS = [
	{ label: 'Logo', value: 'logo' as const },
	{ label: 'Brand name', value: 'name' as const },
	{ label: 'Both', value: 'both' as const },
];

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
	const [navDisplay, setNavDisplay] = useState<NavDisplay>(branding.nav_display ?? 'logo');
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [logoCleared, setLogoCleared] = useState(false);
	const [iconFile, setIconFile] = useState<File | null>(null);
	const [iconPreview, setIconPreview] = useState<string | null>(null);
	const [iconCleared, setIconCleared] = useState(false);
	const [saving, setSaving] = useState(false);

	// A staged "clear" removes the persisted asset on save; until then the preview shows nothing
	// (so it falls back to the bundled default).
	const currentLogo = logoPreview ?? (logoCleared ? undefined : branding.logoUrl);
	const currentIcon = iconPreview ?? (iconCleared ? undefined : branding.iconUrl);
	// What the nav actually renders: uploaded asset when present, else the bundled default SVG.
	const previewLogo = currentLogo ?? logo;
	const previewIcon = currentIcon ?? icon;
	const siderBg = deriveSiderBg(primary);

	const colorsAreDefault =
		primary.toLowerCase() === DEFAULT_BRANDING.primaryColor.toLowerCase()
		&& secondary.toLowerCase() === DEFAULT_BRANDING.secondaryColor.toLowerCase();

	const stageImage =
		(setFile: (f: File | null) => void, setPreview: (p: string | null) => void, setCleared: (c: boolean) => void) =>
		(file: File): boolean => {
			if (file.size > MAX_IMAGE_BYTES) {
				showMessage('error', 'Image must be 2 MB or smaller.');
				return false;
			}
			setCleared(false);
			setFile(file);
			setPreview(URL.createObjectURL(file));
			return false; // prevent antd's auto-upload; we submit on save
		};

	const clearImage =
		(setFile: (f: File | null) => void, setPreview: (p: string | null) => void, setCleared: (c: boolean) => void) => () => {
			setFile(null);
			setPreview(null);
			setCleared(true);
		};

	const resetColors = () => {
		setPrimary(DEFAULT_BRANDING.primaryColor);
		setSecondary(DEFAULT_BRANDING.secondaryColor);
	};

	const handleReset = () => {
		setBrandName(branding.brand_name || DEFAULT_BRAND_NAME);
		setPrimary(branding.primary_color || DEFAULT_BRANDING.primaryColor);
		setSecondary(branding.secondary_color || DEFAULT_BRANDING.secondaryColor);
		setNavDisplay(branding.nav_display ?? 'logo');
		setLogoFile(null);
		setLogoPreview(null);
		setLogoCleared(false);
		setIconFile(null);
		setIconPreview(null);
		setIconCleared(false);
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
				nav_display: navDisplay,
			});
			if (logoFile) {
				await uploadLogo(logoFile);
			} else if (logoCleared) {
				await clearLogo();
			}
			if (iconFile) {
				await uploadIcon(iconFile);
			} else if (iconCleared) {
				await clearIcon();
			}
			stateRefreshers?.refreshBranding();
			setLogoFile(null);
			setLogoPreview(null);
			setLogoCleared(false);
			setIconFile(null);
			setIconPreview(null);
			setIconCleared(false);
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

	// The expanded nav header, mirroring how Layout renders it for the chosen display mode.
	const renderExpandedHeader = () => {
		if (navDisplay === 'name') {
			return (
				<Typography.Text strong style={{ color: '#fff', fontSize: 13 }}>
					{brandName}
				</Typography.Text>
			);
		}
		if (navDisplay === 'both') {
			return (
				<Space size={6} align="center">
					<img src={previewIcon} alt="" style={{ maxHeight: 22, maxWidth: 22, objectFit: 'contain' }} />
					<Typography.Text strong style={{ color: '#fff', fontSize: 13 }}>
						{brandName}
					</Typography.Text>
				</Space>
			);
		}
		return <img src={previewLogo} alt={brandName} style={{ maxHeight: 28, maxWidth: '90%', objectFit: 'contain' }} />;
	};

	const imageUploadBox = (src: string | undefined, width: number, height: number, placeholder: string) => (
		<div
			style={{
				width,
				height,
				borderRadius: token.borderRadius,
				border: `1px dashed ${token.colorBorder}`,
				background: siderBg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				overflow: 'hidden',
				flex: '0 0 auto',
			}}
		>
			{src ? (
				<img src={src} alt="preview" style={{ maxHeight: '85%', maxWidth: '90%', objectFit: 'contain' }} />
			) : (
				<Typography.Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, textAlign: 'center' }}>
					{placeholder}
				</Typography.Text>
			)}
		</div>
	);

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
								<Space orientation="vertical" size={4}>
									<Typography.Text type="secondary">&nbsp;</Typography.Text>
									<Button onClick={resetColors} disabled={colorsAreDefault}>
										Reset to default
									</Button>
								</Space>
							</Space>
							<Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
								Primary drives the accent palette (buttons, links, the active nav item). Secondary is used for
								informational accents.
							</Typography.Paragraph>

							<Divider />

							<Typography.Title level={5} style={{ marginTop: 0 }}>
								Navigation header
							</Typography.Title>
							<Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 0, marginBottom: 12 }}>
								Choose what appears at the top of the sidebar when it is expanded. The collapsed rail always shows
								the icon.
							</Typography.Paragraph>
							<Radio.Group
								value={navDisplay}
								onChange={(e) => setNavDisplay(e.target.value as NavDisplay)}
								options={NAV_DISPLAY_OPTIONS}
							/>

							<Divider />

							<Typography.Title level={5} style={{ marginTop: 0 }}>
								Logo &amp; icon
							</Typography.Title>
							<Space align="start" size={32} wrap>
								{/* Full logo — larger by default (the expanded-sidebar wordmark) */}
								<Space orientation="vertical" align="center" size={8}>
									{imageUploadBox(currentLogo, 120, 64, 'No logo')}
									<Space size={4}>
										<Upload
											accept={ACCEPTED_TYPES}
											maxCount={1}
											showUploadList={false}
											beforeUpload={stageImage(setLogoFile, setLogoPreview, setLogoCleared)}
										>
											<Button size="large" icon={<UploadOutlined />}>
												{currentLogo ? 'Replace logo' : 'Upload logo'}
											</Button>
										</Upload>
										<Button
											type="text"
											size="large"
											icon={<DeleteOutlined />}
											onClick={clearImage(setLogoFile, setLogoPreview, setLogoCleared)}
											disabled={!currentLogo}
											title="Reset to default logo"
										>
											Clear
										</Button>
									</Space>
									<Typography.Text type="secondary" style={{ fontSize: 12 }}>
										Full wordmark — expanded sidebar
									</Typography.Text>
								</Space>

								{/* Compact icon — smaller (the collapsed-sidebar mark) */}
								<Space orientation="vertical" align="center" size={8}>
									{imageUploadBox(currentIcon, 56, 56, 'No icon')}
									<Space size={4}>
										<Upload
											accept={ACCEPTED_TYPES}
											maxCount={1}
											showUploadList={false}
											beforeUpload={stageImage(setIconFile, setIconPreview, setIconCleared)}
										>
											<Button size="small" icon={<UploadOutlined />}>
												{currentIcon ? 'Replace icon' : 'Upload icon'}
											</Button>
										</Upload>
										<Button
											type="text"
											size="small"
											icon={<DeleteOutlined />}
											onClick={clearImage(setIconFile, setIconPreview, setIconCleared)}
											disabled={!currentIcon}
											title="Reset to default icon"
										>
											Clear
										</Button>
									</Space>
									<Typography.Text type="secondary" style={{ fontSize: 12 }}>
										Square mark — collapsed sidebar
									</Typography.Text>
								</Space>
							</Space>
							<Typography.Paragraph type="secondary" style={{ fontSize: 12, marginTop: 12, marginBottom: 0 }}>
								PNG, JPEG, WEBP, or SVG up to 2 MB each. Leave unset to use the defaults.
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
								{/* Mock expanded sidebar */}
								<div style={{ width: 150, background: siderBg, padding: '12px 8px' }}>
									<div
										style={{
											height: 36,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											marginBottom: 12,
											overflow: 'hidden',
										}}
									>
										{renderExpandedHeader()}
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

							{/* Collapsed rail preview */}
							<Typography.Text
								type="secondary"
								style={{
									textTransform: 'uppercase',
									fontSize: 12,
									letterSpacing: 0.5,
									display: 'block',
									marginTop: 16,
								}}
							>
								Collapsed sidebar
							</Typography.Text>
							<div
								style={{
									marginTop: 8,
									width: 56,
									background: siderBg,
									borderRadius: token.borderRadius,
									border: `1px solid ${token.colorBorderSecondary}`,
									padding: '10px 6px',
									display: 'flex',
									flexDirection: 'column',
									alignItems: 'center',
									gap: 6,
								}}
							>
								<div
									style={{
										height: 30,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										marginBottom: 6,
									}}
								>
									<img
										src={previewIcon}
										alt={brandName}
										style={{ maxHeight: 24, maxWidth: 30, objectFit: 'contain' }}
									/>
								</div>
								{previewNavItems.map((item) => (
									<div
										key={item.label}
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											width: 32,
											height: 32,
											borderRadius: token.borderRadius,
											fontSize: 15,
											background: item.selected ? primary : 'transparent',
											color: item.selected ? '#fff' : 'rgba(255,255,255,0.65)',
										}}
									>
										{item.icon}
									</div>
								))}
							</div>
						</div>
					</Col>
				</Row>
			</div>
		</PageLayout>
	);
}
