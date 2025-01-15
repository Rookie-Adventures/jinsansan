import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import React from 'react';

import { LoginFormData } from '@/types/auth';

interface LoginFormProps {
  formData: LoginFormData;
  showPassword: boolean;
  disabled?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: Partial<LoginFormData>) => void;
  onTogglePassword: () => void;
}

const FormHeader: React.FC = () => (
  <>
    <Typography variant="h4" component="h1" gutterBottom align="center">
      登录
    </Typography>
    <Typography color="textSecondary" align="center" sx={{ mb: 4 }}>
      欢迎回来！请登录您的账号
    </Typography>
  </>
);

const PasswordField: React.FC<{
  value: string;
  showPassword: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onTogglePassword: () => void;
}> = ({ value, showPassword, disabled, onChange, onTogglePassword }) => (
  <TextField
    fullWidth
    label="密码"
    type={showPassword ? 'text' : 'password'}
    variant="outlined"
    margin="normal"
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton 
            onClick={onTogglePassword} 
            edge="end"
            disabled={disabled}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
  />
);

const LoginForm: React.FC<LoginFormProps> = ({
  formData,
  showPassword,
  disabled,
  onSubmit,
  onFormChange,
  onTogglePassword,
}) => (
  <Box component="form" onSubmit={onSubmit}>
    <FormHeader />
    
    <TextField
      fullWidth
      label="用户名"
      variant="outlined"
      margin="normal"
      value={formData.username}
      disabled={disabled}
      onChange={(e) => onFormChange({ username: e.target.value })}
    />

    <PasswordField
      value={formData.password}
      showPassword={showPassword}
      disabled={disabled}
      onChange={(value) => onFormChange({ password: value })}
      onTogglePassword={onTogglePassword}
    />

    <Button
      fullWidth
      variant="contained"
      color="primary"
      size="large"
      type="submit"
      disabled={disabled}
      sx={{ mt: 3 }}
    >
      登录
    </Button>
  </Box>
);

export default LoginForm; 