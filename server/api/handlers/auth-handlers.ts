import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabaseConnection } from '../../infrastructure/mysql-database';
import { RowDataPacket } from 'mysql2';
import argon2 from 'argon2';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

async function hashPassword(plain: string): Promise<string> {
  const salt = crypto.randomBytes(32);
  const hash = await argon2.hash(plain, { 
    type: argon2.argon2id,
    memoryCost: 19 * 1024,   // 19 MiB
    timeCost: 2,
    parallelism: 1,
    salt
  });
  
  return hash;
}

async function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}

export const passwordValidators = [
    // 1. Password must be present
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required'),

    // 2. Minimum length 8
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),

    // 3. At least one uppercase letter
    body('password')
      .matches(/[A-Z]/)
      .withMessage('Password must contain at least one uppercase letter'),

    // 4. At least one number
    body('password')
      .matches(/[0-9]/)
      .withMessage('Password must contain at least one number'),

    body('username')
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),

    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required'),
  ]

export const handleAuthLogin = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const connection = await getDatabaseConnection();
    try {
        const [results, fields] = await connection.query<RowDataPacket[]>({
            sql: 'SELECT * FROM User WHERE username = ?',
            values: [username]
        });

        if (
            results.length === 0 ||
            !results[0] ||
            results[0].length === 0
        ) {
            return res.status(401).json({ message: 'Invalid username' });
        }

        const user = results[0];
        
        const passwordMatch = await verifyPassword(user.pass, password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const accessToken = jwt.sign(
            { sub: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '3h' }
        );

        return res.status(200).json({
            accessToken,
            user: user.id
        });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ message: 'Internal server error during login' });
    }
}

export const handleAuthSignup = async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;
    const connection = await getDatabaseConnection();
    try {
        const [results, fields] = await connection.query<RowDataPacket[][]>({
            sql: 'SELECT * FROM User WHERE username = ?',
            values: [username]
        });

        if (results.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }
    } catch (error) {
        console.error('Error checking existing username:', error);
        return res.status(500).json({ message: 'Internal server error while checking for duplicate usernames' });
    }

    const passwordHash = await hashPassword(password);

    try {
        const [result] = await connection.execute<RowDataPacket[][]>({
            sql: 'CALL spCreateUser(?, ?)',
            values: [username, `${passwordHash}`]
        });

        const insertResult = result[0];

        if (!insertResult || insertResult.length === 0 || !insertResult[0]?.id) {
            console.error("Failed to create client:", "Failed to create contact.");
            res.status(500).json({ message: "Failed to create client." });
            return;
        }

        const accessToken = jwt.sign(
            { sub: insertResult[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        return res.status(201).json({
            accessToken,
            user: insertResult[0].id
        });

    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ message: 'Internal server error while creating user' });
    }
}