import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { IconButton, Tooltip } from '@mui/material';

import { useAppDispatch, useAppSelector } from '@/hooks';
import { toggleDarkMode } from '@/store/slices/appSlice';

export const ThemeToggle = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector(state => state.app.darkMode);

  return (
    <Tooltip title={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}>
      <IconButton onClick={() => dispatch(toggleDarkMode())} color="inherit">
        {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
};
