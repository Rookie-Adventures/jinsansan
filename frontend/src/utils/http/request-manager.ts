import axios, { CancelTokenSource } from 'axios';

import { PriorityQueue } from './priority-queue';

export class RequestManager {
  private cancelTokens: Map<string, CancelTokenSource>;
  private requestQueue: PriorityQueue<string>;

  constructor() {
    this.cancelTokens = new Map();
    this.requestQueue = new PriorityQueue();
  }

  // 创建取消令牌
  createCancelToken(id: string): CancelTokenSource {
    const source = axios.CancelToken.source();
    this.cancelTokens.set(id, source);
    return source;
  }

  // 取消请求
  cancelRequest(id: string): void {
    const source = this.cancelTokens.get(id);
    if (source) {
      source.cancel('请求已取消');
      this.cancelTokens.delete(id);
    }
  }

  // 取消所有请求
  cancelAllRequests(): void {
    this.cancelTokens.forEach((source) => {
      source.cancel('所有请求已取消');
    });
    this.cancelTokens.clear();
  }

  // 添加请求到队列
  addToQueue(id: string, priority: number = 0): void {
    this.requestQueue.enqueue(id, priority);
  }

  // 从队列中移除请求
  removeFromQueue(id: string): void {
    this.requestQueue.remove(id);
  }

  // 获取下一个要处理的请求
  getNextRequest(): string | null {
    return this.requestQueue.dequeue();
  }

  // 清理资源
  dispose(): void {
    this.cancelAllRequests();
    this.requestQueue.clear();
  }
}

export const requestManager = new RequestManager(); 