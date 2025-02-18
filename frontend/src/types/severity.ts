/**
 * 严重程度相关类型定义
 * @packageDocumentation
 */

/**
 * 严重程度类型
 * @description 用于整个应用的错误处理、日志记录和通知系统
 */
export type Severity = 'info' | 'warning' | 'error' | 'critical';

/**
 * 严重程度常量类型
 * @description 提供类型安全的严重程度常量值类型
 */
export type SeverityLevelType = {
  readonly INFO: 'info';
  readonly WARNING: 'warning';
  readonly ERROR: 'error';
  readonly CRITICAL: 'critical';
};

/**
 * 严重程度常量值
 * @description 提供类型安全的严重程度常量实例
 */
export const SeverityLevel: SeverityLevelType = {
  INFO: 'info' as const,
  WARNING: 'warning' as const,
  ERROR: 'error' as const,
  CRITICAL: 'critical' as const,
} as const;

/**
 * 严重程度颜色映射类型
 * @description 定义每个严重程度对应的颜色代码
 */
export type SeverityColorMap = {
  [K in Severity]: string;
};

/**
 * 严重程度标签映射类型
 * @description 定义每个严重程度对应的显示文本
 */
export type SeverityLabelMap = {
  [K in Severity]: string;
};

/**
 * 获取严重程度对应的显示颜色
 * @param severity - 严重程度
 * @returns 对应的颜色代码
 */
export function getSeverityColor(severity: Severity): string {
  const colorMap: SeverityColorMap = {
    info: '#2196f3',
    warning: '#ff9800',
    error: '#f44336',
    critical: '#d32f2f'
  };
  return colorMap[severity] || '#757575';
}

/**
 * 获取严重程度的显示文本
 * @param severity - 严重程度
 * @returns 对应的显示文本
 */
export function getSeverityLabel(severity: Severity): string {
  const labelMap: SeverityLabelMap = {
    info: '信息',
    warning: '警告',
    error: '错误',
    critical: '严重'
  };
  return labelMap[severity] || '未知';
} 