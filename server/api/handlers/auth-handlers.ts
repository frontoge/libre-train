import crypto from 'crypto';
import argon2 from 'argon2';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { prisma } from '../../database/mysql-database';

export async function hashPassword(plain: string): Promise<string> {
	const salt = crypto.randomBytes(32);
	const hash = await argon2.hash(plain, {
		type: argon2.argon2id,
		memoryCost: 19 * 1024, // 19 MiB
		timeCost: 2,
		parallelism: 1,
		salt,
	});

	return hash;
}

async function verifyPassword(hash: string, plain: string): Promise<boolean> {
	return argon2.verify(hash, plain);
}

// Same policy the express-validator chain enforces, usable outside a validation middleware
// (e.g. admin user creation and the set-password endpoint). Returns an error string or null.
export function validatePasswordStrength(password: unknown): string | null {
	if (typeof password !== 'string' || password.trim().length === 0) {
		return 'Password is required';
	}
	if (password.length < 8) {
		return 'Password must be at least 8 characters long';
	}
	if (!/[A-Z]/.test(password)) {
		return 'Password must contain at least one uppercase letter';
	}
	if (!/[0-9]/.test(password)) {
		return 'Password must contain at least one number';
	}
	return null;
}

export const passwordValidators = [
	// 1. Password must be present
	body('password').trim().notEmpty().withMessage('Password is required'),

	// 2. Minimum length 8
	body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),

	// 3. At least one uppercase letter
	body('password').matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter'),

	// 4. At least one number
	body('password').matches(/[0-9]/).withMessage('Password must contain at least one number'),

	body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters'),

	body('username').trim().notEmpty().withMessage('Username is required'),
];

export const handleAuthLogin = async (req: Request<{}, {}, { username: string; password: string }>, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { username, password } = req.body;
	try {
		const user = await prisma.user.findFirst({ where: { username } });

		if (!user) {
			return res.status(401).json({ message: 'Invalid username' });
		}

		const passwordMatch = await verifyPassword(user.pass, password);

		if (!passwordMatch) {
			return res.status(401).json({ message: 'Invalid username or password' });
		}

		const accessToken = jwt.sign({ sub: user.id }, process.env.JWT_SECRET!, { expiresIn: '2h' });

		const refreshToken = jwt.sign({ sub: user.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
			path: '/', // Only send cookie to refresh endpoint
		});

		return res.status(200).json({
			accessToken,
			user: user.id,
			mustChangePassword: user.must_change_password,
		});
	} catch (error) {
		console.error('Error during login:', error);
		return res.status(500).json({ message: 'Internal server error during login' });
	}
};

export const handleAuthRefresh = async (req: Request, res: Response) => {
	const refreshToken = req.cookies?.refreshToken as string | undefined;

	if (!refreshToken) {
		return res.status(401).json({ message: 'Refresh token missing' });
	}

	try {
		const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!);

		// This is causing collision with TS sub function, which is deprecated. JWT sub is not.
		// eslint-disable-next-line
		const userId = Number(payload.sub);
		const newAccessToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '2h' });

		// Re-read the flag so the set-password gate is re-established after a page reload, not
		// just at login.
		const user = await prisma.user.findUnique({ where: { id: userId }, select: { must_change_password: true } });

		return res.status(200).json({
			accessToken: newAccessToken,
			user: userId,
			mustChangePassword: user?.must_change_password ?? false,
		});
	} catch (error) {
		console.log('Error verifying refresh token:', error);
		res.clearCookie('refreshToken');
		return res.status(401).json({ message: 'Invalid refresh token' });
	}
};

// A signed-in user replacing the temporary password they were created with. Authenticated by
// the access token (Bearer) rather than a body-supplied id, and only usable while the user is
// actually flagged must_change_password — once cleared, the endpoint no longer applies.
export const handleSetPassword = async (req: Request<{}, {}, { password?: string }>, res: Response) => {
	const authHeader = req.headers.authorization;
	const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;

	if (!accessToken) {
		return res.status(401).json({ message: 'Authentication required' });
	}

	let userId: number;
	try {
		const payload = jwt.verify(accessToken, process.env.JWT_SECRET!);
		// eslint-disable-next-line
		userId = Number(payload.sub);
	} catch {
		return res.status(401).json({ message: 'Invalid or expired session' });
	}

	const passwordError = validatePasswordStrength(req.body.password);
	if (passwordError) {
		return res.status(400).json({ message: passwordError });
	}

	try {
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		if (!user.must_change_password) {
			return res.status(409).json({ message: 'Password has already been set.' });
		}

		const passwordHash = await hashPassword(req.body.password!);
		await prisma.user.update({
			where: { id: userId },
			data: { pass: passwordHash, must_change_password: false },
		});

		return res.status(200).json({ message: 'Password updated successfully.' });
	} catch (error) {
		console.error('Error setting password:', error);
		return res.status(500).json({ message: 'Internal server error while setting password' });
	}
};

export const handleAuthSignup = async (req: Request<{}, {}, { username: string; password: string }>, res: Response) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const { username, password } = req.body;
	try {
		const existingUser = await prisma.user.findFirst({ where: { username } });

		if (existingUser) {
			return res.status(409).json({ message: 'Username already exists' });
		}
	} catch (error) {
		console.error('Error checking existing username:', error);
		return res.status(500).json({ message: 'Internal server error while checking for duplicate usernames' });
	}

	const passwordHash = await hashPassword(password);

	try {
		const createdUser = await prisma.$transaction(async (tx) => {
			const placeholderContact = await tx.contact.create({
				data: {
					first_name: username,
					last_name: username,
					email: `${username.toLowerCase()}-${crypto.randomUUID()}@local.invalid`,
				},
			});

			return tx.user.create({
				data: {
					username,
					pass: passwordHash,
					contactId: placeholderContact.id,
				},
			});
		});

		const accessToken = jwt.sign({ sub: createdUser.id }, process.env.JWT_SECRET!, { expiresIn: '2h' });

		const refreshToken = jwt.sign({ sub: createdUser.id }, process.env.REFRESH_TOKEN_SECRET!, { expiresIn: '7d' });

		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days,
			path: '/api/auth/refresh', // Only send cookie to refresh endpoint
		});

		return res.status(201).json({
			accessToken,
			user: createdUser.id,
			mustChangePassword: createdUser.must_change_password,
		});
	} catch (error) {
		console.error('Error creating user:', error);
		return res.status(500).json({ message: 'Internal server error while creating user' });
	}
};

export const handleAuthLogout = (req: Request, res: Response) => {
	res.clearCookie('refreshToken');
	return res.status(200).json({ message: 'Logged out successfully' });
};
