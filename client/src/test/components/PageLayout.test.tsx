import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppContext, type AppState } from '../../app-context';
import PageLayout from '../../components/PageLayout';

const renderLayout = (path: string, props: Partial<React.ComponentProps<typeof PageLayout>> = {}) =>
	render(
		<MemoryRouter initialEntries={[path]}>
			<AppContext.Provider
				value={{
					state: {} as AppState,
					setState: vi.fn(),
					setAuth: vi.fn(),
					colorMode: 'light',
					toggleColorMode: vi.fn(),
				}}
			>
				<PageLayout {...props}>
					<p>Page body</p>
				</PageLayout>
			</AppContext.Provider>
		</MemoryRouter>
	);

describe('PageLayout', () => {
	it('renders no header bar or page title heading', () => {
		renderLayout('/clients/browse');

		expect(screen.queryByRole('banner')).not.toBeInTheDocument();
		expect(screen.queryByRole('heading')).not.toBeInTheDocument();
		expect(screen.queryByText('Page Title')).not.toBeInTheDocument();
	});

	it('puts the user menu on the same row as the breadcrumbs', () => {
		renderLayout('/clients/browse');

		const breadcrumbs = screen.getByRole('navigation');
		const userMenu = screen.getByLabelText('User menu');
		expect(breadcrumbs.parentElement).toBe(userMenu.parentElement);
		expect(screen.getByText('Browse')).toBeInTheDocument();
		expect(screen.getByText('Page body')).toBeInTheDocument();
	});

	it('uses breadcrumb overrides for the current page name', () => {
		renderLayout('/training/cycle/7/builder', { breadcrumbs: [{ label: 'Training', to: '/training' }, { label: 'Week 3' }] });

		expect(screen.getByText('Week 3')).toBeInTheDocument();
	});
});
