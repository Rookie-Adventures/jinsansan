import { yupResolver } from '@hookform/resolvers/yup';
import { DefaultValues, Resolver, useForm as useHookForm, UseFormReturn as RHFUseFormReturn } from 'react-hook-form';

import type { ObjectSchema } from 'yup';

interface FormData {
  [key: string]: unknown;
}

interface UseFormProps<T extends FormData> {
  defaultValues?: DefaultValues<T>;
  schema?: ObjectSchema<T>;
  mode?: 'onSubmit' | 'onChange' | 'onBlur' | 'onTouched' | 'all';
}

type UseFormReturn<T extends FormData> = {
  handleSubmit: RHFUseFormReturn<T>['handleSubmit'];
  errors: RHFUseFormReturn<T>['formState']['errors'];
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  reset: RHFUseFormReturn<T>['reset'];
  setValue: RHFUseFormReturn<T>['setValue'];
  getValues: RHFUseFormReturn<T>['getValues'];
  trigger: RHFUseFormReturn<T>['trigger'];
  control: RHFUseFormReturn<T>['control'];
  methods: RHFUseFormReturn<T>;
};

export const useForm = <T extends FormData>({
  defaultValues,
  schema,
  mode = 'onSubmit',
}: UseFormProps<T> = {}): UseFormReturn<T> => {
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
