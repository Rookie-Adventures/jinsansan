export interface QueueItem<T> {
  id: T;
  priority: number;
}

export class PriorityQueue<T> {
  private items: QueueItem<T>[];

  constructor() {
    this.items = [];
  }

  enqueue(id: T, priority: number): void {
    const item: QueueItem<T> = { id, priority };
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

  dequeue(): T | null {
    if (this.isEmpty()) {
      return null;
    }
    return this.items.shift()?.id ?? null;
  }

  remove(id: T): void {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
    }
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  size(): number {
    return this.items.length;
  }

  peek(): T | null {
    return this.isEmpty() ? null : this.items[0].id;
  }

  contains(id: T): boolean {
    return this.items.some(item => item.id === id);
  }

  toArray(): T[] {
    return this.items.map(item => item.id);
  }
} 