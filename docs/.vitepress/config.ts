import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "项目文档",
  description: "项目技术文档",
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/introduction' },
      { text: '基础设施', link: '/infrastructure/' },
      { text: 'API', link: '/api/' }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '项目概览',
          items: [
            { text: '项目介绍', link: '/guide/introduction' },
            { text: '功能体系', link: '/guide/features' },
            { text: '技术实现', link: '/guide/implementation' }
          ]
        },
        {
          text: '开发规范',
          items: [
            { text: '项目结构', link: '/guide/project-structure' },
            { text: '开发规范', link: '/guide/development-standards' },
            { text: '搜索服务', link: '/guide/search-service' }
          ]
        },
        {
          text: '工具链',
          items: [
            { text: 'TypeScript 配置', link: '/guide/typescript' },
            { text: 'ESLint 配置', link: '/guide/eslint' },
            { text: 'Vite 配置', link: '/guide/vite' }
          ]
        },
        {
          text: '核心功能',
          items: [
            { text: '路由系统', link: '/guide/router' },
            { text: '状态管理', link: '/guide/state-management' },
            { text: 'UI 框架', link: '/guide/ui-framework' },
            { text: 'Material UI', link: '/frontend/material-ui' },
            { text: 'HTTP 客户端', link: '/guide/http-client' },
            { text: '监控系统', link: '/guide/monitoring' }
          ]
        }
      ],
      '/infrastructure/': [
        {
          text: '基础设施',
          items: [
            { text: '搜索系统', link: '/infrastructure/search' },
            { text: '文件处理', link: '/infrastructure/file' },
            { text: '缓存系统', link: '/infrastructure/cache' },
            { text: '错误处理', link: '/infrastructure/error-handling' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 文档',
          items: [
            { text: '接口规范', link: '/api/standards' },
            { text: '搜索接口', link: '/api/search' },
            { text: '文件接口', link: '/api/file' }
          ]
        }
      ]
    },
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-repo' }
    ],
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present Your Name'
    }
  }
}) 