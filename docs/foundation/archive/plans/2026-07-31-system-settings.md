---
title: 添加前端系统设置入口
status: completed
created: 2026-07-31
updated: 2026-07-31
---

# 添加前端系统设置入口

## 目标

在管理端 Header 用户下拉提供系统设置入口，交付设计完善、前端持久化的设置弹窗，并为后续功能接入保留稳定数据接口。

## 背景与设计依据

设置属于前端内置系统能力，使用独立 `system/settings` 模块拥有数据和 Dialog；应用壳只组合入口。依据[前端应用与应用壳设计](../../design/modules/frontend.md)、[模块边界](../../design/module-boundaries.md)和[设置模块设计](../../design/modules/settings.md)。

## 范围

- 添加 Header 下拉项与 Dialog。
- 提供导航菜单风格、主题颜色、深色模式、Tags View、侧栏 Logo、动态标题六项可编辑配置。
- 通过版本化 `localStorage` 在前端保存和恢复完整配置。

## 非目标

- 不实现上述配置对导航、主题、深色模式、TagView、侧栏或标题的实际影响。
- 不新增 API、数据库、后端或共享契约变更。

## 前置条件和风险

- `localStorage` 可能被浏览器策略禁止或写入失败；模块必须降级为内存状态。
- 设置弹窗属于预留能力，保存操作不得意外改变既有应用壳行为。

## 实施任务

- [x] 新建 settings 模块设计、Store 和 Dialog。
- [x] 在 Header 用户下拉组合系统设置入口。
- [x] 更新前端应用壳、模块和活动文档索引。
- [x] 执行格式化、静态检查、生产构建和 diff 检查。
- [x] 归档已完成计划与协作记录并创建自动提交。

## 测试与验证

执行 `pnpm format`、`pnpm format:check`、`pnpm lint` 与 `pnpm build`。不创建或运行前端自动化测试；维护者按设置模块设计中的三项场景进行浏览器人工验收。

## 发布与回滚

本次只新增本地浏览器存储键，回滚代码不会影响服务端或数据库。若需清除用户偏好，可在浏览器站点数据中删除 `cyber_system_settings:v1`。

## 实际偏差和遗留问题

未发生范围偏差。弹窗采用“先编辑草稿、保存时提交”的交互；恢复默认值同样只重置草稿，需点击“保存设置”才写入浏览器存储。

## 相关设计、ADR 和 AI 日志

- [设置模块设计](../../design/modules/settings.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-31-system-settings.md)
