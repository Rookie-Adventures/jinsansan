import { ReactNode, CSSProperties } from 'react';

// 基础Props类型
export interface BaseProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

// 按钮Props类型
export interface ButtonProps extends BaseProps {
  type?: 'primary' | 'secondary' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// 输入框Props类型
export interface InputProps extends BaseProps {
  type?: 'text' | 'password' | 'number' | 'email';
  value?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
}

// 表单项Props类型
export interface FormItemProps extends BaseProps {
  label?: string;
  required?: boolean;
  error?: string;
  help?: string;
}

// 模态框Props类型
export interface ModalProps extends BaseProps {
  visible: boolean;
  title?: string;
  width?: number | string;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmLoading?: boolean;
  footer?: ReactNode;
}

// 列表Props类型
export interface ListProps<T> extends BaseProps {
  data: T[];
  loading?: boolean;
  renderItem: (item: T, index: number) => ReactNode;
  emptyText?: string;
} 