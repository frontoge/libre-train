import { BrandingResponse, ResponseWithError, Routes, UpdateBrandingRequest } from '@libre-train/shared';
import { Request, Response } from 'express';
import { prisma } from '../../database/mysql-database';
import { getLogoBucket, getObject, isStorageConfigured, putObject } from '../../storage/garage-storage';

// Branding is a single global, app-wide record.
const BRANDING_ID = 1;
const DEFAULT_BRAND_NAME = 'Libre Train';

// Colors are stored as 6-digit hex (the DB column is VARCHAR(7)).
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const isValidColor = (color?: string): boolean => color === undefined || HEX_COLOR.test(color);

const EXTENSION_BY_MIME: Record<string, string> = {
	'image/png': '.png',
	'image/jpeg': '.jpg',
	'image/webp': '.webp',
	'image/svg+xml': '.svg',
};

type BrandingRow = {
	brand_name: string;
	logo_key: string | null;
	primary_color: string | null;
	secondary_color: string | null;
	updated_at: Date;
};

const toBrandingResponse = (row: BrandingRow): BrandingResponse => ({
	brand_name: row.brand_name,
	primary_color: row.primary_color ?? undefined,
	secondary_color: row.secondary_color ?? undefined,
	// API-relative path; the client prefixes it with its API base. The `v` param busts the
	// browser cache whenever the logo (and thus updated_at) changes.
	logoUrl: row.logo_key ? `${Routes.Branding}/logo?v=${row.updated_at.getTime()}` : undefined,
});

const defaultBrandingResponse = (): BrandingResponse => ({
	brand_name: DEFAULT_BRAND_NAME,
	primary_color: undefined,
	secondary_color: undefined,
	logoUrl: undefined,
});

// Public — returns the active branding (or sensible defaults when unset).
export const handleGetBranding = async (_req: Request, res: Response<ResponseWithError<BrandingResponse>>) => {
	try {
		const row = await prisma.branding.findUnique({ where: { id: BRANDING_ID } });
		res.json(row ? toBrandingResponse(row) : defaultBrandingResponse());
	} catch (error) {
		console.error('Error fetching branding:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching branding.' });
	}
};

export const handleUpdateBranding = async (
	req: Request<{}, {}, UpdateBrandingRequest>,
	res: Response<ResponseWithError<BrandingResponse>>
) => {
	const { brand_name, primary_color, secondary_color } = req.body;
	if (!isValidColor(primary_color) || !isValidColor(secondary_color)) {
		res.status(400).json({ hasError: true, errorMessage: 'Colors must be 6-digit hex values (e.g. #49aa19).' });
		return;
	}
	try {
		const row = await prisma.branding.upsert({
			where: { id: BRANDING_ID },
			create: {
				id: BRANDING_ID,
				brand_name: brand_name?.trim() || DEFAULT_BRAND_NAME,
				primary_color: primary_color ?? null,
				secondary_color: secondary_color ?? null,
			},
			update: {
				brand_name: brand_name?.trim() ? brand_name.trim() : undefined,
				primary_color: primary_color ?? null,
				secondary_color: secondary_color ?? null,
			},
		});
		res.json(toBrandingResponse(row));
	} catch (error) {
		console.error('Error updating branding:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while updating branding.' });
	}
};

// Multipart upload (field name "file") → Garage; persists the object key.
export const handleUploadLogo = async (req: Request, res: Response<ResponseWithError<BrandingResponse>>) => {
	const file = req.file;
	if (!isStorageConfigured()) {
		res.status(503).json({ hasError: true, errorMessage: 'Object storage is not configured.' });
		return;
	}
	if (!file) {
		res.status(400).json({ hasError: true, errorMessage: 'No file was uploaded.' });
		return;
	}
	const extension = EXTENSION_BY_MIME[file.mimetype];
	if (!extension) {
		res.status(400).json({ hasError: true, errorMessage: 'Unsupported image type. Use PNG, JPEG, WEBP, or SVG.' });
		return;
	}
	try {
		const key = `logo${extension}`;
		await putObject(getLogoBucket(), key, file.buffer, file.mimetype);
		const row = await prisma.branding.upsert({
			where: { id: BRANDING_ID },
			create: { id: BRANDING_ID, brand_name: DEFAULT_BRAND_NAME, logo_key: key },
			update: { logo_key: key },
		});
		res.json(toBrandingResponse(row));
	} catch (error) {
		console.error('Error uploading logo:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while uploading the logo.' });
	}
};

// Public — streams the logo out of Garage so the bucket can stay internal/private.
export const handleGetLogo = async (_req: Request, res: Response) => {
	try {
		const row = await prisma.branding.findUnique({ where: { id: BRANDING_ID } });
		if (!row?.logo_key) {
			res.status(404).json({ hasError: true, errorMessage: 'No logo set.' });
			return;
		}
		if (!isStorageConfigured()) {
			res.status(503).json({ hasError: true, errorMessage: 'Object storage is not configured.' });
			return;
		}
		const object = await getObject(getLogoBucket(), row.logo_key);
		if (object.contentType) res.setHeader('Content-Type', object.contentType);
		if (object.contentLength !== undefined) res.setHeader('Content-Length', String(object.contentLength));
		res.setHeader('Cache-Control', 'public, max-age=300');
		object.stream.pipe(res);
	} catch (error) {
		console.error('Error fetching logo:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while fetching the logo.' });
	}
};
