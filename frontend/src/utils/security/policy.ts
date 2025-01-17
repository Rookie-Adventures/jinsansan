/**
 * 安全策略配置接口
 */
interface SecurityPolicy {
  // Content Security Policy
  csp: {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    mediaSrc: string[];
    frameSrc: string[];
  };
  // HTTP安全头
  headers: {
    xFrameOptions: 'DENY' | 'SAMEORIGIN';
    xContentTypeOptions: string;
    xXssProtection: string;
    referrerPolicy: string;
    strictTransportSecurity: string;
  };
  // 速率限制
  rateLimit: {
    windowMs: number;  // 时间窗口（毫秒）
    maxRequests: number;  // 最大请求数
  };
}

/**
 * 安全策略管理器
 */
export class SecurityPolicyManager {
  private static instance: SecurityPolicyManager;
  private policy: SecurityPolicy;
  private rateLimitMap: Map<string, { count: number; timestamp: number }>;

  private constructor() {
    this.policy = {
      csp: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https:'],
        fontSrc: ["'self'", 'https:', 'data:'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
      headers: {
        xFrameOptions: 'DENY',
        xContentTypeOptions: 'nosniff',
        xXssProtection: '1; mode=block',
        referrerPolicy: 'strict-origin-when-cross-origin',
        strictTransportSecurity: 'max-age=31536000; includeSubDomains',
      },
      rateLimit: {
        windowMs: 15 * 60 * 1000,  // 15分钟
        maxRequests: 100,  // 每个IP最多100个请求
      },
    };
    this.rateLimitMap = new Map();
  }

  static getInstance(): SecurityPolicyManager {
    if (!SecurityPolicyManager.instance) {
      SecurityPolicyManager.instance = new SecurityPolicyManager();
    }
    return SecurityPolicyManager.instance;
  }

  /**
   * 获取CSP策略字符串
   */
  getCSPString(): string {
    const { csp } = this.policy;
    const directives = [
      `default-src ${csp.defaultSrc.join(' ')}`,
      `script-src ${csp.scriptSrc.join(' ')}`,
      `style-src ${csp.styleSrc.join(' ')}`,
      `img-src ${csp.imgSrc.join(' ')}`,
      `connect-src ${csp.connectSrc.join(' ')}`,
      `font-src ${csp.fontSrc.join(' ')}`,
      `object-src ${csp.objectSrc.join(' ')}`,
      `media-src ${csp.mediaSrc.join(' ')}`,
      `frame-src ${csp.frameSrc.join(' ')}`,
    ];
    return directives.join('; ');
  }

  /**
   * 获取安全头配置
   */
  getSecurityHeaders(): Record<string, string> {
    const { headers } = this.policy;
    return {
      'Content-Security-Policy': this.getCSPString(),
      'X-Frame-Options': headers.xFrameOptions,
      'X-Content-Type-Options': headers.xContentTypeOptions,
      'X-XSS-Protection': headers.xXssProtection,
      'Referrer-Policy': headers.referrerPolicy,
      'Strict-Transport-Security': headers.strictTransportSecurity,
    };
  }

  /**
   * 检查请求是否超过速率限制
   */
  checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const record = this.rateLimitMap.get(ip);

    if (!record) {
      this.rateLimitMap.set(ip, { count: 1, timestamp: now });
      return true;
    }

    if (now - record.timestamp > this.policy.rateLimit.windowMs) {
      this.rateLimitMap.set(ip, { count: 1, timestamp: now });
      return true;
    }

    if (record.count >= this.policy.rateLimit.maxRequests) {
      return false;
    }

    record.count += 1;
    this.rateLimitMap.set(ip, record);
    return true;
  }

  /**
   * 更新安全策略
   */
  updatePolicy(newPolicy: Partial<SecurityPolicy>): void {
    this.policy = {
      ...this.policy,
      ...newPolicy,
      headers: {
        ...this.policy.headers,
        ...newPolicy.headers,
      },
    };
  }

  /**
   * 获取当前策略
   */
  getPolicy(): SecurityPolicy {
    return { ...this.policy };
  }
}

// 导出单例实例
export const securityPolicyManager = SecurityPolicyManager.getInstance(); 