import { describe, it, expect } from 'vitest';
import { createTheme, defaultTheme, darkTheme } from './index';
import type { CustomTheme, CustomThemeOptions } from './types';

describe('Theme', () => {
  describe('createTheme', () => {
    it('应该创建亮色主题', () => {
      const theme = createTheme(false) as unknown as CustomTheme;
      
      expect(theme.palette?.mode).toBe('light');
      expect(theme.palette?.background?.default).toBe(defaultTheme.palette?.background?.default);
      expect(theme.palette?.text?.primary).toBe(defaultTheme.palette?.text?.primary);
    });

    it('应该创建暗色主题', () => {
      const theme = createTheme(true) as unknown as CustomTheme;
      
      expect(theme.palette?.mode).toBe('dark');
      expect(theme.palette?.background?.default).toBe(darkTheme.palette?.background?.default);
      expect(theme.palette?.text?.primary).toBe(darkTheme.palette?.text?.primary);
    });

    it('应该合并自定义选项', () => {
      const customOptions: CustomThemeOptions = {
        palette: {
          primary: {
            main: '#ff0000'
          }
        }
      };

      const theme = createTheme(false, customOptions as any) as unknown as CustomTheme;
      expect(theme.palette?.primary?.main).toBe('#ff0000');
    });

    it('应该保持默认值不变', () => {
      const theme = createTheme(false) as unknown as CustomTheme;
      const defaultTypography = (defaultTheme as unknown as CustomTheme).typography;
      
      // 检查关键属性而不是整个对象
      expect(theme.palette?.primary).toEqual(defaultTheme.palette?.primary);
      expect(theme.palette?.secondary).toEqual(defaultTheme.palette?.secondary);
      
      // 检查关键的 typography 属性
      expect(theme.typography).toBeDefined();
      expect(theme.typography.fontFamily).toBe(defaultTypography.fontFamily);
      expect(theme.typography.h1?.fontSize).toBe(defaultTypography.h1?.fontSize);
      expect(theme.typography.h1?.fontWeight).toBe(defaultTypography.h1?.fontWeight);
      expect(theme.typography.body1?.fontSize).toBe(defaultTypography.body1?.fontSize);
      expect(theme.typography.body1?.lineHeight).toBe(defaultTypography.body1?.lineHeight);
      expect(theme.typography.button?.textTransform).toBe(defaultTypography.button?.textTransform);
      
      expect(theme.breakpoints?.values).toEqual(defaultTheme.breakpoints?.values);
      expect(theme.spacing).toBeDefined();
      expect(theme.transitions).toBeDefined();
      expect(theme.components).toBeDefined();
    });
  });

  describe('defaultTheme', () => {
    it('应该有所有必需的属性', () => {
      const theme = defaultTheme as unknown as CustomThemeOptions;
      expect(theme.palette).toBeDefined();
      expect(theme.typography).toBeDefined();
      expect(theme.spacing).toBeDefined();
      expect(theme.breakpoints).toBeDefined();
      expect(theme.transitions).toBeDefined();
      expect(theme.components).toBeDefined();
    });

    it('应该有正确的调色板配置', () => {
      const { palette } = defaultTheme;
      
      expect(palette?.primary).toBeDefined();
      expect(palette?.secondary).toBeDefined();
      expect(palette?.error).toBeDefined();
      expect(palette?.warning).toBeDefined();
      expect(palette?.info).toBeDefined();
      expect(palette?.success).toBeDefined();
    });

    it('应该有正确的排版配置', () => {
      const theme = defaultTheme as unknown as CustomThemeOptions;
      const { typography } = theme;
      
      expect(typography?.fontFamily).toBeDefined();
      expect(typography?.h1).toBeDefined();
      expect(typography?.body1).toBeDefined();
      expect(typography?.button).toBeDefined();
    });

    it('应该有响应式断点配置', () => {
      const { breakpoints } = defaultTheme;
      
      expect(breakpoints?.values?.xs).toBeDefined();
      expect(breakpoints?.values?.sm).toBeDefined();
      expect(breakpoints?.values?.md).toBeDefined();
      expect(breakpoints?.values?.lg).toBeDefined();
      expect(breakpoints?.values?.xl).toBeDefined();
    });
  });

  describe('darkTheme', () => {
    it('应该有正确的暗色调色板', () => {
      const { palette } = darkTheme;
      
      expect(palette?.mode).toBe('dark');
      expect(palette?.background?.default).toBeDefined();
      expect(palette?.background?.paper).toBeDefined();
      expect(palette?.text?.primary).toBeDefined();
      expect(palette?.text?.secondary).toBeDefined();
    });

    it('应该保持与默认主题相同的结构', () => {
      expect(Object.keys(darkTheme)).toEqual(Object.keys(defaultTheme));
    });

    it('应该有适当的对比度', () => {
      const { palette } = darkTheme;
      
      expect(palette?.background?.default).not.toBe(palette?.text?.primary);
      expect(palette?.background?.paper).not.toBe(palette?.text?.primary);
    });
  });

  describe('主题切换', () => {
    it('应该在亮暗主题之间正确切换', () => {
      const lightTheme = createTheme(false) as unknown as CustomTheme;
      const darkTheme = createTheme(true) as unknown as CustomTheme;

      expect(lightTheme.palette?.mode).toBe('light');
      expect(darkTheme.palette?.mode).toBe('dark');
      expect(lightTheme.palette?.background?.default).not.toBe(darkTheme.palette?.background?.default);
    });

    it('应该保持自定义设置在切换时不变', () => {
      const customOptions: CustomThemeOptions = {
        palette: {
          primary: {
            main: '#ff0000'
          }
        }
      };

      const lightTheme = createTheme(false, customOptions as any) as unknown as CustomTheme;
      const darkTheme = createTheme(true, customOptions as any) as unknown as CustomTheme;

      expect(lightTheme.palette?.primary?.main).toBe('#ff0000');
      expect(darkTheme.palette?.primary?.main).toBe('#ff0000');
    });
  });

  describe('组件样式', () => {
    it('应该有默认的组件样式覆盖', () => {
      const theme = createTheme(false) as unknown as CustomTheme;
      
      expect(theme.components?.MuiButton).toBeDefined();
      expect(theme.components?.MuiTextField).toBeDefined();
      expect(theme.components?.MuiCard).toBeDefined();
    });

    it('应该允许自定义组件样式', () => {
      const customOptions: CustomThemeOptions = {
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8
              }
            }
          }
        }
      };

      const theme = createTheme(false, customOptions as any) as unknown as CustomTheme;
      expect(theme.components?.MuiButton?.styleOverrides?.root).toEqual(
        expect.objectContaining({ borderRadius: 8 })
      );
    });
  });

  describe('响应式设计', () => {
    it('应该有正确的断点值', () => {
      const theme = createTheme(false) as unknown as CustomTheme;
      
      expect(theme.breakpoints?.values).toEqual({
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920
      });
    });

    it('应该有正确的间距单位', () => {
      const theme = createTheme(false) as unknown as CustomTheme;
      
      expect(typeof theme.spacing(1)).toBe('string');
      expect(theme.spacing(2)).toBe('16px');
      expect(theme.spacing(0.5)).toBe('4px');
    });
  });
}); 