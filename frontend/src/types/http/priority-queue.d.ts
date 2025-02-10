export interface QueueItem<T> {
  id: T;
  priority: number;
}

export declare class PriorityQueue<T> {
  constructor();
  enqueue(id: T, priority: number): void;
  dequeue(): T | null;
  remove(id: T): void;
  isEmpty(): boolean;
  clear(): void;
  size(): number;
  peek(): T | null;
  contains(id: T): boolean;
  toArray(): T[];
}
