# Next.js 全栈AI聊天应用

一个基于Next.js开发的现代化AI聊天应用，通过OpenRouter API集成了多种AI模型，包括免费的Mistral以及Claude、GPT等高级模型。应用支持多会话管理、流式响应和移动端优化布局。

## 主要功能

- 💬 支持多会话管理和历史记录
- 🔄 流式响应，实时显示AI回复
- 📱 响应式设计，完美适配移动端和桌面端
- 🔒 本地存储聊天历史，保护隐私
- 🚀 集成多种AI模型（默认提供免费模型）
- 🔑 自定义API密钥设置

## 技术栈

- **前端框架**: Next.js, React, TypeScript
- **UI组件**: Material-UI
- **API集成**: OpenRouter API
- **样式**: CSS Module, Tailwind CSS
- **状态管理**: React Hooks

## 快速启动

### 1. IP启动方式（局域网访问）

项目已内置智能IP启动功能，方便在局域网内访问应用：

```bash
# 克隆项目
git clone https://github.com/msc-x/nextjs-mobile-orientation.git
cd nextjs-fullstack-app-template-zn

# 安装依赖
npm install

# 方法1: 使用智能IP启动脚本（推荐）
npm run dev:ip
```

**智能IP启动功能**:
- 自动检测您的局域网IP地址
- 自动查找可用端口（如果默认端口被占用）
- 自动生成本地访问链接
- 自动打开浏览器访问应用
- 在终端中显示局域网访问地址（方便移动设备扫码访问）

启动后，您可以通过以下方式访问：
- 局域网内其他设备：`http://[您的电脑IP]:3000`（例如：`http://192.168.1.100:3000`）
- 本机访问：`http://localhost:3000`

### 2. 普通启动方式

如果只需要在本机访问，也可以使用标准启动方式：

```bash
# 开发模式启动（也会监听所有网络接口）
npm run dev

# 或构建后启动（生产模式）
npm run build
npm start
```

## 生产环境部署

对于生产环境，推荐使用以下命令构建和启动：

```bash
# 构建项目
npm run build

# 启动生产服务器(默认只监听localhost)
npm start

# 如需在生产环境中监听所有网络接口，可以使用：
npx next start -H 0.0.0.0
```

### 使用PM2进行部署

对于24/7运行的服务，建议使用PM2进行进程管理：

```bash
# 安装PM2
npm install -g pm2

# 启动应用(监听所有网络接口)
pm2 start npm --name "ai-chat" -- start -- -H 0.0.0.0

# 设置开机自启
pm2 startup
pm2 save

# 查看应用状态
pm2 status

# 查看日志
pm2 logs ai-chat
```

## API密钥设置

应用需要OpenRouter API密钥才能访问AI模型：

1. 访问 [OpenRouter](https://openrouter.ai)
2. 注册并创建API密钥
3. 在应用中输入您的API密钥（应用会自动保存）

**注意**：目前默认只能使用免费模型（Mistral 7B），其他模型将显示为锁定状态。

## 使用指南

1. 首次使用时，需要设置API密钥
2. 输入问题，AI将实时生成回复
3. 左侧面板可管理多个对话
4. 点击"新对话"开始新的会话
5. 点击垃圾桶图标可删除单个对话
6. 点击"清空对话"可删除所有对话历史
7. 可以在顶部下拉菜单中查看可用AI模型（目前仅支持免费模型）

## 数据存储

所有聊天数据存储在浏览器的localStorage中，不会发送到任何服务器（除了OpenRouter API用于生成回复）。清除浏览器数据会导致聊天历史丢失。

## 自定义和扩展

如需修改系统提示或调整默认设置，可编辑以下文件：

- `src/components/ChatInterface/index.tsx` - 主界面和逻辑
- `src/utils/openRouterApi.ts` - API调用和模型定义

要启用更多模型，可以修改 `src/components/ChatInterface/index.tsx` 中的:
```typescript
// 免费模型ID
const FREE_MODEL_ID = 'mistralai/mistral-7b-instruct:free';
```

## 移动端使用技巧

1. 在设置API Key后，保存在浏览器，下次访问无需重新输入
2. 使用Chrome/Safari添加到主屏幕，获得类似原生应用的体验
3. 使用横屏模式可获得更好的聊天体验
4. 侧边栏会自动隐藏，点击左上角按钮可打开

## 问题排查

如果应用无法通过IP访问：

1. 确认防火墙设置允许3000端口访问
2. 检查IP地址是否正确
3. 确保在同一局域网内
4. 某些网络可能限制端口访问，可尝试修改 `scripts/dev.js` 中的默认端口

如果遇到 "API Key认证失败" 错误：
1. 确认API Key格式正确（通常以 `sk-` 开头）
2. 检查API Key是否过期
3. 确认OpenRouter账户状态正常

## 开发者说明

项目结构说明：
- `/src/components` - 所有UI组件
- `/src/utils` - 工具函数和API调用
- `/src/app` - Next.js应用路由配置
- `/scripts` - 开发辅助脚本（包含IP启动脚本）

## 许可说明

本项目仅供学习和个人使用，请勿用于商业目的。使用OpenRouter API时，请遵守其服务条款。
