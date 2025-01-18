declare module 'axios-retry' {
  import { AxiosError, AxiosInstance } from 'axios';

  interface IAxiosRetry {
    (axios: AxiosInstance, axiosRetryConfig?: IAxiosRetryConfig): void;
  }

  interface IAxiosRetryConfig {
    retries?: number;
    retryDelay?: (retryCount: number) => number;
    retryCondition?: (error: AxiosError) => boolean;
    shouldResetTimeout?: boolean;
  }

  const axiosRetry: IAxiosRetry;
  export default axiosRetry;
} 