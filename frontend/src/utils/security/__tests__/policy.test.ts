import { securityPolicyManager } from '../policy';

describe('SecurityPolicyManager', () => {
  describe('CSP策略测试', () => {
    test('应该生成正确的CSP字符串', () => {
      const cspString = securityPolicyManager.getCSPString();
      expect(cspString).toContain("default-src 'self'");
      expect(cspString).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
      expect(cspString).toContain("style-src 'self' 'unsafe-inline'");
    });

    test('应该包含所有必要的CSP指令', () => {
      const cspString = securityPolicyManager.getCSPString();
      const requiredDirectives = [
        'default-src',
        'script-src',
        'style-src',
        'img-src',
        'connect-src',
        'font-src',
        'object-src',
        'media-src',
        'frame-src'
      ];

      requiredDirectives.forEach(directive => {
        expect(cspString).toContain(directive);
      });
    });
  });

  describe('安全头测试', () => {
    test('应该返回所有必要的安全头', () => {
      const headers = securityPolicyManager.getSecurityHeaders();
      
      expect(headers).toHaveProperty('Content-Security-Policy');
      expect(headers).toHaveProperty('X-Frame-Options');
      expect(headers).toHaveProperty('X-Content-Type-Options');
      expect(headers).toHaveProperty('X-XSS-Protection');
      expect(headers).toHaveProperty('Referrer-Policy');
      expect(headers).toHaveProperty('Strict-Transport-Security');
    });

    test('安全头应该有正确的值', () => {
      const headers = securityPolicyManager.getSecurityHeaders();
      
      expect(headers['X-Frame-Options']).toBe('DENY');
      expect(headers['X-Content-Type-Options']).toBe('nosniff');
      expect(headers['X-XSS-Protection']).toBe('1; mode=block');
      expect(headers['Strict-Transport-Security']).toContain('max-age=31536000');
    });
  });

  describe('速率限制测试', () => {
    test('应该正确检查速率限制', () => {
      const result = securityPolicyManager.checkRateLimit('127.0.0.1');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('策略更新测试', () => {
    test('应该能更新现有策略', () => {
      const newPolicy = {
        headers: {
          xFrameOptions: 'SAMEORIGIN' as const,
          xContentTypeOptions: 'nosniff',
          xXssProtection: '1; mode=block',
          referrerPolicy: 'strict-origin-when-cross-origin',
          strictTransportSecurity: 'max-age=31536000; includeSubDomains'
        }
      };

      securityPolicyManager.updatePolicy(newPolicy);
      const headers = securityPolicyManager.getSecurityHeaders();
      expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
    });

    test('应该保留未更新的策略设置', () => {
      const originalPolicy = securityPolicyManager.getPolicy();
      const newPolicy = {
        headers: {
          xFrameOptions: 'SAMEORIGIN' as const,
          xContentTypeOptions: 'nosniff',
          xXssProtection: '1; mode=block',
          referrerPolicy: 'strict-origin-when-cross-origin',
          strictTransportSecurity: 'max-age=31536000; includeSubDomains'
        }
      };

      securityPolicyManager.updatePolicy(newPolicy);
      const updatedPolicy = securityPolicyManager.getPolicy();

      expect(updatedPolicy.csp).toEqual(originalPolicy.csp);
      expect(updatedPolicy.rateLimit).toEqual(originalPolicy.rateLimit);
    });
  });

  test('应该维护单例实例', () => {
    const instance1 = securityPolicyManager;
    const instance2 = securityPolicyManager;
    expect(instance1).toBe(instance2);
  });
}); 