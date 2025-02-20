import { describe, it, expect } from 'vitest';

import { sanitizeInput, validateEmail, validateNumber } from '../../security';

describe('Security Utils', () => {
  describe('sanitizeInput', () => {
    it('应该转义HTML特殊字符', () => {
      const testCases = [
        {
          input: '<script>alert("xss")</script>',
          expected: '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;',
        },
        {
          input: "let's hack",
          expected: 'let&#x27;s hack',
        },
        {
          input: 'http://example.com',
          expected: 'http:&#x2F;&#x2F;example.com',
        },
        {
          input: '<img src="x" onerror="alert(1)">',
          expected: '&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;',
        },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(sanitizeInput(input)).toBe(expected);
      });
    });

    it('应该保持普通文本不变', () => {
      const normalText = 'Hello World 123';
      expect(sanitizeInput(normalText)).toBe(normalText);
    });

    it('应该处理空字符串', () => {
      expect(sanitizeInput('')).toBe('');
    });
  });

  describe('validateEmail', () => {
    it('应该验证有效的邮箱地址', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.com',
        'user+label@domain.com',
        'user@subdomain.domain.com',
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('应该拒绝无效的邮箱地址', () => {
      const invalidEmails = [
        '',
        'invalid',
        '@domain.com',
        'user@',
        'user@domain',
        'user@.com',
        'user@domain.',
        'user name@domain.com',
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('validateNumber', () => {
    it('应该验证数值在指定范围内', () => {
      expect(validateNumber(5, 0, 10)).toBe(true);
      expect(validateNumber(0, 0, 10)).toBe(true);
      expect(validateNumber(10, 0, 10)).toBe(true);
    });

    it('应该拒绝超出范围的数值', () => {
      expect(validateNumber(-1, 0, 10)).toBe(false);
      expect(validateNumber(11, 0, 10)).toBe(false);
    });

    it('应该处理只有最小值的情况', () => {
      expect(validateNumber(5, 0)).toBe(true);
      expect(validateNumber(-1, 0)).toBe(false);
    });

    it('应该处理只有最大值的情况', () => {
      expect(validateNumber(5, undefined, 10)).toBe(true);
      expect(validateNumber(11, undefined, 10)).toBe(false);
    });

    it('应该处理没有范围限制的情况', () => {
      expect(validateNumber(Number.MIN_SAFE_INTEGER)).toBe(true);
      expect(validateNumber(Number.MAX_SAFE_INTEGER)).toBe(true);
    });
  });
}); 