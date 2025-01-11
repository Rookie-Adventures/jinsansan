import type { AxiosProgressEvent } from 'axios';

export interface ProgressInfo {
  loaded: number;
  total: number;
  progress: number;
  bytes: number;
  rate: number;
  estimated: number;
}

export class ProgressMonitor {
  private startTime: number;
  private lastLoaded: number;
  private lastTime: number;

  constructor() {
    this.startTime = Date.now();
    this.lastLoaded = 0;
    this.lastTime = this.startTime;
  }

  onProgress(event: AxiosProgressEvent): ProgressInfo {
    const currentTime = Date.now();
    const timeElapsed = (currentTime - this.lastTime) / 1000; // 转换为秒
    const loaded = event.loaded || 0;
    const total = event.total || 0;

    // 计算传输速率（bytes/second）
    const bytesIncrease = loaded - this.lastLoaded;
    const rate = timeElapsed > 0 ? bytesIncrease / timeElapsed : 0;

    // 估计剩余时间（秒）
    const remaining = total - loaded;
    const estimated = rate > 0 ? remaining / rate : 0;

    // 更新状态
    this.lastLoaded = loaded;
    this.lastTime = currentTime;

    return {
      loaded,
      total,
      progress: total > 0 ? (loaded / total) * 100 : 0,
      bytes: bytesIncrease,
      rate,
      estimated,
    };
  }

  reset(): void {
    this.startTime = Date.now();
    this.lastLoaded = 0;
    this.lastTime = this.startTime;
  }
}

export const createProgressMonitor = () => new ProgressMonitor(); 