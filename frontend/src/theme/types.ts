import type { Theme as MuiTheme, ThemeOptions } from '@mui/material/styles';
import type { TypographyStyle } from '@mui/material/styles/createTypography';
import type { CSSObject } from '@mui/styled-engine';
import type { Theme as SystemTheme } from '@mui/system/createTheme';

export type ThemeMode = 'light' | 'dark';

// 扩展 Typography 选项
export interface ExtendedTypographyOptions {
  fontFamily: string;
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;
  body1: TypographyStyle;
  body2: TypographyStyle;
  button: TypographyStyle;
}

// 扩展基础主题类型
export interface BaseTheme extends Omit<MuiTheme, 'typography'> {
  typography: ExtendedTypographyOptions;
}

// 扩展主题选项类型
export interface CustomThemeOptions extends Omit<ThemeOptions, 'typography'> {
  typography?: Partial<ExtendedTypographyOptions>;
}

// 扩展完整主题类型
export type CustomTheme = BaseTheme & {
  components?: {
    MuiButton?: {
      styleOverrides?: {
        root?: Partial<CSSObject>;
      };
    };
    MuiTextField?: {
      styleOverrides?: {
        root?: Partial<CSSObject>;
      };
    };
    MuiCard?: {
      styleOverrides?: {
        root?: Partial<CSSObject>;
      };
    };
    [key: string]: {
      styleOverrides?: {
        root?: Partial<CSSObject>;
      };
    } | undefined;
  };
};

// 使用 MUI System 的主题类型
export type Theme = SystemTheme;
