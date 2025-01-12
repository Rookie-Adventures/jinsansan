import { useForm as useHookForm, DefaultValues, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { ObjectSchema, AnyObject } from 'yup';

interface UseFormProps<T extends Record<string, any>> {
  defaultValues?: DefaultValues<T>;
  schema?: ObjectSchema<T>;
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
}

export const useForm = <T extends Record<string, any>>({
  defaultValues,
  schema,
  mode = 'onSubmit'
}: UseFormProps<T> = {}) => {
  const methods = useHookForm<T>({
    defaultValues,
    resolver: schema 
      ? (yupResolver(schema) as unknown as Resolver<T>)
      : undefined,
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