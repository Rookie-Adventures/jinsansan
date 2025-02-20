import * as yup from 'yup';

type ValidationRule = yup.StringSchema<string | undefined>;
type NumberValidationRule = yup.NumberSchema<number | undefined>;

// 通用规则
export const required = (message = '此字段为必填项'): ValidationRule => yup.string().required(message);

export const email = (message = '请输入有效的邮箱地址'): ValidationRule =>
  yup.string().email(message).required();

export const url = (message = '请输入有效的URL'): ValidationRule =>
  yup.string().url(message).required();

export const min = (min: number, message = `最小长度为 ${min} 个字符`): ValidationRule =>
  yup.string().min(min, message).required();

export const max = (max: number, message = `最大长度为 ${max} 个字符`): ValidationRule =>
  yup.string().max(max, message).required();

// 密码规则
export const password = (
  message = '密码必须包含至少8个字符，包括大小写字母、数字和特殊字符'
): ValidationRule =>
  yup
    .string()
    .min(8, '密码至少需要8个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, message)
    .required();

// 手机号规则
export const phone = (message = '请输入有效的手机号码'): ValidationRule =>
  yup
    .string()
    .matches(/^1[3-9]\d{9}$/, message)
    .required();

// 用户名规则
export const username = (
  message = '用户名只能包含字母、数字和下划线，长度在3-20之间'
): ValidationRule =>
  yup
    .string()
    .matches(/^[a-zA-Z0-9_]{3,20}$/, message)
    .required();

// 确认密码规则
export const confirmPassword = (ref: string, message = '两次输入的密码不一致'): ValidationRule =>
  yup
    .string()
    .oneOf([yup.ref(ref)], message)
    .required();

// 数字规则
export const number = {
  integer: (message = '请输入整数'): NumberValidationRule =>
    yup.number().integer(message).required(),
  positive: (message = '请输入正数'): NumberValidationRule =>
    yup.number().positive(message).required(),
  range: (
    min: number,
    max: number,
    message = `请输入 ${min} 到 ${max} 之间的数字`
  ): NumberValidationRule => yup.number().min(min).max(max).required(message),
};
