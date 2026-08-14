---
title: 清理已移除推广站引用
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-14
updated: 2026-08-14
---

# 清理已移除推广站引用

## 目标

删除 `apps/website` 和 `README.en.md` 后，移除当前 README、部署配置、同步清单及有效 Platform 文档中的失效引用，并归档不再代表当前实现的推广站设计与 ADR。

## 背景与设计依据

- 下游人工修改 `b08c9cf` 已删除推广站和英文 README。
- GitHub Pages 工作流仍会尝试构建不存在的 `@cyber-ai-forge/website`，需要移除。
- 当前产品入口改为 README、管理端、后端、共享契约及 Platform 文档；历史推广站材料保留在归档目录。

## 实施任务

- [x] 清理根 README 的网站、英文 README、截图和已删除资源引用。
- [x] 删除失效的 GitHub Pages 工作流并更新 Forge 同步所有权清单。
- [x] 更新有效设计、ADR、指南和仓库协作规则中的当前事实。
- [x] 归档推广站设计与 ADR，并更新归档索引。

## 验证

- `pnpm format`
- `pnpm format:check`
- `pnpm architecture:check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm test:db`
- `pnpm docs:archive:check`
- `pnpm docs:archive:check:ci`
- 人工验收边界：维护者已确认管理端整体运行正常；本任务不新增浏览器自动化测试。

## 实际偏差与遗留问题

- 已归档的历史计划和 AI 日志保留推广站实现证据，不作为当前实现入口。
- 本次仅清理下游仓库引用，未推送 `origin`。

## 关联设计、ADR 和 AI 日志

- `docs/platform/design/branding.md`
- `docs/platform/design/upstream-synchronization.md`
- `docs/platform/decisions/ADR-20260811-cyber-sight-downstream-identity.md`
- `docs/platform/archive/ai-logs/2026/08/2026-08-14-remove-retired-marketing-site-references.md`
