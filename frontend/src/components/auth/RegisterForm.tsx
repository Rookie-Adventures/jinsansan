import { Box, Button } from '@mui/material';
import * as yup from 'yup';

import { FormField } from '@/components/form/FormField';
import { useForm } from '@/hooks/form/useForm';
import { email, password, confirmPassword, username } from '@/utils/validations/rules';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const defaultValues: RegisterFormData = {
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
};

const schema = yup.object({
  username: username(),
  email: email(),
  password: password(),
  confirmPassword: confirmPassword('password'),
}).required() as yup.ObjectSchema<RegisterFormData>;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit }) => {
  const { control, handleSubmit, isSubmitting } = useForm<RegisterFormData>({
    schema,
    defaultValues,
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
    >
      <FormField
        name="username"
        control={control}
        label="用户名"
        placeholder="请输入用户名"
      />
      
      <FormField
        name="email"
        control={control}
        label="邮箱"
        placeholder="请输入邮箱"
        type="email"
      />
      
      <FormField
        name="password"
        control={control}
        label="密码"
        placeholder="请输入密码"
        type="password"
      />
      
      <FormField
        name="confirmPassword"
        control={control}
        label="确认密码"
        placeholder="请再次输入密码"
        type="password"
      />
      
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        sx={{ mt: 2 }}
      >
        {isSubmitting ? '注册中...' : '注册'}
      </Button>
    </Box>
  );
}; 