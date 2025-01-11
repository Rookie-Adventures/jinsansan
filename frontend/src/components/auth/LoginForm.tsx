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
  onChange: (value: string) => void;
  onTogglePassword: () => void;
}> = ({ value, showPassword, onChange, onTogglePassword }) => (
  <TextField
    fullWidth
    label="密码"
    type={showPassword ? 'text' : 'password'}
    variant="outlined"
    margin="normal"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={onTogglePassword} edge="end">
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
      onChange={(e) => onFormChange({ username: e.target.value })}
    />

    <PasswordField
      value={formData.password}
      showPassword={showPassword}
      onChange={(value) => onFormChange({ password: value })}
      onTogglePassword={onTogglePassword}
    />

    <Button
      fullWidth
      variant="contained"
      color="primary"
      size="large"
      type="submit"
      sx={{ mt: 3 }}
    >
      登录
    </Button>
  </Box>
);

export default LoginForm; 