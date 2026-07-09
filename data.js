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
        { label: "学位（硕士）", value: "工学硕士" },
        { label: "专业（硕士）", value: "计算机科学与技术" },
        { label: "硕士时间", value: "20XX/09-20XX/07" },
        { label: "学校（本科）", value: "XX大学" },
        { label: "学位（本科）", value: "工学学士" },
        { label: "专业（本科）", value: "软件工程" },
        { label: "GPA", value: "3.6/4.0" },
        { label: "荣誉", value: "校级奖学金" },
        { label: "本科时间", value: "20XX/09-20XX/06" },
      ]
    },
    {
      id: "internship",
      name: "实习经历",
      icon: "💼",
      fields: [
        { label: "公司1", value: "XX科技有限公司" },
        { label: "职位1", value: "产品实习生" },
        { label: "时间1", value: "20XX/03-20XX/06" },
        { label: "描述1", value: "负责XX产品的需求分析与PRD撰写，协调设计、研发团队推动功能上线，用户活跃度提升15%\n使用SQL进行数据埋点分析，搭建数据看板，产出每周产品运营报告，支撑团队决策" },
        { label: "公司2", value: "XX集团" },
        { label: "职位2", value: "AI产品实习生" },
        { label: "时间2", value: "20XX/09-20XX/03" },
        { label: "描述2", value: "参与智能客服Agent产品设计，主导知识库搭建与召回优化，意图识别准确率从72%提升至89%\n调用飞书/钉钉API搭建项目看板，自动化数据抓取与前端渲染，替代原有手动维护模式" },
        { label: "公司3", value: "XX科技" },
        { label: "职位3", value: "技术实习生" },
        { label: "时间3", value: "20XX/07-20XX/08" },
        { label: "描述3", value: "学习企业IT基础架构，参与技术方案设计与产品配置，整理客户案例库支撑售前团队" },
      ]
    },
    {
      id: "project",
      name: "项目经历",
      icon: "🚀",
      fields: [
        { label: "项目1名称", value: "XX审核系统" },
        { label: "项目1描述", value: "从0到1构建智能审核Agent，三层模型分工（发现→审核→决策），端到端输出判断结果\n全量上线后日均处理约9,000单，人工处理量下降46%" },
        { label: "项目2名称", value: "企业智能问答Agent" },
        { label: "项目2描述", value: "RAG+Tool Calling架构，覆盖FAQ查询与操作类请求，多阶段Workflow（意图识别→知识检索→答案生成→Action执行）" },
      ]
    },
    {
      id: "campus",
      name: "校园经历",
      icon: "📚",
      fields: [
        { label: "项目名称", value: "基于深度学习的XX算法研究" },
        { label: "描述", value: "以XX网络为基线，引入联合损失函数与细节增强模块，在公开数据集上PSNR提升2.1dB" },
        { label: "工程落地", value: "基于Gradio开发交互演示系统，支持可视化功能" },
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
