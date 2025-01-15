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

import { RegisterFormData } from '@/types/auth';

interface RegisterFormProps {
  formData: RegisterFormData;
  showPassword: boolean;
  disabled?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onFormChange: (data: Partial<RegisterFormData>) => void;
  onTogglePassword: () => void;
}

const FormHeader: React.FC = () => (
  <>
    <Typography variant="h4" component="h1" gutterBottom align="center">
      注册
    </Typography>
    <Typography color="textSecondary" align="center" sx={{ mb: 4 }}>
      创建您的账号
    </Typography>
  </>
);

const PasswordField: React.FC<{
  label: string;
  value: string;
  showPassword: boolean;
  disabled?: boolean;
  onChange: (value: string) => void;
  onTogglePassword: () => void;
}> = ({ label, value, showPassword, disabled, onChange, onTogglePassword }) => (
  <TextField
    fullWidth
    label={label}
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

const RegisterForm: React.FC<RegisterFormProps> = ({
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

    <TextField
      fullWidth
      label="邮箱"
      type="email"
      variant="outlined"
      margin="normal"
      value={formData.email}
      disabled={disabled}
      onChange={(e) => onFormChange({ email: e.target.value })}
    />

    <PasswordField
      label="密码"
      value={formData.password}
      showPassword={showPassword}
      disabled={disabled}
      onChange={(value) => onFormChange({ password: value })}
      onTogglePassword={onTogglePassword}
    />

    <PasswordField
      label="确认密码"
      value={formData.confirmPassword}
      showPassword={showPassword}
      disabled={disabled}
      onChange={(value) => onFormChange({ confirmPassword: value })}
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
      注册
    </Button>
  </Box>
);

export default RegisterForm; 