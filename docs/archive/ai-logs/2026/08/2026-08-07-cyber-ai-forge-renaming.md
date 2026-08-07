---
title: Cyber AI Forge 品牌与项目标识改名
date: 2026-08-07
status: completed
---

# Cyber AI Forge 品牌与项目标识改名

## 用户目标和约束

用户确认项目正式名称改为 `Cyber AI Forge`，英文副标题为 `AI-Native Enterprise Application Scaffold`，中文副标题为 `AI 驱动的企业应用智能构建平台`，要求整体同步修改。

仓库规则要求先通过暂存区门禁、运行文档归档审查、阅读最小相关文档，并为非简单改动维护设计、计划和协作记录。

## 关键问答与确认

- 未要求修改 GitHub 仓库地址，因此保留现有仓库 URL。
- 未要求移除创作者品牌，因此保留 JTLab / 桀士实验室的独立署名。
- 本次按“整体品牌与项目级标识”理解，包含前端、README、Swagger、HTML 元信息、包名、JWT 和浏览器存储键。

## AI 的重要假设

- `CYBER` 仍是短品牌和 Logo 语义，不改动 Logo 图形组件文件名。
- 修改 JWT issuer/audience、访问令牌键、语言键和标签历史键属于改名后的新运行时标识；旧浏览器会话不迁移，但清理旧访问令牌键。
- `@scaffold/*` 是内部工作区包作用域而非界面品牌，暂不改名以避免无必要的跨文件依赖迁移；根包名改为 `cyber-ai-forge`。

## 方案和执行摘要

1. 先建立活动计划、AI 日志和新 ADR。
2. 更新品牌设计和现行模块文档，使最终名称、字幕和兼容性事实一致。
3. 更新前端默认配置和双语文案，确保登录页、工作台、关于页、HTML 和 favicon 都显示新品牌。
4. 更新 README、Swagger、根包名、JWT 标识和浏览器存储键。
5. 格式化并运行仓库允许的静态检查、构建和后端测试；前端浏览器行为留给维护者人工验收。

## 验证结果

- 暂存区门禁通过；`pnpm docs:archive:check` 返回 `NOT_DUE`。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm build` 和 `pnpm test` 全部通过。
- 后端测试通过 14 个测试文件、121 项测试；共享契约和前端生产构建通过。
- 残留搜索确认旧产品名只保留在新 ADR/计划的迁移背景，旧访问令牌和旧标签键只保留在兼容性清理说明，旧仓库 slug 只保留在 GitHub URL。
- 前端浏览器行为、响应式布局、favicon、语言切换和 Swagger 视觉效果仍需维护者人工验收。

## 未决问题与下一步

未决问题：是否需要在 GitHub 外部同步修改仓库展示名或 URL；本次提交不操作远端资源。

## 相关设计、ADR、计划和提交

- 计划：[Cyber AI Forge 品牌与项目标识改名](../../../plans/2026-08-07-cyber-ai-forge-renaming.md)
- ADR：[Cyber AI Forge 品牌与项目级技术标识](../../../../decisions/ADR-0031-cyber-ai-forge-brand.md)
- 设计：[CYBER 品牌与视觉系统](../../../../design/branding.md)
- 提交：`chore: rename project to Cyber AI Forge`。
