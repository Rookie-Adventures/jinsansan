/**
 * 统一的严重程度类型定义
 * @description 用于整个应用的错误处理、日志记录和通知系统
 */
export type Severity = 'info' | 'warning' | 'error' | 'critical';

/**
 * 严重程度常量
 * @description 提供类型安全的严重程度常量值
 */
export const SeverityLevel = {
  INFO: 'info' as const,
  WARNING: 'warning' as const,
  ERROR: 'error' as const,
  CRITICAL: 'critical' as const,
} as const;

/**
 * 获取严重程度对应的显示颜色
 */
export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case SeverityLevel.INFO:
      return '#2196f3';
    case SeverityLevel.WARNING:
      return '#ff9800';
    case SeverityLevel.ERROR:
      return '#f44336';
    case SeverityLevel.CRITICAL:
      return '#d32f2f';
    default:
      return '#757575';
  }
}

/**
 * 获取严重程度的显示文本
 */
export function getSeverityLabel(severity: Severity): string {
  switch (severity) {
    case SeverityLevel.INFO:
      return '信息';
    case SeverityLevel.WARNING:
      return '警告';
    case SeverityLevel.ERROR:
      return '错误';
    case SeverityLevel.CRITICAL:
      return '严重';
    default:
      return '未知';
  }
} 