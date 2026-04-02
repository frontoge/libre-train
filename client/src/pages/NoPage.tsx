import { Button, Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useNavigate } from 'react-router-dom';

export function NoPage() {
	const navigate = useNavigate();

	return (
		<Layout
			style={{
				height: '100%',
				width: '100%',
				color: 'white',
			}}
		>
			<Content
				style={{
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<h1>404 - Page Not Found</h1>
				<Button type="primary" onClick={() => navigate('/')}>
					Go to Home
				</Button>
			</Content>
		</Layout>
	);
}
