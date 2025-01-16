import type { BaseQueueItem } from './types';

/**
 * 优先级队列实现
 * 按优先级高低排序的队列，优先级高的元素会被优先处理
 * @template T - 队列项ID的类型
 */
export class PriorityQueue<T> {
  private items: BaseQueueItem<T>[];

  constructor() {
    this.items = [];
  }

  /**
   * 将元素添加到队列中
   * @param id - 元素的唯一标识符
   * @param priority - 元素的优先级，数值越大优先级越高
   */
  enqueue(id: T, priority: number): void {
    const item: BaseQueueItem<T> = { id, priority };
    let added = false;

    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i].priority < priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }

    if (!added) {
      this.items.push(item);
    }
  }

  /**
   * 从队列中移除并返回优先级最高的元素
   * @returns 优先级最高元素的ID，如果队列为空则返回null
   */
  dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift()?.id ?? null;
  }

  /**
   * 从队列中移除指定ID的元素
   * @param id - 要移除的元素ID
   */
  remove(id: T): void {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  /**
   * 检查队列是否为空
   * @returns 如果队列为空则返回true，否则返回false
   */
  isEmpty(): boolean {
    return this.items.length === 0;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.items = [];
  }

  /**
   * 获取队列中的元素数量
   * @returns 队列中的元素数量
   */
  size(): number {
    return this.items.length;
  }

  /**
   * 查看队列中优先级最高的元素，但不移除它
   * @returns 优先级最高元素的ID，如果队列为空则返回null
   */
  peek(): T | null {
    return this.isEmpty() ? null : this.items[0].id;
  }

  /**
   * 检查队列中是否包含指定ID的元素
   * @param id - 要检查的元素ID
   * @returns 如果队列中包含该元素则返回true，否则返回false
   */
  contains(id: T): boolean {
    return this.items.some(item => item.id === id);
  }

  /**
   * 将队列中的所有元素ID转换为数组
   * @returns 包含所有元素ID的数组
   */
  toArray(): T[] {
    return this.items.map(item => item.id);
  }
} 