import { TextField, TextFieldProps } from '@mui/material';
import React from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

interface FormFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'name'> {
  name: Path<T>;
  control: Control<T>;
}

export const FormField = <T extends FieldValues>({
  name,
  control,
  ...props
}: FormFieldProps<T>): React.ReactElement => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField {...field} {...props} error={!!error} helperText={error?.message} fullWidth />
      )}
    />
  );
};
