# 监控组件使用文档

## AlertRuleForm
用于创建和编辑告警规则的表单组件。

### 属性
- `rule` (可选): 要编辑的告警规则对象。
- `onSubmit`: 表单提交回调，接收告警规则数据。
- `onCancel`: 取消编辑的回调。

### 示例
```jsx
<AlertRuleForm onSubmit={handleSubmit} onCancel={handleCancel} />
```

## AlertRuleList
显示告警规则的列表组件。

### 属性
- `rules`: 告警规则数组。
- `onEdit`: 编辑规则的回调函数。
- `onDelete`: 删除规则的回调函数。
- `onToggle`: 切换规则启用状态的回调函数。

### 示例
```jsx
<AlertRuleList rules={alertRules} onEdit={handleEdit} onDelete={handleDelete} onToggle={handleToggle} />
``` 