# 🪄 一句话安装 + 初始化

把这个提示词发给你的 AI 助手（Claude Code / Cursor / ChatGPT / Codex 等），全自动完成。

---

## 提示词（复制下面整段）

```
请帮我安装并初始化「简历自动填充」Chrome 插件。

我的简历文件路径：[替换为你的路径，如 ~/Desktop/我的简历.pdf]

## 你要做的事：

### 第一步：获取插件代码
git clone https://github.com/Zheyi-D/auto-fill-extension.git
没有 git 的话直接下载 ZIP 也行，放到一个方便找的目录。

### 第二步：读取我的简历
用工具读取上面提供的简历文件（支持 .docx / .pdf / .txt）。
提取结构和关键字眼以自然语言描述即可，不要求 OCR 准确度。

### 第三步：填充 data.js
把提取到的信息写入 clone 下来的目录中的 data.js 文件，
替换 DEFAULT_DATA 里的示例数据字段。要求：
- 保持完全相同的 JSON 结构：{ "label": "字段名", "value": "内容" }
- 每段实习经历拆分为多条（公司X / 职位X / 时间X / 描述X-1 / 描述X-2）
- 可以根据我的实际经历增删 category 和 field
- 不要改动任何其他文件

### 第四步：告诉我
你提取了什么、添加/删除了哪些分类，以及最后一步：
- 打开 chrome://extensions/
- 开启右上角「开发者模式」
- 点「加载已解压的扩展程序」，选择刚才 clone 的文件夹
- 大功告成 🎉
```

---

## 工作原理

```
你给 AI 一句话 → AI 克隆仓库 → AI 读你的简历 → AI 写入 data.js → 你加载扩展 → 开始填表
```

全程你只需要：
1. 复制上面的提示词（改一下简历路径）
2. 粘贴发给 AI
3. 最后在 Chrome 里点两下

---

## 支持的简历格式

| 格式 | 支持 |
|------|------|
| `.docx` Word 文档 | ✅ |
| `.pdf` PDF 文件 | ✅ |
| `.txt` 纯文本 | ✅ |
| 飞书文档 URL | ✅（部分 AI 支持） |
| 金山文档 URL | ✅（部分 AI 支持） |
| 直接粘贴简历文字 | ✅ |

---

## 支持的 AI 助手

| AI 助手 | 状态 |
|------|------|
| Claude Code | ✅ 原生支持（也可用 `resume-init.skill.md` 注册 skill） |
| Codex (OpenClaw) | ✅ 支持 |
| ChatGPT / GPT-4 | ✅ 拖入简历文件 + 粘贴提示词 |
| Cursor | ✅ 在终端执行 |
| Gemini | ✅ 支持 |
| 任何能读写文件的 AI | ✅ |

---

## 示例

```bash
# Claude Code 里只需说：
我的简历在 ~/Desktop/简历.pdf，请按 resume-init.md 初始化 auto-fill-extension
```

```bash
# 注册为 skill 后更短：
/resume-init ~/Desktop/简历.pdf
```
