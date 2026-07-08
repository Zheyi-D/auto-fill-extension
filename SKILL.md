---
name: auto-fill-extension
description: 安装并初始化「简历自动填充助手」Chrome 插件——克隆代码、读取用户简历文件、自动填充 data.js、引导加载扩展。用户只需提供简历文件路径，其余全自动完成。
---

# 简历自动填充助手 — Skill

## 一件事

帮用户装好 Chrome 扩展 + 把简历数据填进去。

用户说一句"我的简历在 xxx，帮我装那个自动填充插件"，你走完下面四步。

## Step 1: 获取代码

```bash
git clone https://github.com/Zheyi-D/auto-fill-extension.git
```

没有 git 就提示用户下载 ZIP，或直接在当前目录创建文件。

## Step 2: 读取简历

用户提供的简历文件（`.docx` / `.pdf` / `.txt`）。提取结构化信息：

| 分类 | 提取字段 |
|------|---------|
| 基本信息 | 姓名、英文名、邮箱、电话、所在地、求职意向 |
| 教育背景 | 硕/本→学校全称、学位、专业、GPA、荣誉、起止时间 |
| 实习经历 | 每段→公司全称、职位、起止时间、2-3 条描述 |
| 项目经历 | 每个→名称、描述、成果/数据 |
| 校园经历 | 项目名、描述（可选） |
| 技能 & 其他 | 语言、工具、技术栈 |

## Step 3: 写入 data.js

修改 `auto-fill-extension/data.js` 中的 `DEFAULT_DATA`：

- 逐条替换 fields 的 value 为用户真实信息
- 每段实习拆分多条，label 用"公司X / 职位X / 时间X / 描述X-1 / 描述X-2"格式
- 用户简历中有但 data.js 没有的分类就新增，没有的就删除
- JSON 结构不要改，只改 fields 数组内容

## Step 4: 告知用户

- 提取了什么信息、更新了哪些分类
- 最后一步：Chrome → `chrome://extensions/` → 开发者模式 → 加载已解压 → 选 `auto-fill-extension/` 文件夹
