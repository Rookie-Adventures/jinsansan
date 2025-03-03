# 工具函数使用文档

## Security
提供安全相关的工具函数。

### 净化输入字符串

防止 XSS 攻击。

#### 示例
```javascript
import { sanitizeInput } from '@/utils/security';
const safeInput = sanitizeInput(userInput);
```

### 验证邮箱格式

验证输入的邮箱地址是否符合格式。

#### 示例
```javascript
import { validateEmail } from '@/utils/security';
const isValid = validateEmail('example@example.com');
```

### 验证数值范围

验证输入的数值是否在指定范围内。

#### 示例
```javascript
import { validateNumber } from '@/utils/security';
const isInRange = validateNumber(10, 1, 100);
``` 