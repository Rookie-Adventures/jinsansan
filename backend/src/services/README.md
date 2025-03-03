# 后端服务使用文档

## Order Service
处理与订单相关的业务逻辑。

### 方法
- `createOrder(data)`: 创建新订单。
- `getOrder(id)`: 获取订单详情。
- `updateOrder(id, data)`: 更新订单信息。
- `deleteOrder(id)`: 删除订单。

### 示例
```javascript
const orderService = new OrderService();
orderService.createOrder(orderData);
```  

## User Service
处理与用户相关的业务逻辑。

### 方法
- `register(data)`: 注册新用户。
- `login(credentials)`: 用户登录。
- `getUser(id)`: 获取用户信息。

### 示例
```javascript
const userService = new UserService();
userService.login(userCredentials);
``` 