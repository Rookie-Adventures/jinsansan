/* eslint-disable no-console */
import { isDevelopment } from './env';

interface LoggerOptions {
  context?: string;
  data?: unknown;
}

class Logger {
  private static formatMessage(message: string, options?: LoggerOptions): string {
    const parts = [message];
    if (options?.context) {
      parts.unshift(`[${options.context}]`);
    }
    return parts.join(' ');
  }

  static error(message: unknown, options?: LoggerOptions): void {
    if (isDevelopment) {
      const errorMessage = message instanceof Error ? message.message : String(message);
      const formattedMessage = this.formatMessage(errorMessage, options);
      console.error(formattedMessage);
      if (options?.data) {
        console.error('Additional data:', options.data);
      }
      if (message instanceof Error && message.stack) {
        console.error('Stack trace:', message.stack);
      }
    }
  }

  static warn(message: string, options?: LoggerOptions): void {
    if (isDevelopment) {
      console.warn(this.formatMessage(message, options));
      if (options?.data) {
        console.warn('Additional data:', options.data);
      }
    }
  }

  static info(message: string, options?: LoggerOptions): void {
    if (isDevelopment) {
      console.info(this.formatMessage(message, options));
      if (options?.data) {
        console.info('Additional data:', options.data);
      }
    }
  }

  static debug(message: string, options?: LoggerOptions): void {
    if (isDevelopment) {
      console.debug(this.formatMessage(message, options));
      if (options?.data) {
        console.debug('Additional data:', options.data);
      }
    }
  }
}

export default Logger; 