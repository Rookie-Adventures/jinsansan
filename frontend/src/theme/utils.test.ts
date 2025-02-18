import { describe, it, expect } from 'vitest';

import { getContrastText, adjustColor, createTransitions, generatePalette } from './utils';
import type { ExtendedColorPalette } from './utils';

describe('Theme Utils', () => {
  describe('getContrastText', () => {
    it('应该为深色背景返回浅色文本', () => {
      expect(getContrastText('#000000')).toBe('#ffffff');
      expect(getContrastText('#123456')).toBe('#ffffff');
    });

    it('应该为浅色背景返回深色文本', () => {
      expect(getContrastText('#ffffff')).toBe('#000000');
      expect(getContrastText('#f5f5f5')).toBe('#000000');
    });

    it('应该处理无效的颜色值', () => {
      expect(() => getContrastText('invalid')).toThrow('Invalid color format');
      expect(() => getContrastText('')).toThrow();
    });

    it('应该处理不同格式的颜色值', () => {
      expect(getContrastText('#000000')).toBe('#ffffff');
      expect(getContrastText('#FFFFFF')).toBe('#000000');
      expect(getContrastText('#ff0000')).toBe('#ffffff');
      expect(getContrastText('#00ff00')).toBe('#000000');
    });
  });

  describe('adjustColor', () => {
    it('应该正确调整颜色亮度', () => {
      const lighterColor = adjustColor('#000000', 0.1);
      const darkerColor = adjustColor('#ffffff', -0.1);

      expect(lighterColor).toMatch(/^#[0-9a-f]{6}$/i);
      expect(darkerColor).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该处理边界值', () => {
      expect(adjustColor('#000000', 1)).toBe('#ffffff');
      expect(adjustColor('#ffffff', -1)).toBe('#000000');
    });

    it('应该验证调整量范围', () => {
      expect(() => adjustColor('#000000', 1.1)).toThrow(
        'Adjustment amount must be between -1 and 1'
      );
      expect(() => adjustColor('#000000', -1.1)).toThrow(
        'Adjustment amount must be between -1 and 1'
      );
    });

    it('应该保持有效的颜色格式', () => {
      const adjusted = adjustColor('#ff0000', 0.2);
      expect(adjusted).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('应该处理无效的调整值', () => {
      expect(() => adjustColor('#ff0000', 1.5)).toThrow();
      expect(() => adjustColor('#ff0000', -1.5)).toThrow();
    });
  });

  describe('createTransitions', () => {
    it('应该创建默认过渡', () => {
      const transitions = createTransitions(['opacity']);
      expect(transitions.opacity).toBe('200ms ease');
    });

    it('应该使用自定义持续时间', () => {
      const transitions = createTransitions(['opacity'], 300);
      expect(transitions.opacity).toBe('300ms ease');
    });

    it('应该使用自定义缓动函数', () => {
      const transitions = createTransitions(['opacity'], 200, 'linear');
      expect(transitions.opacity).toBe('200ms linear');
    });

    it('应该处理多个属性', () => {
      const transitions = createTransitions(['opacity', 'transform']);
      expect(transitions.opacity).toBe('200ms ease');
      expect(transitions.transform).toBe('200ms ease');
    });

    it('应该处理空属性列表', () => {
      const transitions = createTransitions([]);
      expect(Object.keys(transitions)).toHaveLength(0);
    });
  });

  describe('generatePalette', () => {
    it('应该从主色生成完整的调色板', () => {
      const palette = generatePalette('#1976d2');

      expect(palette.light).toBeDefined();
      expect(palette.main).toBe('#1976d2');
      expect(palette.dark).toBeDefined();
      expect(palette.contrastText).toBeDefined();
    });

    it('应该生成辅助色', () => {
      const palette = generatePalette('#1976d2', true) as ExtendedColorPalette;

      expect(palette.secondary).toBeDefined();
      expect(palette.secondary.main).toBeDefined();
      expect(palette.secondary.light).toBeDefined();
      expect(palette.secondary.dark).toBeDefined();
    });

    it('应该处理无效的主色', () => {
      expect(() => generatePalette('invalid')).toThrow();
    });

    it('应该生成可访问性兼容的对比色', () => {
      const palette = generatePalette('#000000');
      expect(palette.contrastText).toBe('#ffffff');

      const lightPalette = generatePalette('#ffffff');
      expect(lightPalette.contrastText).toBe('#000000');
    });
  });
});
