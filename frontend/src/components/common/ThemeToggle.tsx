import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { IconButton, Tooltip } from '@mui/material';

import type { FC } from 'react';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { toggleDarkMode } from '@/store/slices/appSlice';

export const ThemeToggle: FC = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.app.darkMode);

  const handleToggle = (): void => {
    dispatch(toggleDarkMode());
  };

  return (
    <Tooltip title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}>
      <IconButton onClick={handleToggle} color="inherit">
        {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};
