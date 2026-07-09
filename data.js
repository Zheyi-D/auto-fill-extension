// 简历数据默认值 — 首次安装或重置时使用
// 用户可以随时在侧边栏编辑模式下修改，修改后自动保存到 chrome.storage.local
//
// 🆕 首次使用？告诉你的 AI 助手：
//    "我的简历在 [文件路径]，请用 resume-init skill 帮我初始化这个扩展"
//    支持 .docx / .pdf / 纯文本简历文件

const DEFAULT_DATA = {
  categories: [
    {
      id: "basic",
      name: "基本信息",
      icon: "👤",
      fields: [
        { label: "姓名", value: "张三" },
        { label: "英文名", value: "San Zhang" },
        { label: "邮箱", value: "example@email.com" },
        { label: "电话", value: "13800138000" },
        { label: "所在地", value: "北京" },
        { label: "求职意向", value: "产品经理" },
      ]
    },
    {
      id: "education",
      name: "教育背景",
      icon: "🎓",
      fields: [
        { label: "学校（硕士）", value: "XX大学" },
        { label: "学位（硕士）", value: "X学硕士" },
        { label: "专业（硕士）", value: "计算机科学与技术" },
        { label: "硕士时间", value: "20XX/09-20XX/07" },
        { label: "学校（本科）", value: "XX大学" },
        { label: "学位（本科）", value: "X学学士" },
        { label: "专业（本科）", value: "软件工程" },
        { label: "GPA", value: "3.X/4.0" },
        { label: "荣誉", value: "校级奖学金" },
        { label: "本科时间", value: "20XX/09-20XX/06" },
      ]
    },
    {
      id: "internship",
      name: "实习经历",
      icon: "💼",
      fields: [
        { label: "公司1", value: "XX有限公司" },
        { label: "职位1", value: "销售" },
        { label: "时间1", value: "20XX/03-20XX/06" },
        { label: "描述1", value: "XXXXXXXXXXXXXXXXXXXXX" },
        { label: "公司2", value: "XX集团" },
        { label: "职位2", value: "AI产品实习生" },
        { label: "时间2", value: "20XX/09-20XX/03" },
        { label: "描述2", value: "XXXXXXXXXXXXXXXXXXXXX" },
        { label: "公司3", value: "XX科技" },
        { label: "职位3", value: "实习生" },
        { label: "时间3", value: "20XX/07-20XX/08" },
        { label: "描述3", value: "XXXXXXXXXXXXXXXXXXXXX" },
      ]
    },
    {
      id: "project",
      name: "项目经历",
      icon: "🚀",
      fields: [
        { label: "项目1名称", value: "XX系统" },
        { label: "项目1描述", value: "XXXXXXXXXXXXXXXXXXXXX" },
        { label: "项目2名称", value: "问答Agent" },
        { label: "项目2描述", value: "XXXXXXXXXXXXXXXXXXXXX" },
      ]
    },
    {
      id: "campus",
      name: "校园经历",
      icon: "📚",
      fields: [
        { label: "项目名称", value: "基于XX的算法研究" },
        { label: "描述", value: "XXXXXXXXXXXXXXXXXXXXX" },
        { label: "工程落地", value: "XXXXXXXXXXXXXXXXXXXXX" },
      ]
    },
    {
      id: "skills",
      name: "技能 & 其他",
      icon: "🛠️",
      fields: [
        { label: "语言", value: "中文（母语）、英文（CET-6）" },
        { label: "工具", value: "Figma, Axure, JIRA, Confluence" },
        { label: "技术栈", value: "Python, SQL, HTML/CSS/JS" },
        { label: "其他", value: "PMP认证, 敏捷开发, 数据分析" },
      ]
    },
  ]
};
