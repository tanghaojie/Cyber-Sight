---
title: 导航菜单风格设置
date: 2026-08-04
status: completed
---

# 导航菜单风格设置

## 用户目标和约束

完成系统设置中的导航菜单风格：可切换侧边/顶部导航并在前端持久化；窄屏自动使用侧边导航；侧边导航不再使用隐藏显示按钮，始终显示。

## 关键问答与确认

复用现有系统设置的保存交互和 `localStorage` 键，不新增后端配置。

## AI 的重要假设

窄屏只临时覆盖视觉呈现，不覆盖用户已保存的桌面导航偏好；恢复宽度后自动恢复该偏好。

## 方案和执行摘要

`AdminLayout` 读取 settings 模块公开的 `navigationMenuStyle`，并监听 `max-width: 1023px` 媒体查询。侧边模式使用固定双栏和始终显示的 `AppSidebar`；顶部模式只渲染 `TopNavigation`。所有抽屉遮罩、打开和关闭按钮已移除；窄屏覆盖不会写回保存的桌面偏好。

## 验证结果

`pnpm format`、`pnpm format:check`、`npx vue-tsc --noEmit` 与 `pnpm build` 均成功。未运行前端自动化或浏览器测试，符合项目人工验收边界。

## 未决问题与下一步

维护者应人工验收：保存后切换和刷新恢复、窄屏强制侧边栏、恢复桌面宽度后的偏好还原，以及侧边模式下没有导航开关。

## 相关设计、ADR、计划和提交

- [前端应用与应用壳](../../../../design/modules/frontend.md)
- [前端系统设置模块](../../../../design/modules/settings.md)
- [实施计划](../../../plans/2026-08-04-navigation-style-settings.md)
