/// <reference types="vite/client" />
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css';
import { BrowserRouter } from 'react-router-dom';

const baseUrl = import.meta.env.VITE_BASE_URL;

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<BrowserRouter basename={baseUrl ?? '/'}>
			<App />
		</BrowserRouter>
	</StrictMode>
);
