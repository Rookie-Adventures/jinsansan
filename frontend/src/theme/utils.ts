import { Theme } from '@mui/material';

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
      [
        'background-color',
        'color',
        'border-color',
        'box-shadow',
      ],
      {
        duration: THEME_TRANSITION_DURATION,
        easing: theme.transitions.easing.easeInOut,
      }
    ),
  },
  // 特定元素过渡效果
  '.MuiPaper-root': {
    transition: theme.transitions.create(
      ['background-color', 'box-shadow'],
      {
        duration: THEME_TRANSITION_DURATION,
        easing: theme.transitions.easing.easeInOut,
      }
    ),
  },
  '.MuiAppBar-root': {
    transition: theme.transitions.create(
      ['background-color', 'box-shadow'],
      {
        duration: THEME_TRANSITION_DURATION,
        easing: theme.transitions.easing.easeInOut,
      }
    ),
  },
}); 