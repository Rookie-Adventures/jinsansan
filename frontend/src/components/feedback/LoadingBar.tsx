import { LinearProgress, styled } from '@mui/material';
import { type FC, useEffect, useState } from 'react';

import { useAppSelector } from '@/hooks';

// 样式化的进度条组件
const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.appBar + 1,
  height: 2,
  '& .MuiLinearProgress-bar': {
    backgroundColor: theme.palette.primary.main,
  },
}));

/**
 * 加载进度条组件
 * 在全局加载状态为 true 时显示，模拟进度增长，加载完成后平滑消失
 */
export const LoadingBar: FC = () => {
  // 进度值状态 (0-100)
  const [progress, setProgress] = useState(0);
  // 可见性状态
  const [visible, setVisible] = useState(false);
  // 全局加载状态
  const isLoading = useAppSelector(state => state.app.loading);

  useEffect(() => {
    let timer: number | undefined;

    if (isLoading) {
      // 开始加载时显示进度条
      setVisible(true);
      // 模拟进度增长，最大到 90%
      timer = window.setInterval(() => {
        setProgress(oldProgress => {
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 90);
        });
      }, 500);
    } else if (visible) {
      // 加载完成时，立即到达 100%
      setProgress(100);
      // 等待过渡动画完成后隐藏
      timer = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }

    // 清理定时器
    return () => {
      if (timer !== undefined) {
        if (isLoading) {
          window.clearInterval(timer);
        } else {
          window.clearTimeout(timer);
        }
      }
    };
  }, [isLoading, visible]);

  if (!visible) return null;

  return <StyledLinearProgress variant="determinate" value={progress} />;
};
