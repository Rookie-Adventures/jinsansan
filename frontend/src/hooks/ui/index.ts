/**
 * UI 相关的自定义 hooks
 * @placeholder - 这是一个占位模块，将包含以下功能：
 * - useTheme: 主题切换 hook
 * - useModal: 模态框控制 hook
 * - useToast: 消息提示 hook
 * - useBreakpoint: 响应式断点 hook
 */

// 定义各个 hook 的返回类型
type Theme = 'light' | 'dark';
type ModalControls = { open: () => void; close: () => void };
type ToastOptions = { message: string; type: 'success' | 'error' | 'info' | 'warning' };
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// 占位函数，返回未实现信息
const _notImplemented = (): never => {
  throw new Error('Hook not implemented');
};

// 导出占位 hooks（带类型标注）
export const useTheme = (): Theme => _notImplemented();
export const useModal = (_id: string): ModalControls => _notImplemented();
export const useToast = (_options?: ToastOptions): void => _notImplemented();
export const useBreakpoint = (): Breakpoint => _notImplemented();
