# 文档服务器指南

> 状态：✅ 已实施
> 
> 最后更新：2024年1月

## 快速开始

### 1. 安装依赖
```bash
npm install docsify-cli -g
```

### 2. 启动文档服务器
```bash
# 在项目根目录下运行
docsify serve docs

# 或者指定端口
docsify serve docs -p 3030
```

服务器默认运行在 http://localhost:3000

## 配置说明

### docsify 配置
```html
<!-- docs/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>项目文档</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css">
</head>
<body>
  <div id="app"></div>
  <script>
    window.$docsify = {
      name: '项目文档',
      repo: '',
      loadSidebar: true,
      subMaxLevel: 3,
      auto2top: true,
      search: {
        paths: 'auto',
        placeholder: '搜索',
        noData: '没有结果'
      }
    }
  </script>
  <script src="//cdn.jsdelivr.net/npm/docsify@4"></script>
  <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/search.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-typescript.min.js"></script>
</body>
</html>
```

### 侧边栏配置
```markdown
<!-- docs/_sidebar.md -->
* 指南
  * [快速开始](guide/getting-started.md)
  * [API文档](guide/api-docs.md)
  * [数据库](guide/database.md)
  * [测试](guide/testing.md)

* 规范
  * [编码规范](standards/coding.md)
  * [Git规范](standards/git.md)
  * [文档规范](standards/documentation.md)
```

## 文档编写指南

### Markdown 规范
- 使用标准 Markdown 语法
- 代码块需指定语言
- 图片存放在 `docs/images` 目录
- 文档文件使用小写字母，以 `-` 分隔

### 目录结构
```
docs/
├── index.html          # 配置文件
├── README.md          # 首页
├── _sidebar.md        # 侧边栏配置
├── guide/             # 指南文档
│   ├── api-docs.md
│   ├── database.md
│   └── testing.md
├── standards/         # 规范文档
│   ├── coding.md
│   └── git.md
└── images/           # 图片资源
```

## 部署说明

### GitHub Pages 部署
1. 推送文档到 GitHub 仓库
2. 在仓库设置中启用 GitHub Pages
3. 选择 `docs` 目录作为源
4. 访问 `https://<username>.github.io/<repo>`

### 自定义域名部署
1. 添加 CNAME 文件到 `docs` 目录
2. 配置 DNS 记录
3. 在仓库设置中配置自定义域名 