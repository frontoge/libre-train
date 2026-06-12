import { theme, type ThemeConfig } from 'antd';

export type BrandingTheme = {
	primaryColor: string;
	secondaryColor: string;
};

// Fallbacks used for first paint and whenever a branding value is unset.
export const DEFAULT_BRANDING: BrandingTheme = {
	primaryColor: '#49aa19',
	secondaryColor: '#13a8a8',
};

const hexToRgb = (hex: string): [number, number, number] => {
	const normalized = hex.replace('#', '');
	const full =
		normalized.length === 3
			? normalized
					.split('')
					.map((c) => c + c)
					.join('')
			: normalized;
	const int = parseInt(full, 16);
	if (Number.isNaN(int)) return hexToRgb(DEFAULT_BRANDING.primaryColor);
	return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

const toHex = (n: number) =>
	Math.max(0, Math.min(255, Math.round(n)))
		.toString(16)
		.padStart(2, '0');

// A deep, on-brand tint of the primary for the dark side-nav surface (keeps the sidebar
// colored rather than a neutral near-black).
export const deriveSiderBg = (primary: string): string => {
	const [r, g, b] = hexToRgb(primary);
	const factor = 0.16;
	return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`;
};

const withAlpha = (hex: string, alpha: number): string => {
	const [r, g, b] = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function buildTheme(branding?: Partial<BrandingTheme>): ThemeConfig {
	const primaryColor = branding?.primaryColor || DEFAULT_BRANDING.primaryColor;
	const secondaryColor = branding?.secondaryColor || DEFAULT_BRANDING.secondaryColor;
	const siderBg = deriveSiderBg(primaryColor);

	return {
		algorithm: theme.darkAlgorithm, // Enables built-in dark mode

		token: {
			// Primary drives the auto-generated antd palette; secondary maps to the info accent.
			colorPrimary: primaryColor,
			colorInfo: secondaryColor,
		},

		components: {
			Layout: {
				headerBg: '#141414',
				siderBg: siderBg,
				triggerBg: siderBg,
			},
			Menu: {
				colorSplit: siderBg,

				// Ant Design's dark Menu uses its OWN token set that is NOT derived from
				// colorPrimary, so set them explicitly to keep the dark side nav on-brand.
				darkItemBg: siderBg,
				darkSubMenuItemBg: siderBg,
				darkPopupBg: siderBg,
				darkItemSelectedBg: primaryColor,
				darkItemSelectedColor: '#ffffff',
				darkItemHoverBg: withAlpha(primaryColor, 0.18),
			},
		},
	};
}
