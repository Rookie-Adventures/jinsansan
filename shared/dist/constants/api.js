/**
 * API 版本
 */
export const API_VERSION = 'v1';
/**
 * API 基础路径
 */
export const API_BASE_PATH = `/api/${API_VERSION}`;
/**
 * API 端点
 */
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: `${API_BASE_PATH}/auth/login`,
        LOGOUT: `${API_BASE_PATH}/auth/logout`,
        REFRESH: `${API_BASE_PATH}/auth/refresh`,
        REGISTER: `${API_BASE_PATH}/auth/register`,
        FORGOT_PASSWORD: `${API_BASE_PATH}/auth/forgot-password`,
        RESET_PASSWORD: `${API_BASE_PATH}/auth/reset-password`,
        VERIFY_EMAIL: `${API_BASE_PATH}/auth/verify-email`,
        RESEND_VERIFICATION: `${API_BASE_PATH}/auth/resend-verification`,
    },
    USER: {
        PROFILE: `${API_BASE_PATH}/user/profile`,
        SETTINGS: `${API_BASE_PATH}/user/settings`,
        PREFERENCES: `${API_BASE_PATH}/user/preferences`,
        NOTIFICATIONS: `${API_BASE_PATH}/user/notifications`,
        AVATAR: `${API_BASE_PATH}/user/avatar`,
        PASSWORD: `${API_BASE_PATH}/user/password`,
        EMAIL: `${API_BASE_PATH}/user/email`,
    },
    MONITORING: {
        DASHBOARD: `${API_BASE_PATH}/monitoring/dashboard`,
        ALERTS: `${API_BASE_PATH}/monitoring/alerts`,
        METRICS: `${API_BASE_PATH}/monitoring/metrics`,
        LOGS: `${API_BASE_PATH}/monitoring/logs`,
        HEALTH: `${API_BASE_PATH}/monitoring/health`,
        STATUS: `${API_BASE_PATH}/monitoring/status`,
    },
    SYSTEM: {
        CONFIG: `${API_BASE_PATH}/system/config`,
        FEATURES: `${API_BASE_PATH}/system/features`,
        MAINTENANCE: `${API_BASE_PATH}/system/maintenance`,
        BACKUP: `${API_BASE_PATH}/system/backup`,
    },
    FILES: {
        UPLOAD: `${API_BASE_PATH}/files/upload`,
        DOWNLOAD: `${API_BASE_PATH}/files/download`,
        DELETE: `${API_BASE_PATH}/files/delete`,
        LIST: `${API_BASE_PATH}/files/list`,
        SHARE: `${API_BASE_PATH}/files/share`,
    },
};
/**
 * API 方法
 */
export const API_METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    PATCH: 'PATCH',
    DELETE: 'DELETE',
    HEAD: 'HEAD',
    OPTIONS: 'OPTIONS',
};
/**
 * API 请求头
 */
export const API_HEADERS = {
    CONTENT_TYPE: 'Content-Type',
    AUTHORIZATION: 'Authorization',
    ACCEPT: 'Accept',
    X_REQUEST_ID: 'X-Request-ID',
    X_CORRELATION_ID: 'X-Correlation-ID',
    X_USER_AGENT: 'User-Agent',
    X_FORWARDED_FOR: 'X-Forwarded-For',
    X_REAL_IP: 'X-Real-IP',
};
/**
 * API 内容类型
 */
export const API_CONTENT_TYPES = {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
    URL_ENCODED: 'application/x-www-form-urlencoded',
    TEXT: 'text/plain',
    HTML: 'text/html',
    XML: 'application/xml',
    CSV: 'text/csv',
    PDF: 'application/pdf',
    ZIP: 'application/zip',
};
/**
 * API 超时配置（毫秒）
 */
export const API_TIMEOUTS = {
    DEFAULT: 30000,
    UPLOAD: 60000,
    DOWNLOAD: 60000,
    LONG_POLLING: 30000,
};
/**
 * API 重试配置
 */
export const API_RETRY_CONFIG = {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    RETRY_MULTIPLIER: 2,
    MAX_RETRY_DELAY: 10000,
};
