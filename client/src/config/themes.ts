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

// Scales a hex color's channels by a factor (<1 darkens, >1 lightens toward white clamp).
const scaleColor = (hex: string, factor: number): string => {
	const [r, g, b] = hexToRgb(hex);
	return `#${toHex(r * factor)}${toHex(g * factor)}${toHex(b * factor)}`;
};

// A deep, on-brand tint of the primary for the dark side-nav surface (keeps the sidebar
// colored rather than a neutral near-black).
export const deriveSiderBg = (primary: string): string => scaleColor(primary, 0.16);

const withAlpha = (hex: string, alpha: number): string => {
	const [r, g, b] = hexToRgb(hex);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export type ColorMode = 'light' | 'dark';

export function buildTheme(branding?: Partial<BrandingTheme>, mode: ColorMode = 'dark'): ThemeConfig {
	const primaryColor = branding?.primaryColor || DEFAULT_BRANDING.primaryColor;
	const secondaryColor = branding?.secondaryColor || DEFAULT_BRANDING.secondaryColor;
	const isDark = mode === 'dark';

	// Dark mode: a deep, near-black on-brand sidebar with the bright primary marking the
	// selected item. Light mode: the sidebar IS the brand (selected-item) color, with a
	// darker shade of it marking selection — so the nav keeps the branding in both modes.
	const siderBg = isDark ? deriveSiderBg(primaryColor) : primaryColor;
	const selectedBg = isDark ? primaryColor : scaleColor(primaryColor, 0.72);
	const hoverBg = isDark ? withAlpha(primaryColor, 0.18) : withAlpha('#ffffff', 0.18);

	return {
		algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,

		token: {
			// Primary drives the auto-generated antd palette; secondary maps to the info accent.
			colorPrimary: primaryColor,
			colorInfo: secondaryColor,
		},

		components: {
			Layout: {
				// Header follows the color mode; the side nav stays on-brand in both modes.
				headerBg: isDark ? '#141414' : '#ffffff',
				siderBg: siderBg,
				triggerBg: siderBg,
			},
			Menu: {
				colorSplit: siderBg,

				// Ant Design's dark Menu uses its OWN token set that is NOT derived from
				// colorPrimary, so set them explicitly to keep the side nav on-brand.
				darkItemBg: siderBg,
				darkSubMenuItemBg: siderBg,
				darkPopupBg: siderBg,
				darkItemSelectedBg: selectedBg,
				darkItemSelectedColor: '#ffffff',
				darkItemHoverBg: hoverBg,
			},
		},
	};
}
