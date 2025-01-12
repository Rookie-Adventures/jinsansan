import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';
import { Controller, Control } from 'react-hook-form';

interface FormFieldProps extends Omit<TextFieldProps, 'name'> {
  name: string;
  control: Control<any>;
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  control,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...props}
          error={!!error}
          helperText={error?.message}
          fullWidth
        />
      )}
    />
  );
}; 