import React from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useUserMenu } from '@/hooks/layout/useUserMenu';

interface UserMenuProps {
  iconColor?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const UserMenu: React.FC<UserMenuProps> = ({ iconColor = 'inherit' }) => {
  const { anchorEl, username, isMenuOpen, handleMenu, handleClose, handleLogout } = useUserMenu();

  return (
    <>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color={iconColor}
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={isMenuOpen}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>{username}</MenuItem>
        <MenuItem onClick={handleLogout}>退出登录</MenuItem>
      </Menu>
    </>
  );
};

export default UserMenu; 