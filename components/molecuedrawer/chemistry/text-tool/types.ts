export const TEXT_COLORS = {
  blue: "#2563EB",
  red: "#DC2626",
  black: "#111827",
  green: "#16A34A",
  pink: "#EC4899",
} as const;

export type TextColorName = keyof typeof TEXT_COLORS;

export const TEXT_SIZES = {
  small: 14,
  medium: 18,
  large: 24,
} as const;

export type TextSizeName = keyof typeof TEXT_SIZES;

export interface TextToolSettingsValue {
  color: TextColorName;
  size: TextSizeName;
}

export const DEFAULT_TEXT_TOOL_SETTINGS: TextToolSettingsValue = {
  color: "red",
  size: "medium",
};

/**
 * فونت‌های رابط و متن‌های رسم‌شده.
 * Vazirmatn از طریق @fontsource/vazirmatn در app/layout.tsx بارگذاری می‌شود.
 */
export const TEXT_FONTS = {
  persian: "Vazirmatn",
  english: '"Times New Roman"',
} as const;

const PERSIAN_OR_ARABIC_REGEX =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * اگر متن کاراکتر فارسی یا عربی داشته باشد، Vazirmatn؛
 * در غیر این صورت Times New Roman انتخاب می‌شود.
 *
 * خروجی برای استفاده در Canvas مناسب است:
 * ctx.font = `400 ${fontSize}px ${resolveFontFamily(text)}`;
 */
export function resolveFontFamily(text: string): string {
  return PERSIAN_OR_ARABIC_REGEX.test(text)
    ? TEXT_FONTS.persian
    : TEXT_FONTS.english;
}
