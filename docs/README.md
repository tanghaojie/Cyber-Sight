# 项目文档中心

`docs/` 保存项目长期有效的设计、决策、实施计划和 AI 协作记录。聊天内容只能作为临时上下文，仓库中的文档才是后续开发和回溯的依据。

## 目录结构

```text
docs/
├── README.md                 # 文档入口、导航与生命周期
├── design/                  # 当前有效的系统与模块设计
│   ├── system-overview.md
│   └── modules/
├── decisions/               # ADR：重要且长期有效的技术决策
├── guides/                  # 面向人类维护者的操作型开发指南
├── reference/               # 错误码等需要持续维护的参考表
├── plans/
│   ├── active/              # 正在实施的计划
│   └── archive/             # 已完成、取消或被替代的历史计划
├── ai-logs/YYYY/MM/         # AI 协作过程的结构化摘要
└── templates/               # 设计、计划、ADR、AI 日志模板
```

## 阅读顺序

新成员或 AI 开始工作时，按以下顺序建立上下文：

1. [系统概览](design/system-overview.md)
2. 与任务相关的[模块设计](design/README.md)
3. 相关的[架构决策](decisions/README.md)
4. [进行中的实施计划](plans/README.md)
5. 必要时查看历史计划和 [AI 协作记录](ai-logs/README.md)

第一次参与项目开发的人类维护者应先阅读[人类维护者开发指南](guides/human-maintainer-development-guide.md)。
业务错误码统一查询和登记在[错误码参考](reference/error-codes.md)。

## 文档分工

| 文档 | 回答的问题 | 生命周期 |
| --- | --- | --- |
| Design | 系统现在应该如何工作，边界是什么 | 持续更新，始终描述当前设计 |
| ADR | 为什么选择这个长期方案 | 追加为主，旧决策通过新 ADR 替代 |
| Plan | 这次准备怎样实施和验证 | 执行中持续更新，完成后归档 |
| AI Log | 人与 AI 当时沟通了什么、做了什么 | 按任务追加结构化摘要 |

原始聊天记录可能保存在外部工具中，但不作为仓库内的设计依据。对后续有价值的内容必须提炼到上述四类文档中。

## 强制规则

根目录 [AGENTS.md](../AGENTS.md) 定义 AI 修改仓库时的文档门禁。非简单代码改动必须同时具备设计、计划和 AI 协作记录；形成长期技术决策时还必须增加 ADR。

## 命名约定

- 设计文档：使用稳定语义名称，例如 `backend.md`、`api-contract.md`。
- 实施计划：`YYYY-MM-DD-<topic>.md`。
- AI 日志：`YYYY-MM-DD-<topic>.md`，放入对应年月目录。
- ADR：`ADR-NNNN-<topic>.md`，序号递增且不复用。
- 文件名使用英文小写和连字符，正文默认使用中文，代码标识保持原样。
