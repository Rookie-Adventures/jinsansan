import { Theme } from '@mui/material';
import { darken, lighten } from '@mui/material/styles';

/**
 * 主题切换动画持续时间（毫秒）
 */
export const THEME_TRANSITION_DURATION = 200;

/**
 * 获取主题过渡样式
 * @param theme - MUI主题对象
 * @returns 过渡样式对象
 */
export const getThemeTransitionStyles = (theme: Theme) => ({
  // 全局过渡效果
  '*': {
    transition: theme.transitions.create(
      ['background-color', 'color', 'border-color', 'box-shadow'],
      {
        duration: THEME_TRANSITION_DURATION,
        easing: theme.transitions.easing.easeInOut,
      }
    ),
  },
  // 特定元素过渡效果
  '.MuiPaper-root': {
    transition: theme.transitions.create(['background-color', 'box-shadow'], {
      duration: THEME_TRANSITION_DURATION,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
  '.MuiAppBar-root': {
    transition: theme.transitions.create(['background-color', 'box-shadow'], {
      duration: THEME_TRANSITION_DURATION,
      easing: theme.transitions.easing.easeInOut,
    }),
  },
});

export const getContrastText = (background: string): string => {
  if (!isValidColor(background)) {
    throw new Error('Invalid color format');
  }
  const rgb = hexToRgb(background);
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness >= 128 ? '#000000' : '#ffffff';
};

export const adjustColor = (color: string, amount: number): string => {
  if (amount < -1 || amount > 1) {
    throw new Error('Adjustment amount must be between -1 and 1');
  }
  const rgb = hexToRgb(color);
  const adjusted = {
    r: Math.min(
      255,
      Math.max(0, Math.round(rgb.r + (amount < 0 ? -rgb.r : 255 - rgb.r) * Math.abs(amount)))
    ),
    g: Math.min(
      255,
      Math.max(0, Math.round(rgb.g + (amount < 0 ? -rgb.g : 255 - rgb.g) * Math.abs(amount)))
    ),
    b: Math.min(
      255,
      Math.max(0, Math.round(rgb.b + (amount < 0 ? -rgb.b : 255 - rgb.b) * Math.abs(amount)))
    ),
  };
  return rgbToHex(adjusted);
};

export const createTransitions = (
  properties: string[],
  duration: number = 200,
  easing: string = 'ease'
): Record<string, string> => {
  return properties.reduce(
    (acc, prop) => ({
      ...acc,
      [prop]: `${duration}ms${easing ? ` ${easing}` : ''}`,
    }),
    {}
  );
};

export interface ColorPalette {
  main: string;
  light: string;
  dark: string;
  contrastText: string;
  alpha?: (opacity: number) => string;
}

export interface ExtendedColorPalette extends ColorPalette {
  secondary: ColorPalette;
}

export const generatePalette = (
  primaryColor: string,
  withSecondary: boolean = false
): ColorPalette | ExtendedColorPalette => {
  if (!isValidColor(primaryColor)) {
    throw new Error('Invalid color format');
  }

  const createAlphaFn = (color: string) => (opacity: number) => {
    const rgb = hexToRgb(color);
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${Math.max(0, Math.min(1, opacity))})`;
  };

  const palette: ColorPalette = {
    main: primaryColor,
    light: lighten(primaryColor, 0.2),
    dark: darken(primaryColor, 0.2),
    contrastText: getContrastText(primaryColor),
    alpha: createAlphaFn(primaryColor),
  };

  if (withSecondary) {
    const secondaryColor = generateSecondaryColor(primaryColor);
    return {
      ...palette,
      secondary: {
        main: secondaryColor,
        light: lighten(secondaryColor, 0.2),
        dark: darken(secondaryColor, 0.2),
        contrastText: getContrastText(secondaryColor),
        alpha: createAlphaFn(secondaryColor),
      },
    };
  }

  return palette;
};

// 辅助函数
const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

const isValidColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

const generateSecondaryColor = (primaryColor: string): string => {
  // 简单的互补色生成
  const rgb = hexToRgb(primaryColor);
  const r = (255 - rgb.r).toString(16).padStart(2, '0');
  const g = (255 - rgb.g).toString(16).padStart(2, '0');
  const b = (255 - rgb.b).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
};

const rgbToHex = (rgb: { r: number; g: number; b: number }): string => {
  const toHex = (n: number) => {
    const hex = Math.min(255, Math.max(0, n)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
};
