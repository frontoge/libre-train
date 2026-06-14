import type { BrandingResponse, UpdateBrandingRequest } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';
import { apiFetch } from '../helpers/fetch-helpers';

// The server returns logoUrl / iconUrl as API-relative paths; resolve them against the API
// base so they can be used directly as an <img src>.
const resolveAssetUrls = (branding: BrandingResponse): BrandingResponse => {
	const base = getAppConfiguration().apiUrl;
	return {
		...branding,
		logoUrl: branding.logoUrl ? `${base}${branding.logoUrl}` : undefined,
		iconUrl: branding.iconUrl ? `${base}${branding.iconUrl}` : undefined,
	};
};

export async function getBranding(): Promise<BrandingResponse> {
	const branding = await apiFetch<BrandingResponse>(Routes.Branding, {
		method: 'GET',
		errorMessage: 'Failed to fetch branding',
	});
	return resolveAssetUrls(branding);
}

export async function updateBranding(data: UpdateBrandingRequest): Promise<BrandingResponse> {
	const branding = await apiFetch<BrandingResponse, UpdateBrandingRequest>(Routes.Branding, {
		method: 'PUT',
		body: data,
		errorMessage: 'Failed to update branding',
	});
	return resolveAssetUrls(branding);
}

// Uploads either the full logo or the compact icon (the two share the same multipart route shape).
async function uploadBrandingImage(kind: 'logo' | 'icon', file: File): Promise<BrandingResponse> {
	const formData = new FormData();
	formData.append('file', file);

	// Use fetch directly (not apiFetch) so the browser sets the multipart Content-Type + boundary.
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Branding}/${kind}`, {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		throw new Error(`Failed to upload ${kind}`);
	}

	const branding = (await response.json()) as BrandingResponse;
	return resolveAssetUrls(branding);
}

export const uploadLogo = (file: File): Promise<BrandingResponse> => uploadBrandingImage('logo', file);
export const uploadIcon = (file: File): Promise<BrandingResponse> => uploadBrandingImage('icon', file);

// Clears the uploaded logo or icon so the app reverts to its bundled default.
async function clearBrandingImage(kind: 'logo' | 'icon'): Promise<BrandingResponse> {
	const branding = await apiFetch<BrandingResponse>(`${Routes.Branding}/${kind}`, {
		method: 'DELETE',
		errorMessage: `Failed to clear ${kind}`,
	});
	return resolveAssetUrls(branding);
}

export const clearLogo = (): Promise<BrandingResponse> => clearBrandingImage('logo');
export const clearIcon = (): Promise<BrandingResponse> => clearBrandingImage('icon');
