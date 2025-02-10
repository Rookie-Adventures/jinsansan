export interface ProgressInfo {
  loaded: number;
  total: number;
  progress: number;
  bytes: number;
  rate: number;
  estimated: number;
  upload?: boolean;
}

export interface ProgressCallback {
  (progress: ProgressInfo): void;
}

export interface ProgressMonitor {
  onProgress: ProgressCallback;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}
