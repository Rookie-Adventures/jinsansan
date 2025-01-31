/**
 * 工具类型定义
 */

// 深度可选类型
export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

// 可空类型
export type Nullable<T> = T | null;

// 深度只读类型
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

// 函数类型
export type AnyFunction = (...args: unknown[]) => unknown;

// 异步函数类型
export type AsyncFunction = (...args: unknown[]) => Promise<unknown>;

// 记录类型
export type RecordOf<K extends PropertyKey, T> = {
  [P in K]: T;
};

// 选择性类型
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

// 排除类型
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 必需类型
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

// 联合转交叉类型
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
