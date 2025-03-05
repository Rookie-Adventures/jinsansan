/**
 * API 版本
 */
export declare const API_VERSION = "v1";
/**
 * API 基础路径
 */
export declare const API_BASE_PATH = "/api/v1";
/**
 * API 端点
 */
export declare const API_ENDPOINTS: {
    readonly AUTH: {
        readonly LOGIN: "/api/v1/auth/login";
        readonly LOGOUT: "/api/v1/auth/logout";
        readonly REFRESH: "/api/v1/auth/refresh";
        readonly REGISTER: "/api/v1/auth/register";
        readonly FORGOT_PASSWORD: "/api/v1/auth/forgot-password";
        readonly RESET_PASSWORD: "/api/v1/auth/reset-password";
        readonly VERIFY_EMAIL: "/api/v1/auth/verify-email";
        readonly RESEND_VERIFICATION: "/api/v1/auth/resend-verification";
    };
    readonly USER: {
        readonly PROFILE: "/api/v1/user/profile";
        readonly SETTINGS: "/api/v1/user/settings";
        readonly PREFERENCES: "/api/v1/user/preferences";
        readonly NOTIFICATIONS: "/api/v1/user/notifications";
        readonly AVATAR: "/api/v1/user/avatar";
        readonly PASSWORD: "/api/v1/user/password";
        readonly EMAIL: "/api/v1/user/email";
    };
    readonly MONITORING: {
        readonly DASHBOARD: "/api/v1/monitoring/dashboard";
        readonly ALERTS: "/api/v1/monitoring/alerts";
        readonly METRICS: "/api/v1/monitoring/metrics";
        readonly LOGS: "/api/v1/monitoring/logs";
        readonly HEALTH: "/api/v1/monitoring/health";
        readonly STATUS: "/api/v1/monitoring/status";
    };
    readonly SYSTEM: {
        readonly CONFIG: "/api/v1/system/config";
        readonly FEATURES: "/api/v1/system/features";
        readonly MAINTENANCE: "/api/v1/system/maintenance";
        readonly BACKUP: "/api/v1/system/backup";
    };
    readonly FILES: {
        readonly UPLOAD: "/api/v1/files/upload";
        readonly DOWNLOAD: "/api/v1/files/download";
        readonly DELETE: "/api/v1/files/delete";
        readonly LIST: "/api/v1/files/list";
        readonly SHARE: "/api/v1/files/share";
    };
};
/**
 * API 方法
 */
export declare const API_METHODS: {
    readonly GET: "GET";
    readonly POST: "POST";
    readonly PUT: "PUT";
    readonly PATCH: "PATCH";
    readonly DELETE: "DELETE";
    readonly HEAD: "HEAD";
    readonly OPTIONS: "OPTIONS";
};
/**
 * API 请求头
 */
export declare const API_HEADERS: {
    readonly CONTENT_TYPE: "Content-Type";
    readonly AUTHORIZATION: "Authorization";
    readonly ACCEPT: "Accept";
    readonly X_REQUEST_ID: "X-Request-ID";
    readonly X_CORRELATION_ID: "X-Correlation-ID";
    readonly X_USER_AGENT: "User-Agent";
    readonly X_FORWARDED_FOR: "X-Forwarded-For";
    readonly X_REAL_IP: "X-Real-IP";
};
/**
 * API 内容类型
 */
export declare const API_CONTENT_TYPES: {
    readonly JSON: "application/json";
    readonly FORM_DATA: "multipart/form-data";
    readonly URL_ENCODED: "application/x-www-form-urlencoded";
    readonly TEXT: "text/plain";
    readonly HTML: "text/html";
    readonly XML: "application/xml";
    readonly CSV: "text/csv";
    readonly PDF: "application/pdf";
    readonly ZIP: "application/zip";
};
/**
 * API 超时配置（毫秒）
 */
export declare const API_TIMEOUTS: {
    readonly DEFAULT: 30000;
    readonly UPLOAD: 60000;
    readonly DOWNLOAD: 60000;
    readonly LONG_POLLING: 30000;
};
/**
 * API 重试配置
 */
export declare const API_RETRY_CONFIG: {
    readonly MAX_RETRIES: 3;
    readonly RETRY_DELAY: 1000;
    readonly RETRY_MULTIPLIER: 2;
    readonly MAX_RETRY_DELAY: 10000;
};
