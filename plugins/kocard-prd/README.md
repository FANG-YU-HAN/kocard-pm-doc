# Kocard PRD 模板插件

让 Qoder 在本仓库写 PRD 时固定使用 `templates/prd/prd-template.html`，并在交付前检查结构、样式和禁用内容。

## 安装

在仓库根目录执行（本机 Qoder CLI 在 `~/.qoder/bin/qodercli/` 下，文件名带版本号）：

```bash
"$(ls -d ~/.qoder/bin/qodercli/qodercli-* | tail -1)" plugins install ./plugins/kocard-prd --scope project
```

安装后重启 Qoder，或在 CLI 里执行 `/plugins reload`。当前是项目范围安装，`.qoder/settings.json` 会随仓库提交；插件快照在 `~/.qoder-cn/plugins/cache/local/kocard-prd/`，改完插件文件要重新执行安装才会生效。

## 使用

在 Qoder 里说“写一个 XX 的 PRD”，或从技能列表选择 `kocard-prd:prd`。

也可以手动跑：

```bash
node plugins/kocard-prd/scripts/new-prd.mjs "桌面端订阅支付"
node plugins/kocard-prd/scripts/check-prd.mjs "2026-10-26-桌面端订阅支付.html" --strict
```

`new-prd.mjs` 会复制模板、填标题和日期、按 `YYYY-MM-DD-标题.html` 命名；文件已存在时拒绝覆盖。

`check-prd.mjs` 会检查：

- 是否带模板标记
- 样式块和脚本块是否与模板完全一致
- 需求、状态、验收、变更、待确认表的表头是否与模板一致（只对比同一模板版本的文档），每行单元格数是否对得上
- 左侧目录锚点是否都能找到对应章节
- 页脚版本是否与变更记录最新一行一致
- 核心章节是否齐全
- 是否出现「数据与接口」「AI 评测」、品牌标、外链资源
- 是否残留示例标题和 `[填数字]` 这类占位内容

有错误时退出码为 1；`--strict` 时警告也按错误处理。

## 目录

```text
plugins/kocard-prd/
├── .qoder-plugin/plugin.json
├── skills/prd/SKILL.md
├── scripts/new-prd.mjs
├── scripts/check-prd.mjs
└── README.md
```

## 模板维护

只改 `templates/prd/prd-template.html`，不要在单篇 PRD 里改样式。改完模板后：

1. 把模板顶部的 `<!-- prd-template:vN -->` 版本号加一。
2. 更新本 README。
3. 新文档只影响之后生成的文件，已交付文档不自动迁移。

改 `SKILL.md`、`plugin.json` 或脚本后，重新执行安装命令刷新插件快照。
