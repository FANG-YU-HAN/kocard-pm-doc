

本文件供 AI Agent（Claude Code / Qoder / Cursor 等）在本仓库中工作时阅读，说明仓库用途、目录约定和工作规范。

## 仓库用途

kocard 项目的产品经理工作文档记录，包括需求文档、会议记录、调研报告、复盘总结等。
* 我是这个产品的主导者，CEO
* 老板（P）是我的战略顾问，
* 领导（F）是我的咨询顾问
* 整个公司都是我用来完成这个产品的资源池


## 文件命名规范

- 文件：`YYYY-MM-DD-标题.md`，如 `2026-10-19-xx需求评审.md`
- 标题使用中文，全部小写字母仅用于英文缩写（如 `prd`、`api`）
- 不要使用空格，用连字符 `-` 分隔

## 文档写作规范

- 语言：中文为主，专有名词可保留英文
- 每篇文档开头包含：日期、参与人/作者、状态（草稿 / 已评审 / 已归档）
- 会议纪要需包含：结论、待办事项（Action Items，标注负责人和截止时间）
- PRD 需包含：背景、目标、功能需求、验收标准、埋点、风险

## Git 规范

- 提交信息：`<类型>: <简要描述>`，类型如 `docs`、`feat`、`fix`
- 例：`docs: 添加 10-19 需求评审纪要`
- 文档为工作记录，鼓励小步多次提交

## 方法论参考库

撰写调研、PRD、战略相关文档时，优先参考硅谷顶级产品人的已验证方法论，不要凭空编造框架。

**Lenny's Newsletter 官方开源知识库**（前 Airbnb 增长负责人 Lenny Rachitsky）

- 仓库：<https://github.com/LennysNewsletter/lennys-newsletterpodcastdata>
- 免费内容：10 篇 Newsletter + 50 期播客完整转录（AI 友好 Markdown，含 `index.json` 索引：标题、日期、嘉宾、主题标签）
- 完整档案（356 篇文章 + 300 期转录）为付费内容，免费部分不可用时向用户说明，不假设已订阅
- 覆盖主题：PMF、增长、定价、产品战略、招聘、AI 落地、职业发展（17 个标签）

**检索方式**（若已 clone 到本地，假设路径 `~/kocard-lenny-data/`，未 clone 时先询问用户）

```bash
# 从 index.json 按关键词检索
grep -i "product-market fit" ~/kocard-lenny-data/index.json
```

**经典方法论速查**（写文档时可直接引用）

| 主题 | 方法 | 出处 |
|---|---|---|
| PMF | Superhuman PMF Engine（Sean Ellis 测试 + 拆分用户） | Rahul Vohra 客座文章 |
| 增长 | 增长模型搭建、Growth Loops、North Star 指标树 | Lenny / Amplitude |
| 战略 | DHM 模型（难以模仿的愉悦 + 增强利润） | Gibson Biddle |
| 优先级 | Pre-mortem、Impact/Effort 陷阱 | Shreyas Doshi |
| 路线图 | Now / Next / Later 承诺管理 | Lenny |
| 职业 | The Magic Loop | Lenny |
| AI 落地 | 25 个加速 AI 采用的战术、AI 原型指南 | Lenny 2025 |

**引用要求**：在文档中引用方法论时，标注来源（文章名 + 作者），便于回溯原文。

## Agent 注意事项

- 修改文档时保留原作者内容，追加式编辑优先于覆盖
- 涉及敏感信息（同事姓名、内部数据、商业机密）时，提交前向用户确认
- 不确定文档应归属哪个目录时，先询问用户
