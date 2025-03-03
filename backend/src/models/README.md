# 后端模型使用文档

## Order Model
定义订单数据的结构和验证。

### 属性
- `id`: 订单ID。
- `userId`: 用户ID。
- `items`: 订单项数组。

### 示例
```javascript
const order = new OrderModel({
  userId: '123',
  items: [...],
});
```  

## User Model
定义用户数据的结构和验证。

### 属性
- `id`: 用户ID。
- `username`: 用户名。
- `email`: 用户邮箱。

### 示例
```javascript
const user = new UserModel({
  username: 'example',
  email: 'example@example.com',
});
``` 