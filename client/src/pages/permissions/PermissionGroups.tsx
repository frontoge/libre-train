import type { PermissionGroupWithPermissions } from '@libre-train/shared';
import {
	Button,
	Drawer,
	Empty,
	Form,
	Grid,
	Input,
	Popconfirm,
	Space,
	Spin,
	Table,
	Tag,
	theme,
	Tooltip,
	Tree,
	Typography,
} from 'antd';
import type { TableProps } from 'antd/es/table';
import type { DataNode } from 'antd/es/tree';
import { useEffect, useMemo, useState } from 'react';
import { FaLock, FaPen, FaPlus, FaRegTrashAlt, FaSearch, FaShieldAlt } from 'react-icons/fa';
import {
	createPermissionGroup,
	deletePermissionGroup,
	listPermissionGroups,
	updatePermissionGroup,
} from '../../api/permission-groups';
import PageLayout from '../../components/PageLayout';
import { useMessage } from '../../hooks/useMessage';
import { ALL_PERMISSION_IDS, GROUP_COLORS, PERMISSION_CATALOG, TOTAL_PERMISSIONS } from './permission-data';

type Group = PermissionGroupWithPermissions;
type DrawerMode = 'view' | 'edit' | 'create';

type GroupFormValues = {
	name?: string;
	description?: string;
};

const isCategoryKey = (key: React.Key): boolean => String(key).startsWith('cat:');

export function PermissionGroups() {
	const { token } = theme.useToken();
	const screens = Grid.useBreakpoint();
	const isMobile = !screens.md;
	const showMessage = useMessage();

	const [groups, setGroups] = useState<Group[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [searchInput, setSearchInput] = useState('');

	const [drawerOpen, setDrawerOpen] = useState(false);
	const [drawerMode, setDrawerMode] = useState<DrawerMode>('view');
	const [activeGroup, setActiveGroup] = useState<Group | null>(null);
	const [checkedPermissionIds, setCheckedPermissionIds] = useState<string[]>([]);
	const [form] = Form.useForm<GroupFormValues>();

	const readOnly = drawerMode === 'view';

	const refresh = async () => {
		setLoading(true);
		try {
			setGroups(await listPermissionGroups());
		} catch (error) {
			console.error('Error fetching permission groups:', error);
			showMessage('error', 'Failed to load permission groups.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		void refresh();
	}, []);

	const treeData: DataNode[] = useMemo(
		() =>
			PERMISSION_CATALOG.map((category) => ({
				title: <span style={{ fontWeight: 600 }}>{category.label}</span>,
				key: `cat:${category.key}`,
				children: category.permissions.map((permission) => ({
					key: permission.id,
					title: (
						<div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, padding: '2px 0' }}>
							<span style={{ color: token.colorText }}>{permission.label}</span>
							<span style={{ fontSize: 12, color: token.colorTextTertiary }}>{permission.description}</span>
						</div>
					),
				})),
			})),
		[token]
	);

	const categoryKeys = useMemo(() => PERMISSION_CATALOG.map((c) => `cat:${c.key}`), []);

	const filteredGroups = useMemo(() => {
		const term = searchInput.trim().toLowerCase();
		if (!term) return groups;
		return groups.filter((g) => g.name.toLowerCase().includes(term) || (g.description || '').toLowerCase().includes(term));
	}, [groups, searchInput]);

	const openCreate = () => {
		setDrawerMode('create');
		setActiveGroup(null);
		setCheckedPermissionIds([]);
		form.resetFields();
		setDrawerOpen(true);
	};

	const openView = (group: Group) => {
		setDrawerMode('view');
		setActiveGroup(group);
		setCheckedPermissionIds(group.permissionKeys);
		form.setFieldsValue({ name: group.name, description: group.description });
		setDrawerOpen(true);
	};

	const openEdit = (group: Group) => {
		setDrawerMode('edit');
		setActiveGroup(group);
		setCheckedPermissionIds(group.permissionKeys);
		form.setFieldsValue({ name: group.name, description: group.description });
		setDrawerOpen(true);
	};

	const closeDrawer = () => {
		setDrawerOpen(false);
		setActiveGroup(null);
		form.resetFields();
	};

	const handleSave = async () => {
		let values: GroupFormValues;
		try {
			values = await form.validateFields();
		} catch {
			return; // validation errors are surfaced inline by the form
		}
		if (!checkedPermissionIds.length) {
			showMessage('warning', 'Assign at least one permission to the group.');
			return;
		}

		const name = values.name!.trim();
		const description = values.description?.trim() || undefined;
		setSaving(true);
		try {
			if (drawerMode === 'create') {
				await createPermissionGroup({
					name,
					description,
					color: GROUP_COLORS[groups.length % GROUP_COLORS.length],
					permissionKeys: checkedPermissionIds,
				});
				showMessage('success', `Created "${name}".`);
			} else if (activeGroup) {
				await updatePermissionGroup(activeGroup.id, {
					name,
					description,
					color: activeGroup.color,
					permissionKeys: checkedPermissionIds,
				});
				showMessage('success', `Updated "${name}".`);
			}
			closeDrawer();
			await refresh();
		} catch (error) {
			console.error('Error saving permission group:', error);
			showMessage('error', error instanceof Error ? error.message : 'Failed to save permission group.');
		} finally {
			setSaving(false);
		}
	};

	const handleDelete = async (group: Group) => {
		try {
			await deletePermissionGroup(group.id);
			showMessage('success', `Deleted "${group.name}".`);
			await refresh();
		} catch (error) {
			console.error('Error deleting permission group:', error);
			showMessage('error', error instanceof Error ? error.message : 'Failed to delete permission group.');
		}
	};

	const selectAll = () => setCheckedPermissionIds([...ALL_PERMISSION_IDS]);
	const clearAll = () => setCheckedPermissionIds([]);

	const columns: TableProps<Group>['columns'] = [
		{
			title: 'Group',
			key: 'group',
			sorter: (a, b) => a.name.localeCompare(b.name),
			render: (_, group) => (
				<Space size={12} align="start">
					<div
						style={{
							width: 36,
							height: 36,
							borderRadius: 8,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							background: `${group.color || token.colorPrimary}1f`,
							color: group.color || token.colorPrimary,
							flex: '0 0 auto',
						}}
					>
						<FaShieldAlt />
					</div>
					<div style={{ minWidth: 0 }}>
						<Space size={6}>
							<span style={{ fontWeight: 600, color: token.colorText }}>{group.name}</span>
							{group.is_system && (
								<Tooltip title="System group — cannot be deleted">
									<Tag icon={<FaLock size={9} style={{ marginInlineEnd: 4 }} />} color="default">
										System
									</Tag>
								</Tooltip>
							)}
							{group.is_default && <Tag color="blue">Default</Tag>}
						</Space>
						<div style={{ fontSize: 12, color: token.colorTextSecondary }}>{group.description}</div>
					</div>
				</Space>
			),
		},
		{
			title: 'Permissions',
			key: 'permissions',
			width: 180,
			sorter: (a, b) => a.permissionKeys.length - b.permissionKeys.length,
			render: (_, group) =>
				group.permissionKeys.length >= TOTAL_PERMISSIONS ? (
					<Tag color="success">Full access</Tag>
				) : group.permissionKeys.length === 0 ? (
					<Typography.Text type="secondary">No access</Typography.Text>
				) : (
					<Typography.Text type="secondary">
						{group.permissionKeys.length} of {TOTAL_PERMISSIONS}
					</Typography.Text>
				),
		},
		{
			title: 'Members',
			dataIndex: 'memberCount',
			key: 'memberCount',
			width: 120,
			sorter: (a, b) => a.memberCount - b.memberCount,
			render: (count: number) => <Typography.Text type="secondary">{count}</Typography.Text>,
		},
		{
			title: 'Actions',
			key: 'actions',
			width: 130,
			align: 'right',
			render: (_, group) => (
				<Space size={2}>
					<Tooltip title="View">
						<Button type="text" icon={<FaShieldAlt />} onClick={() => openView(group)} />
					</Tooltip>
					<Tooltip title="Edit">
						<Button type="text" icon={<FaPen />} onClick={() => openEdit(group)} />
					</Tooltip>
					<Popconfirm
						title="Delete this group?"
						description="Members will lose its permissions. This cannot be undone."
						okText="Delete"
						okButtonProps={{ danger: true }}
						onConfirm={() => handleDelete(group)}
						disabled={group.is_system}
					>
						<Tooltip title={group.is_system ? 'System groups cannot be deleted' : 'Delete'}>
							<Button type="text" danger icon={<FaRegTrashAlt />} disabled={group.is_system} />
						</Tooltip>
					</Popconfirm>
				</Space>
			),
		},
	];

	const emptyState = (
		<Empty
			image={Empty.PRESENTED_IMAGE_SIMPLE}
			description={searchInput ? 'No groups match your search' : 'No permission groups yet'}
		>
			<Button type="primary" icon={<FaPlus />} onClick={openCreate}>
				New group
			</Button>
		</Empty>
	);

	const renderGroupCard = (group: Group) => (
		<div
			key={group.id}
			style={{
				border: `1px solid ${token.colorBorderSecondary}`,
				borderRadius: token.borderRadiusLG,
				padding: '0.875rem',
				background: token.colorBgContainer,
			}}
		>
			<div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
				<div
					style={{
						width: 40,
						height: 40,
						borderRadius: 8,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						background: `${group.color || token.colorPrimary}1f`,
						color: group.color || token.colorPrimary,
						flex: '0 0 auto',
					}}
				>
					<FaShieldAlt />
				</div>
				<div style={{ flex: 1, minWidth: 0 }}>
					<Space size={6} wrap>
						<span style={{ fontWeight: 600, color: token.colorText }}>{group.name}</span>
						{group.is_system && <Tag color="default">System</Tag>}
						{group.is_default && <Tag color="blue">Default</Tag>}
					</Space>
					<div style={{ fontSize: 13, color: token.colorTextSecondary, marginTop: 2 }}>{group.description}</div>
					<div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
						{group.permissionKeys.length >= TOTAL_PERMISSIONS ? (
							<Tag color="success">Full access</Tag>
						) : (
							<Typography.Text type="secondary" style={{ fontSize: 12 }}>
								{group.permissionKeys.length}/{TOTAL_PERMISSIONS} permissions
							</Typography.Text>
						)}
						<Typography.Text type="secondary" style={{ fontSize: 12 }}>
							{group.memberCount} members
						</Typography.Text>
					</div>
				</div>
			</div>
			<div
				style={{
					display: 'flex',
					justifyContent: 'flex-end',
					gap: 4,
					marginTop: 12,
					paddingTop: 12,
					borderTop: `1px solid ${token.colorBorderSecondary}`,
				}}
			>
				<Button size="small" type="text" icon={<FaShieldAlt />} onClick={() => openView(group)}>
					View
				</Button>
				<Button size="small" type="text" icon={<FaPen />} onClick={() => openEdit(group)}>
					Edit
				</Button>
				<Popconfirm
					title="Delete this group?"
					okText="Delete"
					okButtonProps={{ danger: true }}
					onConfirm={() => handleDelete(group)}
					disabled={group.is_system}
				>
					<Button size="small" type="text" danger icon={<FaRegTrashAlt />} disabled={group.is_system}>
						Delete
					</Button>
				</Popconfirm>
			</div>
		</div>
	);

	const drawerTitle =
		drawerMode === 'create' ? 'New permission group' : drawerMode === 'edit' ? 'Edit group' : activeGroup?.name;

	return (
		<PageLayout title="Permission Groups" contentStyle={{ padding: isMobile ? '1rem' : '1.5rem 2rem' }}>
			<div style={{ height: isMobile ? 'auto' : '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
				{/* Header */}
				<div
					style={{
						display: 'flex',
						alignItems: 'flex-start',
						justifyContent: 'space-between',
						gap: '1rem',
						flexWrap: 'wrap',
					}}
				>
					<div style={{ flex: '1 1 auto', minWidth: 0 }}>
						<Typography.Title level={3} style={{ margin: 0, color: token.colorTextHeading }}>
							Permission Groups
						</Typography.Title>
						<Typography.Text type="secondary">
							Define reusable roles and choose exactly what each group can access.
						</Typography.Text>
					</div>
					<Button
						type="primary"
						icon={<FaPlus />}
						onClick={openCreate}
						size="large"
						block={isMobile}
						style={isMobile ? undefined : { flex: '0 0 auto' }}
					>
						New Group
					</Button>
				</div>

				{/* Table / list */}
				<div
					style={{
						flex: isMobile ? '0 0 auto' : 1,
						display: 'flex',
						flexDirection: 'column',
						background: token.colorBgContainer,
						borderRadius: token.borderRadiusLG,
						border: `1px solid ${token.colorBorderSecondary}`,
						boxShadow: `0 1px 2px ${token.colorBgElevated}`,
						overflow: isMobile ? 'visible' : 'hidden',
					}}
				>
					<div
						style={{
							display: 'flex',
							flexWrap: 'wrap',
							alignItems: 'center',
							gap: '0.75rem',
							padding: isMobile ? '0.75rem' : '1rem 1rem 0.75rem',
						}}
					>
						<Input
							placeholder="Search groups..."
							prefix={<FaSearch style={{ marginRight: 8, color: token.colorTextTertiary }} />}
							value={searchInput}
							onChange={(e) => setSearchInput(e.target.value)}
							allowClear
							size="large"
							style={{ flex: '1 1 280px', minWidth: 0, maxWidth: isMobile ? undefined : 420 }}
						/>
						<div style={{ flex: '1 1 auto' }} />
						<Typography.Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
							{filteredGroups.length} {filteredGroups.length === 1 ? 'group' : 'groups'}
						</Typography.Text>
					</div>

					{loading ? (
						<div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
							<Spin size="large" />
						</div>
					) : isMobile ? (
						<div style={{ flex: 1, padding: '0.25rem 0.75rem 0.75rem' }}>
							{filteredGroups.length === 0 ? (
								<div style={{ padding: '2rem 0' }}>{emptyState}</div>
							) : (
								<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
									{filteredGroups.map(renderGroupCard)}
								</div>
							)}
						</div>
					) : (
						<Table<Group>
							rowKey="id"
							columns={columns}
							dataSource={filteredGroups}
							size="middle"
							style={{ width: '100%', flex: 1 }}
							pagination={{
								pageSize: 12,
								showSizeChanger: false,
								hideOnSinglePage: true,
								style: { padding: '0 1rem' },
							}}
							scroll={{ x: 760 }}
							locale={{ emptyText: emptyState }}
						/>
					)}
				</div>
			</div>

			{/* Create / edit / view drawer */}
			<Drawer
				open={drawerOpen}
				onClose={closeDrawer}
				styles={{ wrapper: { width: isMobile ? '100%' : 520 }, body: { display: 'flex', flexDirection: 'column' } }}
				title={drawerTitle}
				destroyOnHidden
				extra={
					readOnly && activeGroup && !activeGroup.is_system ? (
						<Button type="primary" icon={<FaPen />} onClick={() => setDrawerMode('edit')}>
							Edit
						</Button>
					) : readOnly && activeGroup?.is_system ? (
						<Tag icon={<FaLock size={9} style={{ marginInlineEnd: 4 }} />}>System group</Tag>
					) : undefined
				}
				footer={
					readOnly ? (
						<div style={{ textAlign: 'right' }}>
							<Button onClick={closeDrawer}>Close</Button>
						</div>
					) : (
						<div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
							<Button onClick={closeDrawer}>Cancel</Button>
							<Button type="primary" loading={saving} onClick={handleSave}>
								{drawerMode === 'create' ? 'Create group' : 'Save changes'}
							</Button>
						</div>
					)
				}
			>
				<Form form={form} layout="vertical" requiredMark="optional" disabled={readOnly}>
					<Form.Item name="name" label="Group name" rules={[{ required: true, message: 'Group name is required' }]}>
						<Input placeholder="e.g. Senior Trainer" maxLength={50} />
					</Form.Item>
					<Form.Item name="description" label="Description">
						<Input.TextArea placeholder="What is this group for?" rows={2} maxLength={160} />
					</Form.Item>
				</Form>

				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
					<div>
						<Typography.Text strong>Permissions</Typography.Text>
						<Typography.Text type="secondary" style={{ marginLeft: 8 }}>
							{checkedPermissionIds.length} of {TOTAL_PERMISSIONS} selected
						</Typography.Text>
					</div>
					{!readOnly && (
						<Space size={4}>
							<Button type="link" size="small" onClick={selectAll} style={{ paddingInline: 4 }}>
								Select all
							</Button>
							<Button type="link" size="small" onClick={clearAll} style={{ paddingInline: 4 }}>
								Clear
							</Button>
						</Space>
					)}
				</div>

				<div
					style={{
						flex: 1,
						overflow: 'auto',
						border: `1px solid ${token.colorBorderSecondary}`,
						borderRadius: token.borderRadiusLG,
						padding: '0.5rem',
						background: token.colorFillQuaternary,
					}}
				>
					<Tree
						checkable
						selectable={false}
						disabled={readOnly}
						treeData={treeData}
						defaultExpandedKeys={categoryKeys}
						checkedKeys={checkedPermissionIds}
						onCheck={(checked) => {
							const keys = Array.isArray(checked) ? checked : checked.checked;
							setCheckedPermissionIds(keys.filter((key) => !isCategoryKey(key)).map(String));
						}}
						style={{ background: 'transparent' }}
					/>
				</div>
			</Drawer>
		</PageLayout>
	);
}
