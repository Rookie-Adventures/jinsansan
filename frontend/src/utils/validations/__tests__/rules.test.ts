import { describe, it, expect } from 'vitest';

import {
  required,
  email,
  url,
  min,
  max,
  password,
  phone,
  username,
  confirmPassword,
  number,
} from '../rules';

describe('Validation Rules', () => {
  describe('required', () => {
    const rule = required();

    it('应该验证必填字段', async () => {
      await expect(rule.validate('')).rejects.toThrow('此字段为必填项');
      await expect(rule.validate(undefined)).rejects.toThrow('此字段为必填项');
      await expect(rule.validate('value')).resolves.toBe('value');
    });

    it('应该支持自定义错误消息', async () => {
      const customRule = required('自定义错误');
      await expect(customRule.validate('')).rejects.toThrow('自定义错误');
    });
  });

  describe('email', () => {
    const rule = email();

    it('应该验证邮箱格式', async () => {
      await expect(rule.validate('invalid')).rejects.toThrow();
      await expect(rule.validate('test@example')).rejects.toThrow();
      await expect(rule.validate('test@example.com')).resolves.toBe('test@example.com');
    });
  });

  describe('url', () => {
    const rule = url();

    it('应该验证URL格式', async () => {
      await expect(rule.validate('invalid')).rejects.toThrow();
      await expect(rule.validate('http://')).rejects.toThrow();
      await expect(rule.validate('http://example.com')).resolves.toBe('http://example.com');
    });
  });

  describe('min/max', () => {
    it('应该验证最小长度', async () => {
      const minRule = min(3);
      await expect(minRule.validate('ab')).rejects.toThrow();
      await expect(minRule.validate('abc')).resolves.toBe('abc');
    });

    it('应该验证最大长度', async () => {
      const maxRule = max(3);
      await expect(maxRule.validate('abcd')).rejects.toThrow();
      await expect(maxRule.validate('abc')).resolves.toBe('abc');
    });
  });

  describe('password', () => {
    const rule = password();

    it('应该验证密码复杂度', async () => {
      await expect(rule.validate('weak')).rejects.toThrow();
      await expect(rule.validate('onlylowercase')).rejects.toThrow();
      await expect(rule.validate('Password123!')).resolves.toBe('Password123!');
    });
  });

  describe('phone', () => {
    const rule = phone();

    it('应该验证手机号格式', async () => {
      await expect(rule.validate('123')).rejects.toThrow();
      await expect(rule.validate('12345678901')).rejects.toThrow();
      await expect(rule.validate('13812345678')).resolves.toBe('13812345678');
    });
  });

  describe('username', () => {
    const rule = username();

    it('应该验证用户名格式', async () => {
      await expect(rule.validate('a')).rejects.toThrow();
      await expect(rule.validate('user@name')).rejects.toThrow();
      await expect(rule.validate('username123')).resolves.toBe('username123');
    });
  });

  describe('confirmPassword', () => {
    it('应该验证密码匹配', async () => {
      const schema = confirmPassword('password');
      const context = { values: { password: 'test123' } };
      
      await expect(schema.validate('different', { context })).rejects.toThrow();
      await expect(schema.validate('test123', { context })).resolves.toBe('test123');
    });
  });

  describe('number', () => {
    describe('integer', () => {
      const rule = number.integer();

      it('应该验证整数', async () => {
        await expect(rule.validate(1.5)).rejects.toThrow();
        await expect(rule.validate(1)).resolves.toBe(1);
      });
    });

    describe('positive', () => {
      const rule = number.positive();

      it('应该验证正数', async () => {
        await expect(rule.validate(-1)).rejects.toThrow();
        await expect(rule.validate(0)).rejects.toThrow();
        await expect(rule.validate(1)).resolves.toBe(1);
      });
    });

    describe('range', () => {
      const rule = number.range(1, 10);

      it('应该验证数值范围', async () => {
        await expect(rule.validate(0)).rejects.toThrow();
        await expect(rule.validate(11)).rejects.toThrow();
        await expect(rule.validate(5)).resolves.toBe(5);
      });
    });
  });
}); 