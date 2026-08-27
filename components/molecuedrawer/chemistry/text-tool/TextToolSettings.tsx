"use client";

import styles from "./TextToolSettings.module.css";
import {
  TEXT_COLORS,
  TEXT_FONTS,
  TEXT_SIZES,
  type TextColorName,
  type TextSizeName,
  type TextToolSettingsValue,
} from "./types";

interface Props {
  value: TextToolSettingsValue;
  onChange: (value: TextToolSettingsValue) => void;
}

const COLOR_NAMES: Record<TextColorName, string> = {
  blue: "آبی",
  red: "قرمز",
  black: "مشکی",
  green: "سبز",
  pink: "صورتی",
};

const SIZE_NAMES: Record<TextSizeName, string> = {
  small: "کوچک",
  medium: "متوسط",
  large: "بزرگ",
};

export default function TextToolSettings({ value, onChange }: Props) {
  return (
    <div className={styles.panel} dir="rtl">
      <b className={styles.title}>تنظیمات متن</b>

      <span className={styles.label}>رنگ</span>

      <div className={styles.colors}>
        {(Object.keys(TEXT_COLORS) as TextColorName[]).map((color) => {
          const isActive = value.color === color;

          return (
            <button
              key={color}
              type="button"
              title={`رنگ ${COLOR_NAMES[color]}`}
              aria-label={`انتخاب رنگ ${COLOR_NAMES[color]}`}
              aria-pressed={isActive}
              className={`${styles.colorButton} ${
                isActive ? styles.active : ""
              }`}
              onClick={() => onChange({ ...value, color })}
            >
              <span
                className={styles.colorCircle}
                style={{ backgroundColor: TEXT_COLORS[color] }}
              />
            </button>
          );
        })}
      </div>

      <span className={styles.label}>اندازه</span>

      <div className={styles.sizes}>
        {(Object.keys(TEXT_SIZES) as TextSizeName[]).map((size) => {
          const isActive = value.size === size;

          return (
            <button
              key={size}
              type="button"
              title={`اندازه ${SIZE_NAMES[size]}`}
              aria-label={`انتخاب اندازه متن ${SIZE_NAMES[size]}`}
              aria-pressed={isActive}
              className={`${styles.sizeButton} ${
                isActive ? styles.active : ""
              }`}
              onClick={() => onChange({ ...value, size })}
            >
              <span
                aria-hidden="true"
                style={{
                  color: TEXT_COLORS[value.color],
                  fontSize: TEXT_SIZES[size],
                  fontFamily: TEXT_FONTS.english,
                  lineHeight: 1,
                }}
              >
                A
              </span>

              <small style={{ fontFamily: TEXT_FONTS.persian }}>
                {SIZE_NAMES[size]}
              </small>
            </button>
          );
        })}
      </div>
    </div>
  );
}
