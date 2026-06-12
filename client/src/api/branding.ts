import type { BrandingResponse, UpdateBrandingRequest } from '@libre-train/shared';
import { Routes } from '@libre-train/shared';
import { getAppConfiguration } from '../config/app.config';
import { apiFetch } from '../helpers/fetch-helpers';

// The server returns logoUrl as an API-relative path; resolve it against the API base so it
// can be used directly as an <img src>.
const resolveLogoUrl = (branding: BrandingResponse): BrandingResponse => ({
	...branding,
	logoUrl: branding.logoUrl ? `${getAppConfiguration().apiUrl}${branding.logoUrl}` : undefined,
});

export async function getBranding(): Promise<BrandingResponse> {
	const branding = await apiFetch<BrandingResponse>(Routes.Branding, {
		method: 'GET',
		errorMessage: 'Failed to fetch branding',
	});
	return resolveLogoUrl(branding);
}

export async function updateBranding(data: UpdateBrandingRequest): Promise<BrandingResponse> {
	const branding = await apiFetch<BrandingResponse, UpdateBrandingRequest>(Routes.Branding, {
		method: 'PUT',
		body: data,
		errorMessage: 'Failed to update branding',
	});
	return resolveLogoUrl(branding);
}

export async function uploadLogo(file: File): Promise<BrandingResponse> {
	const formData = new FormData();
	formData.append('file', file);

	// Use fetch directly (not apiFetch) so the browser sets the multipart Content-Type + boundary.
	const response = await fetch(`${getAppConfiguration().apiUrl}${Routes.Branding}/logo`, {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		throw new Error('Failed to upload logo');
	}

	const branding = (await response.json()) as BrandingResponse;
	return resolveLogoUrl(branding);
}
