import { API_HEADERS, API_CONTENT_TYPES } from '../constants/api';
import { createNetworkError } from './error';
export const createHttpConfig = (method, url, config) => {
    return {
        method,
        url,
        headers: {
            [API_HEADERS.CONTENT_TYPE]: API_CONTENT_TYPES.JSON,
            [API_HEADERS.ACCEPT]: API_CONTENT_TYPES.JSON,
            ...config?.headers,
        },
        params: config?.params,
        data: config?.data,
        timeout: config?.timeout,
        withCredentials: config?.withCredentials,
        responseType: config?.responseType,
        validateStatus: config?.validateStatus,
    };
};
export const createHeaders = (headers = {}) => {
    return {
        [API_HEADERS.CONTENT_TYPE]: API_CONTENT_TYPES.JSON,
        [API_HEADERS.ACCEPT]: API_CONTENT_TYPES.JSON,
        ...headers,
    };
};
export const createParams = (params = {}) => {
    return Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== null && value !== undefined) {
            acc[key] = value;
        }
        return acc;
    }, {});
};
export const createQueryString = (params = {}) => {
    const queryParams = Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => {
        if (Array.isArray(value)) {
            return value
                .map((v) => `${encodeURIComponent(key)}=${encodeURIComponent(String(v))}`)
                .join('&');
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
    })
        .join('&');
    return queryParams ? `?${queryParams}` : '';
};
export const createUrl = (baseUrl, path, params) => {
    const queryString = params ? createQueryString(params) : '';
    return `${baseUrl}${path}${queryString}`;
};
export const handleHttpError = (error) => {
    if (error.response) {
        return createNetworkError({
            url: error.config?.url,
            method: error.config?.method,
            status: error.response.status,
        });
    }
    if (error.request) {
        return createNetworkError({
            url: error.config?.url,
            method: error.config?.method,
        });
    }
    return createNetworkError({
        url: error.config?.url,
        method: error.config?.method,
    });
};
export const isHttpError = (error) => {
    return (error &&
        typeof error === 'object' &&
        ('response' in error || 'request' in error || 'config' in error));
};
export const getHttpErrorMessage = (error) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message) {
        return error.message;
    }
    return 'An error occurred';
};
export const getHttpErrorStatus = (error) => {
    return error.response?.status || 500;
};
export const getHttpErrorHeaders = (error) => {
    return error.response?.headers || {};
};
