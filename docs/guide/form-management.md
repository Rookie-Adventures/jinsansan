# 表单管理系统

## 概述

表单管理系统基于 React Hook Form 和 Yup 构建，提供了类型安全的表单处理、验证和状态管理功能。

## 核心功能

### 1. 表单配置

```typescript
interface FormConfig<T extends Record<string, any>> {
  defaultValues?: DeepPartial<T>;
  validationSchema?: SchemaOf<T>;
  mode?: 'onSubmit' | 'onChange' | 'onBlur';
  reValidateMode?: 'onChange' | 'onBlur';
}

interface FormProps<T extends Record<string, any>> {
  config: FormConfig<T>;
  onSubmit: (data: T) => Promise<void>;
  children: React.ReactNode;
}
```

### 2. 验证规则

```typescript
import * as yup from 'yup';

const userSchema = yup.object({
  username: yup
    .string()
    .required('用户名是必填项')
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符'),
  email: yup
    .string()
    .required('邮箱是必填项')
    .email('请输入有效的邮箱地址'),
  password: yup
    .string()
    .required('密码是必填项')
    .min(6, '密码至少6个字符')
    .matches(/[a-zA-Z]/, '密码必须包含字母')
    .matches(/\d/, '密码必须包含数字'),
});
```

### 3. 表单 Hook

```typescript
export const useForm = <T extends Record<string, any>>(
  config: FormConfig<T>
) => {
  const methods = useFormContext<T>();
  const { handleSubmit, formState: { errors, isSubmitting } } = methods;

  const onSubmit = async (data: T) => {
    try {
      await config.onSubmit(data);
    } catch (error) {
      // 处理提交错误
    }
  };

  return {
    methods,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    isSubmitting,
  };
};
```

## 组件实现

### 1. 表单容器组件

```typescript
export const Form = <T extends Record<string, any>>({
  config,
  onSubmit,
  children,
}: FormProps<T>) => {
  const methods = useForm<T>({
    defaultValues: config.defaultValues,
    resolver: config.validationSchema && yupResolver(config.validationSchema),
    mode: config.mode,
    reValidateMode: config.reValidateMode,
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </FormProvider>
  );
};
```

### 2. 表单字段组件

```typescript
interface FieldProps {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

export const Field = ({
  name,
  label,
  type = 'text',
  required,
  placeholder,
}: FieldProps) => {
  const { register, formState: { errors } } = useFormContext();
  const error = get(errors, name);

  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {required && <span className="required">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name)}
      />
      {error && (
        <span className="error">{error.message}</span>
      )}
    </div>
  );
};
```

## 使用示例

### 1. 基本表单

```typescript
interface LoginForm {
  username: string;
  password: string;
}

const loginSchema = yup.object({
  username: yup.string().required('用户名是必填项'),
  password: yup.string().required('密码是必填项'),
});

const LoginForm = () => {
  const onSubmit = async (data: LoginForm) => {
    await loginApi(data);
  };

  return (
    <Form<LoginForm>
      config={{
        defaultValues: {
          username: '',
          password: '',
        },
        validationSchema: loginSchema,
        mode: 'onChange',
      }}
      onSubmit={onSubmit}
    >
      <Field name="username" label="用户名" required />
      <Field name="password" label="密码" type="password" required />
      <button type="submit">登录</button>
    </Form>
  );
};
```

### 2. 动态表单

```typescript
interface DynamicForm {
  items: Array<{ name: string; value: string }>;
}

const DynamicForm = () => {
  const { fields, append, remove } = useFieldArray({
    name: 'items',
  });

  return (
    <Form<DynamicForm>
      config={{
        defaultValues: {
          items: [{ name: '', value: '' }],
        },
      }}
      onSubmit={onSubmit}
    >
      {fields.map((field, index) => (
        <div key={field.id}>
          <Field name={`items.${index}.name`} label="名称" />
          <Field name={`items.${index}.value`} label="值" />
          <button type="button" onClick={() => remove(index)}>
            删除
          </button>
        </div>
      ))}
      <button type="button" onClick={() => append({ name: '', value: '' })}>
        添加项
      </button>
    </Form>
  );
};
```

## 最佳实践

1. **表单验证**
   - 使用 Yup 定义验证规则
   - 实现实时验证
   - 提供清晰的错误提示

2. **性能优化**
   - 使用受控组件
   - 实现表单字段缓存
   - 避免不必要的重渲染

3. **用户体验**
   - 提供加载状态反馈
   - 实现表单自动保存
   - 支持表单重置功能

4. **类型安全**
   - 使用 TypeScript 类型
   - 实现表单数据验证
   - 确保类型一致性

5. **代码复用**
   - 抽象通用表单逻辑
   - 创建可复用的表单组件
   - 实现表单模板 