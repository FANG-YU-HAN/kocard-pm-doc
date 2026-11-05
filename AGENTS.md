

本文件供 AI Agent（Claude Code / Qoder / Cursor 等）在本仓库中工作时阅读，说明仓库用途、目录约定和工作规范。

## 仓库用途

kocard 项目的产品经理工作文档记录，包括需求文档、会议记录、调研报告、复盘总结等。
* 我是这个产品的主导者，CEO
* 老板（P）是我的战略顾问，
* 领导（F）是我的咨询顾问
* 整个公司都是我用来完成这个产品的资源池


## 目录结构

- `doc/`：工作底稿，需求、会议、调研、原型、表格都放这里，不对外发布
- `publish/`：要上线的内容，只有明确要发布时才往里加；`publish/index.html` 由脚本生成
- `publish/demo/`：手机端全屏 demo（Safari 打开后添加到主屏幕）
- `plugins/`、`templates/`、`site/`：工具、模板和构建脚本，不是文档内容

## 文件命名规范

- 文件：`YYYY-MM-DD-标题.md`，放在 `doc/`，如 `doc/2026-10-19-xx需求评审.md`
- 标题使用中文，全部小写字母仅用于英文缩写（如 `prd`、`api`）
- 不要使用空格，用连字符 `-` 分隔

## 文档写作规范

- 语言：中文为主，专有名词可保留英文
- 不要自己发明词汇，用普通大众都能懂的话写，不要用生造的概念、虚拟概念
- 每篇文档开头包含：日期、参与人/作者、状态（草稿 / 已评审 / 已归档）
- 会议纪要需包含：结论、待办事项（Action Items，标注负责人和截止时间）
- Markdown PRD 需包含：背景、目标、功能需求、验收标准、埋点、风险；HTML PRD 按下面的模板写，模板没有的章节不要自己加

### HTML PRD

HTML 版 PRD 统一从模板生成，不要从零写页面：

```bash
node plugins/kocard-prd/scripts/new-prd.mjs "文档标题"
node plugins/kocard-prd/scripts/check-prd.mjs "doc/生成的文件.html" --strict
```

- 模板与插件说明：`templates/prd/prd-template.html`、`plugins/kocard-prd/README.md`
- 文件名为 `YYYY-MM-DD-标题.html`，脚本会写进 `doc/`
- 只填内容，不改 `<style>` / `<script>`；不适用的章节整节删除，问题、目标、功能需求、验收除外
- 交付前检查必须 0 错误、0 警告；占位符未填也算警告
- Qoder 会通过本地插件 `kocard-prd` 自动套用；其他 Agent 以本节为准

## 发布

- 线上站点由 Cloudflare Pages 构建：构建命令 `node site/build.mjs`，输出目录 `publish`
- 要发布某篇文档：把它从 `doc/` 移到 `publish/`，运行 `node site/build.mjs` 更新索引，提交推送后自动上线
- 发布后的文档只有一份，后续修改直接改 `publish/` 里的文件，不要在两处各留一份
- 不要直接把内部调研、表格、会议记录放进 `publish/`

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
