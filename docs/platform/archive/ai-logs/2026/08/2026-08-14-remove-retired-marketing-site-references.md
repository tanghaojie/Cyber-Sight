---
title: 清理已移除推广站引用
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-14
status: completed
---

# 清理已移除推广站引用

## 用户目标和约束

用户要求把人工删除 `apps/website` 和 `README.en.md` 后遗留的 README、Pages 工作流和部分设计文档引用修改为当前事实。

## 关键问答与确认

- 推广站已从下游产品中移除，GitHub Pages 不再是当前部署能力。
- 历史推广站材料保留在 Platform archive，避免丢失决策和实施证据。
- 用户已人工运行并确认管理端整体无问题；不新增浏览器自动化测试。

## AI 的重要假设

- README 只保留中文入口、上游链接和文档入口。
- `README.md` 仍属于 Cyber-Sight 下游拥有文件。
- Forge 同步清单不再声明已删除的网站、英文 README 或 Pages 工作流。

## 方案和执行摘要

- 删除 `.github/workflows/deploy-pages.yml`。
- 清理 README 的网站链接、英文 README 链接、截图和网站资源路径，并修正文档目录链接。
- 更新 `.forge-sync.yml`、`AGENTS.md`、Platform 设计/指南/ADR 中的所有权和当前事实。
- 将 `docs/platform/design/marketing-site.md` 与 `docs/platform/decisions/ADR-0037-static-marketing-site.md` 移入 Platform archive。

## 验证结果

- 归档审计：`NOT_DUE`，最终 CI 门禁通过。
- 格式、架构、Lint、后端测试、生产构建全部通过。
- 全仓库非历史内容不再引用已删除的 `apps/website`、`README.en.md` 或 Pages 工作流。

## 未决问题与下一步

- 无。若未来重新需要公开推广站，应以新的设计和 ADR 重新评估，不恢复已删除的工作流。

## 相关设计、ADR、计划和提交

- `docs/platform/design/branding.md`
- `docs/platform/design/upstream-synchronization.md`
- `docs/platform/decisions/ADR-20260811-cyber-sight-downstream-identity.md`
- `docs/platform/archive/plans/2026-08-14-remove-retired-marketing-site-references.md`
