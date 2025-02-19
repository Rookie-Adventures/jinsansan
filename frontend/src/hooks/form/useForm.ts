import { yupResolver } from '@hookform/resolvers/yup';
import { DefaultValues, Resolver, useForm as useHookForm } from 'react-hook-form';

import type { ObjectSchema } from 'yup';

interface FormData {
  [key: string]: unknown;
}

interface UseFormProps<T extends FormData> {
  defaultValues?: DefaultValues<T>;
  schema?: ObjectSchema<T>;
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
}

export const useForm = <T extends FormData>({
  defaultValues,
  schema,
  mode = 'onSubmit',
}: UseFormProps<T> = {}) => {
  const methods = useHookForm<T>({
    defaultValues,
    resolver: schema ? (yupResolver(schema) as unknown as Resolver<T>) : undefined,
    mode,
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid },
    reset,
    setValue,
    getValues,
    trigger,
    control,
  } = methods;

  return {
    handleSubmit,
    errors,
    isSubmitting,
    isDirty,
    isValid,
    reset,
    setValue,
    getValues,
    trigger,
    control,
    methods,
  };
};
