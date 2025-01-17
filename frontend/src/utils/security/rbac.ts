/**
 * 权限类型定义
 */
export type Permission = 
  | 'read:users'
  | 'write:users'
  | 'delete:users'
  | 'manage:users'
  | 'read:posts'
  | 'write:posts'
  | 'delete:posts'
  | 'manage:posts'
  | 'admin:access';

/**
 * 角色类型定义
 */
export type Role = 'admin' | 'manager' | 'user' | 'guest';

/**
 * 角色权限映射
 */
const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'read:users', 'write:users', 'delete:users', 'manage:users',
    'read:posts', 'write:posts', 'delete:posts', 'manage:posts',
    'admin:access'
  ],
  manager: [
    'read:users', 'write:users',
    'read:posts', 'write:posts', 'delete:posts', 'manage:posts'
  ],
  user: ['read:posts', 'write:posts'],
  guest: ['read:posts']
};

/**
 * 权限控制管理器
 */
export class PermissionManager {
  private static instance: PermissionManager;
  private currentRole: Role = 'guest';
  private customPermissions: Set<Permission> = new Set();

  private constructor() {}

  static getInstance(): PermissionManager {
    if (!PermissionManager.instance) {
      PermissionManager.instance = new PermissionManager();
    }
    return PermissionManager.instance;
  }

  /**
   * 设置当前用户角色
   */
  setRole(role: Role): void {
    this.currentRole = role;
    this.customPermissions.clear();
  }

  /**
   * 添加自定义权限
   */
  addPermission(permission: Permission): void {
    this.customPermissions.add(permission);
  }

  /**
   * 移除自定义权限
   */
  removePermission(permission: Permission): void {
    this.customPermissions.delete(permission);
  }

  /**
   * 检查是否有指定权限
   */
  hasPermission(permission: Permission): boolean {
    // 检查自定义权限
    if (this.customPermissions.has(permission)) {
      return true;
    }

    // 检查角色权限
    return rolePermissions[this.currentRole]?.includes(permission) || false;
  }

  /**
   * 检查是否有多个权限中的任意一个
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(permission));
  }

  /**
   * 检查是否有所有指定权限
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(permission));
  }

  /**
   * 获取当前所有权限
   */
  getAllPermissions(): Permission[] {
    const rolePerms = rolePermissions[this.currentRole] || [];
    return [...new Set([...rolePerms, ...this.customPermissions])];
  }

  /**
   * 清除所有自定义权限
   */
  clearCustomPermissions(): void {
    this.customPermissions.clear();
  }
}

// 导出单例实例
export const permissionManager = PermissionManager.getInstance(); 