# 数据库规范文档

> 状态：📝 待实施
> 
> 最后更新：2024年1月
> 
> 完成度：
> - [x] MongoDB配置规范 (100%)
> - [x] Redis配置规范 (100%)
> - [ ] 数据模型定义 (20%)
> - [ ] 性能优化实施 (10%)
> - [ ] 监控系统搭建 (0%)

## 1. MongoDB 配置

### 1.1 连接配置
```typescript
interface MongoConfig {
  url: string;
  dbName: string;
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
}
```

### 1.2 索引规范
```typescript
// 用户集合索引
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

// 日志集合索引
db.logs.createIndex({ timestamp: -1 });
db.logs.createIndex({ level: 1, timestamp: -1 });
```

### 1.3 Schema 定义
```typescript
interface UserSchema {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

interface LogSchema {
  _id: ObjectId;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata: Record<string, any>;
}
```

## 2. Redis 配置

### 2.1 连接配置
```typescript
interface RedisConfig {
  host: string;
  port: number;
  password: string;
  db: number;
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  maxReconnectAttempts: 10
}
```

### 2.2 缓存策略

#### 2.2.1 键命名规范
```typescript
const KeyPattern = {
  USER_PROFILE: 'user:profile:{userId}',
  USER_TOKEN: 'user:token:{userId}',
  API_RATE_LIMIT: 'rate:api:{endpoint}:{ip}',
  CACHE_DATA: 'cache:{key}',
}
```

#### 2.2.2 过期策略
```typescript
const ExpiryTimes = {
  USER_PROFILE: 60 * 60,      // 1小时
  USER_TOKEN: 7 * 24 * 60 * 60, // 7天
  API_RATE_LIMIT: 60,         // 1分钟
  CACHE_DATA: 5 * 60          // 5分钟
}
```

## 3. 数据访问层 (DAL)

### 3.1 MongoDB 访问示例
```typescript
class UserDAL {
  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id).exec();
  }

  async create(userData: CreateUserDTO): Promise<UserDocument> {
    return UserModel.create(userData);
  }

  async update(id: string, update: UpdateUserDTO): Promise<UserDocument | null> {
    return UserModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
```

### 3.2 Redis 访问示例
```typescript
class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set<T>(key: string, value: T, expiry?: number): Promise<void> {
    const data = JSON.stringify(value);
    if (expiry) {
      await redis.setex(key, expiry, data);
    } else {
      await redis.set(key, data);
    }
  }

  async delete(key: string): Promise<void> {
    await redis.del(key);
  }
}
```

## 4. 数据库维护

### 4.1 备份策略
```bash
# MongoDB 备份
mongodump --uri="mongodb://localhost:27017/dbname" --out=/backup/mongo/$(date +%Y%m%d)

# Redis 备份
redis-cli SAVE
cp /var/lib/redis/dump.rdb /backup/redis/dump_$(date +%Y%m%d).rdb
```

### 4.2 监控指标
- 连接池使用率
- 查询响应时间
- 缓存命中率
- 内存使用率
- 慢查询日志

### 4.3 性能优化
- 索引使用分析
- 查询优化
- 数据分片策略
- 缓存预热
- 连接池调优

## 5. 最佳实践

### 5.1 MongoDB
- 使用复合索引优化查询
- 避免大规模的文档修改
- 合理使用投影限制返回字段
- 使用批量操作提高性能
- 定期数据归档

### 5.2 Redis
- 合理设置过期时间
- 使用pipeline减少网络往返
- 避免大key
- 使用hash减少内存使用
- 定期清理过期数据 