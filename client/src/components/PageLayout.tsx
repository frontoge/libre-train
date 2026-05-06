import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb, Layout, theme } from 'antd';
import { Content, Header } from 'antd/es/layout/layout';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

export type BreadcrumbItem = {
	label: string;
	to?: string;
};

type PageLayoutProps = {
	title?: string;
	children?: React.ReactNode;
	/** Override the auto-derived breadcrumb trail. The Home crumb is always prepended. */
	breadcrumbs?: BreadcrumbItem[];
	/** Applied to the outer Layout component */
	style?: React.CSSProperties;
	/** Applied to the inner Content component */
	contentStyle?: React.CSSProperties;
};

const ROUTE_LABELS: Record<string, string> = {
	clients: 'Clients',
	exercises: 'Exercises',
	goals: 'Goals',
	training: 'Training',
	assessments: 'Assessments',
	diet: 'Diet',
	create: 'Create',
	browse: 'Browse',
	view: 'View',
	cycle: 'Cycle',
	builder: 'Builder',
	plans: 'Plans',
	log: 'Log',
};

const isDynamicSegment = (segment: string): boolean => /^\d+$/.test(segment);

function deriveBreadcrumbs(pathname: string): BreadcrumbItem[] {
	const segments = pathname.split('/').filter(Boolean);
	const crumbs: BreadcrumbItem[] = [];
	let acc = '';

	for (const segment of segments) {
		acc += `/${segment}`;
		if (isDynamicSegment(segment)) continue;
		crumbs.push({
			label: ROUTE_LABELS[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1),
			to: acc,
		});
	}

	return crumbs;
}

export default function PageLayout(props: PageLayoutProps) {
	const { token } = theme.useToken();
	const location = useLocation();

	const trail = useMemo<BreadcrumbItem[]>(
		() => props.breadcrumbs ?? deriveBreadcrumbs(location.pathname),
		[props.breadcrumbs, location.pathname]
	);

	const crumbItems = useMemo(() => {
		const items = [
			{
				key: 'home',
				title: (
					<Link to="/" aria-label="Home">
						<HomeOutlined />
					</Link>
				),
			},
			...trail.map((crumb, index) => {
				const isLast = index === trail.length - 1;
				return {
					key: `${index}-${crumb.label}`,
					title: !isLast && crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label,
				};
			}),
		];
		return items;
	}, [trail]);

	const layoutStyle: React.CSSProperties = {
		height: '100%',
		display: 'flex',
		flexDirection: 'column',
		background: token.colorBgLayout,
		overflow: 'auto',
		...props.style,
	};

	const contentStyle: React.CSSProperties = props.contentStyle ?? {
		padding: '1.5rem 2rem',
	};

	return (
		<Layout style={layoutStyle}>
			<Header style={{ flex: '0 0 auto' }}>
				<h1
					style={{
						margin: 0,
						padding: 0,
						fontSize: '1.5rem',
					}}
				>
					{props.title || 'Page Title'}
				</h1>
			</Header>
			<div
				style={{
					flex: '0 0 auto',
					padding: '0.75rem 2rem 0',
				}}
			>
				<Breadcrumb items={crumbItems} />
			</div>
			<Content style={contentStyle}>{props.children}</Content>
		</Layout>
	);
}
