# 简历自动填充助手

一键填充简历信息到招聘网站表单的 Chrome 浏览器插件。
📋 [版本更新日志](https://github.com/Zheyi-D/auto-fill-extension/releases)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Manifest](https://img.shields.io/badge/manifest-v3-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## 🪄 一句话安装（推荐）

**把下面这句话发给你的 AI 助手**，全自动完成安装：

> `我的简历在 [你的简历路径，如 ~/Desktop/我的简历.pdf]，请根据 https://github.com/Zheyi-D/auto-fill-extension 的 README 帮我安装并初始化这个插件`

AI 会自动：克隆代码 → 读取你的简历 → 填入 data.js → 你只需在 Chrome 点「加载扩展」。

支持 Claude Code / Cursor / ChatGPT / Codex / Gemini / 任何能读写文件的 AI 助手。

---

## 为什么需要它？

海投简历时，每个招聘网站都要重新填一遍姓名、邮箱、学校、实习经历……这个插件让你**填一次，到处用**。

---

## 功能一览

### 📂 数据管理
- **分类组织**：基本信息 / 教育背景 / 实习经历 / 项目经历 / 校园经历 / 技能语言
- **卡片分组**：多段实习/项目经历自动拆成独立卡片，每段有彩色标题条，一眼分清
- **✏️ 在线编辑**：编辑模式下直接修改字段内容、标签名；分类名和图标也可以改
- **↕️ 拖拽排序**：编辑模式下拖 `⠿` 手柄自由排列字段
- **↩️ 多行编辑**：点击描述字段弹出 textarea，`Enter` 换行，`Ctrl+Enter` 保存
- **🔄 一键重置**：恢复默认示例数据
- **📤 未来更新计划**：JSON 导入导出、多套简历配置

### ⚡ 填充体验
- **一键填入**：点击侧边栏字段块 → 自动填入网页表单
- **焦点追踪**：实时显示当前聚焦的输入框信息
- **🧩 兼容主流框架**：React / Vue 受控组件、原生表单、select 下拉框
- **🛡️ 智能恢复**：页面重载后自动重连 content script，无需手动刷新

### 🎨 界面
- **🌓 暗色模式**：自动跟随系统主题
- **📦 零依赖**：纯原生 JS/CSS/HTML，无构建工具
- **轻量快速**：开箱即用，不到 50KB

---

## 安装

### 方式一：AI 自动安装（推荐）

```
我的简历在 ~/Desktop/我的简历.pdf，请根据 https://github.com/Zheyi-D/auto-fill-extension 的 README 帮我安装并初始化这个插件
```

### 方式二：手动安装

```bash
git clone https://github.com/Zheyi-D/auto-fill-extension.git
```

然后：Chrome → `chrome://extensions/` → 开启「开发者模式」→ 「加载已解压的扩展程序」→ 选择项目文件夹。

---

## 使用指南

### 填充

```
① 打开招聘网站表单页面
② 点扩展图标 → 打开侧边栏
③ 在页面上点某个输入框（如"邮箱"）
④ 在侧边栏点对应的信息块 → 自动填入 ✅
```

### 编辑数据

1. 侧边栏顶部点「**✏️ 编辑**」进入编辑模式
2. **改值**：点击右侧字段内容 → 编辑 → `Enter` 保存（描述类字段 `Ctrl+Enter` 保存，支持换行）
3. **改标签**：点击左侧字段名 → 编辑 → `Enter` 保存
4. **改分类名/图标**：点击分类标题文字或 emoji → 编辑
5. **拖拽排序**：按住 `⠿` 手柄拖动到目标位置
6. **增删**：`＋` 添加字段、`×` 删除字段；底部「＋ 添加分类」新建分组
7. 点「🔄」恢复默认示例数据
8. 编辑完点「🔒 填充」回到填充模式

### 卡片分组

实习经历、项目经历等分类会自动按每段经历拆成独立卡片：

```
💼 实习经历
┌─────────────────────────────┐
│ ▓▓▓▓ XX科技有限公司           │  ← 公司名自动成为卡片标题
├─────────────────────────────┤
│ 职位    产品实习生            │
│ 时间    20XX/03-20XX/06      │
│ 描述    ...                  │
└─────────────────────────────┘
┌─────────────────────────────┐
│ ▓▓▓▓ XX集团                  │
├─────────────────────────────┤
│ ...                          │
└─────────────────────────────┘
```

---

## 文件结构

```
auto-fill-extension/
├── manifest.json          # 扩展配置 (Manifest V3)
├── data.js                # 简历结构化数据（可编辑）
├── content.js             # 表单填充引擎（React/Vue 兼容）
├── service-worker.js      # 后台脚本
├── sidepanel.html         # 侧边栏页面
├── sidepanel.js           # 侧边栏逻辑（填充/编辑双模式 + 拖拽排序 + 卡片分组）
├── sidepanel.css          # 样式（暗色主题 + 响应式）
├── resume-init.md         # AI 初始化完整提示词
├── resume-init.skill.md   # Claude Code skill 定义
├── icons/                 # 扩展图标 (16/48/128)
├── .gitignore
└── README.md
```

---

## 常见问题

**Q: 支持哪些网页？**
A: 几乎所有网页表单，包括 React / Vue / Ant Design / Element UI 渲染的表单。

**Q: 数据存在哪里？**
A: `chrome.storage.local`，仅本地存储，不上传任何服务器。

**Q: 换电脑怎么迁移？**
A: 编辑模式下把所有字段复制一遍新电脑上的 data.js，或者等后续 JSON 导入导出功能。

**Q: Chrome 以外的浏览器能用吗？**
A: Edge 直接加载。Firefox 需要略微修改 manifest（欢迎 PR）。

**Q: iframe 里的表单能填吗？**
A: 当前版本不支持 iframe 内表单。后续版本计划支持。

**Q: 有 Bug 或建议？**
A: 在 GitHub 提 Issue 即可。

---

## 📧 联系方式

问题反馈 / 功能建议：**dddzzzyyy@agent.qq.com** ｜ [GitHub Issue](https://github.com/Zheyi-D/auto-fill-extension/issues/new)

---

## License

MIT — 自由使用、修改、分发。
