import { Layout } from 'antd';
import { Content, Header } from 'antd/es/layout/layout';

type PageLayoutProps = {
	title?: string;
	children?: React.ReactNode;
	/** Applied to the outer Layout component */
	style?: React.CSSProperties;
	/** Applied to the inner Content component */
	contentStyle?: React.CSSProperties;
};

export default function PageLayout(props: PageLayoutProps) {
	return (
		<Layout style={props.style}>
			<Header style={{}}>
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
			<Content
				style={
					props.contentStyle || {
						padding: '2rem 3rem',
					}
				}
			>
				{props.children}
			</Content>
		</Layout>
	);
}
