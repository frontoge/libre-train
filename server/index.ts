import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Request, Response } from 'express';
import apiRouter from './api/router';

console.log('Starting server...');

if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
	console.error('JWT_SECRET and REFRESH_TOKEN_SECRET environment variables must be set');
	process.exit(1);
}

const app = express();
const port = 3000;

app.use(
	cors({
		// TODO change this to fill with frontend Deployment URL
		origin: process.env.FRONTEND_URL, // Adjust as necessary for CORS
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		allowedHeaders: ['Content-Type', 'Authorization'],
		credentials: true,
	})
);
// Increase the limit for JSON payloads
app.use(express.json({ limit: '5mb' }));

// Increase the limit for URL-encoded payloads (if applicable)
app.use(express.urlencoded({ limit: '5mb', extended: true }));

app.use(cookieParser());

app.use('/api', apiRouter);

app.get(/(.*)/, (req: Request, res: Response) => {
	res.status(404).json({
		error: 'Not Found',
	});
});

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`);
});
