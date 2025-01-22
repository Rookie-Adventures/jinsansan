import { HttpErrorType } from './types';

interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  maxDelay: number;
  retryableErrors: HttpErrorType[];
}

interface NotificationConfig {
  defaultDuration: number;
  maxDuration: number;
}

interface ReportingConfig {
  endpoint: string;
  sampleRate: number;
  maxQueueSize: number;
  maxRetries: number;
  initialRetryDelay: number;
  maxRetryDelay: number;
}

interface ErrorConfig {
  retry: RetryConfig;
  notification: NotificationConfig;
  reporting: ReportingConfig;
}

// 默认配置
const defaultConfig: ErrorConfig = {
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    maxDelay: 5000,
    retryableErrors: [
      HttpErrorType.NETWORK,
      HttpErrorType.TIMEOUT
    ]
  },
  notification: {
    defaultDuration: 5000,
    maxDuration: 10000
  },
  reporting: {
    endpoint: '/api/error-report',
    sampleRate: 1.0,
    maxQueueSize: 100,
    maxRetries: 3,
    initialRetryDelay: 1000,
    maxRetryDelay: 30000
  }
};

type PartialConfig = {
  [K in keyof ErrorConfig]?: {
    [P in keyof ErrorConfig[K]]?: ErrorConfig[K][P];
  };
};

// 从环境变量或其他配置源获取配置
const getConfig = (): ErrorConfig => {
  try {
    // 尝试从环境变量获取配置
    const envConfig: PartialConfig = {
      retry: {
        maxRetries: Number(process.env.ERROR_RETRY_MAX_RETRIES),
        retryDelay: Number(process.env.ERROR_RETRY_DELAY),
        maxDelay: Number(process.env.ERROR_RETRY_MAX_DELAY),
        retryableErrors: process.env.ERROR_RETRYABLE_TYPES?.split(',') as HttpErrorType[]
      },
      notification: {
        defaultDuration: Number(process.env.ERROR_NOTIFICATION_DEFAULT_DURATION),
        maxDuration: Number(process.env.ERROR_NOTIFICATION_MAX_DURATION)
      },
      reporting: {
        endpoint: process.env.ERROR_REPORTING_ENDPOINT,
        sampleRate: Number(process.env.ERROR_REPORTING_SAMPLE_RATE),
        maxQueueSize: Number(process.env.ERROR_REPORTING_MAX_QUEUE_SIZE),
        maxRetries: Number(process.env.ERROR_REPORTING_MAX_RETRIES),
        initialRetryDelay: Number(process.env.ERROR_REPORTING_INITIAL_RETRY_DELAY),
        maxRetryDelay: Number(process.env.ERROR_REPORTING_MAX_RETRY_DELAY)
      }
    };

    // 过滤掉无效的配置值
    const filteredConfig = Object.entries(envConfig).reduce<PartialConfig>((acc, [key, section]) => {
      if (section) {
        const filteredSection = Object.entries(section).reduce<Record<string, unknown>>((sectionAcc, [sectionKey, value]) => {
          if (value !== undefined && !Number.isNaN(value)) {
            sectionAcc[sectionKey] = value;
          }
          return sectionAcc;
        }, {});

        if (Object.keys(filteredSection).length > 0) {
          acc[key as keyof ErrorConfig] = filteredSection;
        }
      }
      return acc;
    }, {});

    // 合并默认配置和环境配置
    return {
      ...defaultConfig,
      ...filteredConfig,
      retry: {
        ...defaultConfig.retry,
        ...(filteredConfig.retry || {})
      },
      notification: {
        ...defaultConfig.notification,
        ...(filteredConfig.notification || {})
      },
      reporting: {
        ...defaultConfig.reporting,
        ...(filteredConfig.reporting || {})
      }
    };
  } catch (error) {
    console.warn('Error loading config from environment:', error);
    return defaultConfig;
  }
};

export const errorConfig = getConfig(); 