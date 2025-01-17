import { permissionManager } from '../rbac';

describe('PermissionManager', () => {
  beforeEach(() => {
    // 重置权限管理器状态
    permissionManager.setRole('guest');
    permissionManager.clearCustomPermissions();
  });

  describe('角色权限测试', () => {
    test('admin角色应该有所有权限', () => {
      permissionManager.setRole('admin');
      expect(permissionManager.hasPermission('read:users')).toBe(true);
      expect(permissionManager.hasPermission('write:users')).toBe(true);
      expect(permissionManager.hasPermission('delete:users')).toBe(true);
      expect(permissionManager.hasPermission('admin:access')).toBe(true);
    });

    test('guest角色应该只有有限权限', () => {
      permissionManager.setRole('guest');
      expect(permissionManager.hasPermission('read:posts')).toBe(true);
      expect(permissionManager.hasPermission('write:posts')).toBe(false);
      expect(permissionManager.hasPermission('delete:posts')).toBe(false);
    });
  });

  describe('自定义权限测试', () => {
    test('应该能添加自定义权限', () => {
      permissionManager.setRole('user');
      permissionManager.addPermission('delete:posts');
      expect(permissionManager.hasPermission('delete:posts')).toBe(true);
    });

    test('应该能移除自定义权限', () => {
      permissionManager.setRole('user');
      permissionManager.addPermission('delete:posts');
      permissionManager.removePermission('delete:posts');
      expect(permissionManager.hasPermission('delete:posts')).toBe(false);
    });

    test('切换角色时应该清除自定义权限', () => {
      permissionManager.setRole('user');
      permissionManager.addPermission('delete:posts');
      permissionManager.setRole('guest');
      expect(permissionManager.hasPermission('delete:posts')).toBe(false);
    });
  });

  describe('权限检查方法测试', () => {
    test('hasAnyPermission应该正确工作', () => {
      permissionManager.setRole('user');
      expect(permissionManager.hasAnyPermission(['read:posts', 'write:posts'])).toBe(true);
      expect(permissionManager.hasAnyPermission(['delete:users', 'manage:users'])).toBe(false);
    });

    test('hasAllPermissions应该正确工作', () => {
      permissionManager.setRole('manager');
      expect(permissionManager.hasAllPermissions(['read:posts', 'write:posts'])).toBe(true);
      expect(permissionManager.hasAllPermissions(['read:posts', 'admin:access'])).toBe(false);
    });

    test('getAllPermissions应该返回所有权限', () => {
      permissionManager.setRole('user');
      const permissions = permissionManager.getAllPermissions();
      expect(permissions).toContain('read:posts');
      expect(permissions).toContain('write:posts');
      expect(permissions).not.toContain('delete:posts');
    });
  });

  test('应该维护单例实例', () => {
    const instance1 = permissionManager;
    const instance2 = permissionManager;
    expect(instance1).toBe(instance2);
  });
}); 