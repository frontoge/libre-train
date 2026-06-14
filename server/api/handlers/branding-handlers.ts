import {
	BrandingResponse,
	NAV_DISPLAY_OPTIONS,
	NavDisplay,
	ResponseWithError,
	Routes,
	UpdateBrandingRequest,
} from '@libre-train/shared';
import { Request, Response } from 'express';
import { prisma } from '../../database/mysql-database';
import { deleteObject, getLogoBucket, getObject, isStorageConfigured, putObject } from '../../storage/garage-storage';

// Branding is a single global, app-wide record.
const BRANDING_ID = 1;
const DEFAULT_BRAND_NAME = 'Libre Train';
const DEFAULT_NAV_DISPLAY: NavDisplay = 'logo';

// Colors are stored as 6-digit hex (the DB column is VARCHAR(7)).
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;
const isValidColor = (color?: string): boolean => color === undefined || HEX_COLOR.test(color);
const isValidNavDisplay = (value?: string): value is NavDisplay | undefined =>
	value === undefined || (NAV_DISPLAY_OPTIONS as readonly string[]).includes(value);

const EXTENSION_BY_MIME: Record<string, string> = {
	'image/png': '.png',
	'image/jpeg': '.jpg',
	'image/webp': '.webp',
	'image/svg+xml': '.svg',
};

// The two uploadable brand images, keyed by the DB column that stores their object key.
const IMAGE_FIELDS = {
	logo: { column: 'logo_key', route: 'logo' },
	icon: { column: 'icon_key', route: 'icon' },
} as const;
type ImageKind = keyof typeof IMAGE_FIELDS;
// Partial set of image-key columns (null clears the key, falling back to the default).
type ImageKeyData = { logo_key?: string | null; icon_key?: string | null };

type BrandingRow = {
	brand_name: string;
	logo_key: string | null;
	icon_key: string | null;
	nav_display: string | null;
	primary_color: string | null;
	secondary_color: string | null;
	updated_at: Date;
};

// API-relative path; the client prefixes it with its API base. The `v` param busts the
// browser cache whenever the image (and thus updated_at) changes.
const imageUrl = (route: string, key: string | null, updatedAt: Date): string | undefined =>
	key ? `${Routes.Branding}/${route}?v=${updatedAt.getTime()}` : undefined;

const toBrandingResponse = (row: BrandingRow): BrandingResponse => ({
	brand_name: row.brand_name,
	primary_color: row.primary_color ?? undefined,
	secondary_color: row.secondary_color ?? undefined,
	nav_display: (row.nav_display as NavDisplay | null) ?? DEFAULT_NAV_DISPLAY,
	logoUrl: imageUrl('logo', row.logo_key, row.updated_at),
	iconUrl: imageUrl('icon', row.icon_key, row.updated_at),
});

const defaultBrandingResponse = (): BrandingResponse => ({
	brand_name: DEFAULT_BRAND_NAME,
	primary_color: undefined,
	secondary_color: undefined,
	nav_display: DEFAULT_NAV_DISPLAY,
	logoUrl: undefined,
	iconUrl: undefined,
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
	const { brand_name, primary_color, secondary_color, nav_display } = req.body;
	if (!isValidColor(primary_color) || !isValidColor(secondary_color)) {
		res.status(400).json({ hasError: true, errorMessage: 'Colors must be 6-digit hex values (e.g. #49aa19).' });
		return;
	}
	if (!isValidNavDisplay(nav_display)) {
		res.status(400).json({ hasError: true, errorMessage: `nav_display must be one of: ${NAV_DISPLAY_OPTIONS.join(', ')}.` });
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
				nav_display: nav_display ?? DEFAULT_NAV_DISPLAY,
			},
			update: {
				brand_name: brand_name?.trim() ? brand_name.trim() : undefined,
				primary_color: primary_color ?? null,
				secondary_color: secondary_color ?? null,
				nav_display: nav_display ?? undefined,
			},
		});
		res.json(toBrandingResponse(row));
	} catch (error) {
		console.error('Error updating branding:', error);
		res.status(500).json({ hasError: true, errorMessage: 'An error occurred while updating branding.' });
	}
};

// Multipart upload (field name "file") → Garage; persists the object key for the given image.
const uploadBrandingImage = async (kind: ImageKind, req: Request, res: Response<ResponseWithError<BrandingResponse>>) => {
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
		const { column } = IMAGE_FIELDS[kind];
		const key = `${kind}${extension}`;
		await putObject(getLogoBucket(), key, file.buffer, file.mimetype);
		const keyData: ImageKeyData = { [column]: key };
		const row = await prisma.branding.upsert({
			where: { id: BRANDING_ID },
			create: { id: BRANDING_ID, brand_name: DEFAULT_BRAND_NAME, ...keyData },
			update: keyData,
		});
		res.json(toBrandingResponse(row));
	} catch (error) {
		console.error(`Error uploading ${kind}:`, error);
		res.status(500).json({ hasError: true, errorMessage: `An error occurred while uploading the ${kind}.` });
	}
};

export const handleUploadLogo = (req: Request, res: Response<ResponseWithError<BrandingResponse>>) =>
	uploadBrandingImage('logo', req, res);
export const handleUploadIcon = (req: Request, res: Response<ResponseWithError<BrandingResponse>>) =>
	uploadBrandingImage('icon', req, res);

// Clears an uploaded image so the app falls back to its bundled default; best-effort removes
// the stored object too so the bucket doesn't accumulate orphans.
const clearBrandingImage = async (kind: ImageKind, _req: Request, res: Response<ResponseWithError<BrandingResponse>>) => {
	try {
		const { column } = IMAGE_FIELDS[kind];
		const existing = await prisma.branding.findUnique({ where: { id: BRANDING_ID } });
		const existingKey = existing?.[column];
		if (existingKey && isStorageConfigured()) {
			try {
				await deleteObject(getLogoBucket(), existingKey);
			} catch (error) {
				console.error(`Error deleting stored ${kind}:`, error);
			}
		}
		const keyData: ImageKeyData = { [column]: null };
		const row = await prisma.branding.upsert({
			where: { id: BRANDING_ID },
			create: { id: BRANDING_ID, brand_name: DEFAULT_BRAND_NAME },
			update: keyData,
		});
		res.json(toBrandingResponse(row));
	} catch (error) {
		console.error(`Error clearing ${kind}:`, error);
		res.status(500).json({ hasError: true, errorMessage: `An error occurred while clearing the ${kind}.` });
	}
};

export const handleClearLogo = (req: Request, res: Response<ResponseWithError<BrandingResponse>>) =>
	clearBrandingImage('logo', req, res);
export const handleClearIcon = (req: Request, res: Response<ResponseWithError<BrandingResponse>>) =>
	clearBrandingImage('icon', req, res);

// Public — streams the image out of Garage so the bucket can stay internal/private.
const serveBrandingImage = async (kind: ImageKind, _req: Request, res: Response) => {
	try {
		const { column } = IMAGE_FIELDS[kind];
		const row = await prisma.branding.findUnique({ where: { id: BRANDING_ID } });
		const key = row?.[column];
		if (!key) {
			res.status(404).json({ hasError: true, errorMessage: `No ${kind} set.` });
			return;
		}
		if (!isStorageConfigured()) {
			res.status(503).json({ hasError: true, errorMessage: 'Object storage is not configured.' });
			return;
		}
		const object = await getObject(getLogoBucket(), key);
		if (object.contentType) res.setHeader('Content-Type', object.contentType);
		if (object.contentLength !== undefined) res.setHeader('Content-Length', String(object.contentLength));
		res.setHeader('Cache-Control', 'public, max-age=300');
		object.stream.pipe(res);
	} catch (error) {
		console.error(`Error fetching ${kind}:`, error);
		res.status(500).json({ hasError: true, errorMessage: `An error occurred while fetching the ${kind}.` });
	}
};

export const handleGetLogo = (req: Request, res: Response) => serveBrandingImage('logo', req, res);
export const handleGetIcon = (req: Request, res: Response) => serveBrandingImage('icon', req, res);
