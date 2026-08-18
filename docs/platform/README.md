# Platform 文档入口

本作用域由当前业务平台维护，保存业务、品牌、配置、部署、接入 Foundation 的适配过程和完整本地历史。Forge 不覆盖这里的内容。

- `design/`：当前 Platform 设计。
- `decisions/`：当前 Platform 长期决策。
- `plans/active/`：当前 Platform 实施计划。
- `ai-logs/`：当前 Platform 协作记录。
- `archive/`：历史设计、决策、计划和日志。

新平台由 Forge 提供最小示例；平台建立后，本目录立即转为下游独立所有。创建文档时使用公共[模板](../templates/)并设置 `scope: platform`。

业务平台下游必须把根 `.archive-audit.json` 配置为 `platform-downstream`：只管理 `platform`，把 `foundation` 标记为 inherited，并排除 `forge`。可以从公共[下游归档审计配置模板](../templates/archive-audit-platform-downstream.json)复制；Foundation 问题返回上游处理，不得在下游修改 Foundation ledger。
