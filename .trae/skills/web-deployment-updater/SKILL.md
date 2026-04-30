---
name: "web-deployment-updater"
description: "指导网页部署到 Vercel 及后续更新流程，包括路径配置、API 集成、国内访问优化等。Invoke when deploying a new website or updating existing website content (e.g., resume updates)."
---

# 网页部署与更新指南

## 一、部署流程

### 1. 准备工作
- 确保入口文件为 `index.html`
- 清理不必要的大文件（如 `.docx`）
- 使用英文命名文件夹和文件

### 2. 代码托管
- 将代码上传到 GitHub 仓库
- 注意：`.git` 可删除，`.trae` 和小文件可保留

### 3. Vercel 部署
- 连接 GitHub 仓库，Vercel 自动检测部署
- `vercel.json` 保持简洁：`{"version": 2}`
- 创建 Serverless Function（如 `api/chat.js`）处理 API 调用

## 二、常见坑点与解决

| 坑点 | 表现 | 正确做法 |
|------|------|----------|
| 路径错误 | 详情页资源加载失败 | 使用绝对路径（如 `/css/style.css`） |
| CORS 跨域 | API 调用被浏览器阻止 | 通过 Serverless Function 代理 |
| 密钥泄露 | 前端暴露敏感信息 | 使用 Vercel 环境变量管理密钥 |
| 字体加载失败 | 中文字体显示异常 | 字体文件重命名为英文 |
| CDN 被拦截 | `ERR_BLOCKED_BY_CLIENT` | 静态资源本地化 |
| 国内访问慢 | 页面加载超时 | 配置 Cloudflare CDN + 自定义域名 |

## 三、更新文件流程

### 1. 更新步骤
- 修改本地文件
- 执行 Git 命令提交：
  ```bash
  git add .
  git commit -m "更新说明"
  git push origin main
  ```
- Vercel 自动重新部署

### 2. 配合方式
- 提供更新内容和需求
- 协助修改代码、检查路径、测试功能
- 处理部署问题

## 四、正确做法清单

✅ 所有资源路径使用绝对路径  
✅ API 密钥通过环境变量管理  
✅ 字体文件使用英文命名  
✅ 静态资源本地化  
✅ 使用 Cloudflare CDN 解决国内访问问题  
✅ 部署后测试所有页面和功能

## 五、注意事项

1. 文件命名规范：避免中文和特殊字符
2. 路径一致性：更新文件后确保引用路径同步更新
3. 缓存问题：强制刷新（Ctrl+Shift+R）或添加版本号
4. 部署状态：在 Vercel Dashboard 查看进度

## 六、关键经验

1. 路径是头号杀手，部署前务必检查所有资源引用
2. API 密钥绝对不能暴露在前端代码中
3. 国内用户体验需要 Cloudflare CDN
4. 配置宜简不宜繁
5. 测试要全面，尤其是详情页和动态功能
