---
title: 系统设置剩余项接入
date: 2026-08-05
status: completed
---

# 系统设置剩余项接入

## 用户目标和约束

接入系统设置中尚未生效的三个开关：Tags View、Sidebar Logo 和动态标题；动态标题关闭时必须始终显示 app name。

## 关键问答与确认

代码与现行设计均表明三项设置已持久化但未消费。未发现同一事项的活动计划，开始修改前暂存区为空。

## AI 的重要假设

“切换是否显示”表示 Tags View 只改变可见性，不删除其账号隔离的历史。app name 对应 `appConfig.name`。隐藏 Sidebar Logo 不应削弱移动抽屉的关闭能力。

## 方案和执行摘要

由 `AdminLayout.vue` 消费 Tags View 与 Sidebar Logo 设置，并由 `main.ts` 消费动态标题设置；不让 settings 或 tag-view 模块反向依赖 Router、认证或侧栏内部实现。

## 验证结果

`pnpm format`、`pnpm format:check`、`pnpm lint` 和 `pnpm --filter @scaffold/frontend build` 均通过。前端自动化和浏览器测试遵循项目边界未执行；生产构建保留既有 Sass 弃用与静态/动态导入提示。

## 未决问题与下一步

待维护者按设计文档完成人工验收：切换三个开关、刷新恢复偏好，并在动态标题关闭时确认路由与语言切换不改变浏览器标题。

## 相关设计、ADR、计划和提交

- [系统设置模块](../../../../design/modules/settings.md)
- [实施计划](../../../plans/2026-08-05-settings-shell-preferences.md)
