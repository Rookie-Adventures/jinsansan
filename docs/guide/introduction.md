# 项目介绍

## 项目定位与目标

### 核心目标
- 提供优质的 **HF模型调用体验**
- 为中国用户访问提供便利
- 确保服务稳定可用
- 保证使用简单便捷
- 平衡用户体验和成本控制
- **通过代理实现**：根据用户的地区，自动判断是否使用代理，以确保中国用户能够顺利访问并调用 HF 模型

### 技术定位
- 轻量级实现
- 专注交互体验
- 界面高度定制
- 保障服务质量

### 核心设计决策

#### 预设模型服务
- 使用平台API密钥提供免费服务
- 重点关注用户体验和成本平衡
- 实现智能的使用量控制
- 采用多层次的优化策略

#### 体验优化重点
- 流式响应体验
- 连接稳定性
- 智能上下文管理
- 错误处理机制

#### 成本控制重点
- Token使用优化
- 对话长度管理
- 缓存策略设计
- 防滥用机制

#### 功能扩展
- 提供统一的API接口
- 允许网站用户使用其他模型商API
- 在交互界面的功能上做出限制

## 技术栈

- **前端**：React, TypeScript, MUI, Redux Toolkit, Zustand
- **后端**：Node.js, Express, MongoDB, Redis

## 系统架构

### 前后端通信
- 使用RESTful API进行数据交换
- 确保接口的稳定性和安全性

### 模块职责
- **前端**：负责用户界面的渲染和交互
- **后端**：处理业务逻辑、数据存储和API请求

## 安全措施

- **数据保护**：用户密码加密存储，防止数据泄露
- **安全防护**：防止常见的安全威胁，如CSRF和XSS
- **API密钥保护**：确保用户的API密钥安全存储和使用 