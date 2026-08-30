---
title: Geo 可收起状态栏与时间轴底部自适应
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 可收起状态栏与时间轴底部自适应

## 目标

让 Geo 底部状态栏支持明确的收起与展开操作；收起后不显示任何坐标、FPS 或活动工具信息，同时让现有时间轴自动下沉到底部并避让展开按钮。

## 背景与设计依据

当前状态栏固定在底部，Time 插件的 `bottomDocks` 容器通过固定 `bottom` 值位于状态栏上方。状态栏没有折叠状态，因此即使隐藏内容也无法释放底部空间。现行 Geo 设计已经要求页面 Shell 负责渲染通用状态条和底部 dock，Time 插件不应感知 Shell 内部布局。

## 范围

- 由 `GeoWorkspacePage.vue` 持有状态栏开合状态；
- `GeoStatusBar.vue` 在收起状态只渲染展开按钮；
- Shell 根据开合状态调整 `bottomDocks` 和 Cesium credits 的底部占位；
- 补充中英文可访问名称、焦点态和 reduced-motion 行为；
- 同步 Geo 现行设计和协作记录。

## 非目标

- 不修改 Time controller、`viewer.clock`、播放范围或太阳光照语义；
- 不增加窄屏或移动端响应式布局；
- 不持久化状态栏开合偏好；
- 不新增前端自动化或浏览器测试。

## 前置条件和风险

- 开始修改前暂存区为空，归档审计为 `NOT_DUE`；
- 收起按钮必须始终可见且可键盘操作；
- 时间轴下沉后必须与展开按钮保持间距，不能遮挡 Cesium credits。

## 实施任务

- [x] 建立状态栏开合状态和可访问交互。
- [x] 让底部 dock 与 Cesium credits 使用开合状态驱动的布局变量。
- [x] 更新本地化、格式和设计记录。
- [x] 完成静态验证、diff 复核、归档和提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- 前端 TypeScript 检查和生产构建
- `pnpm architecture:check`
- `pnpm docs:archive:check:ci`
- 维护者人工验收：展开状态信息完整；收起状态仅有展开按钮；时间轴下沉且控件可用。

## 发布与回滚

随前端正常构建发布。若底部浮层发生遮挡，可回滚本计划关联提交恢复固定状态栏布局。

## 实际偏差和遗留问题

- 实现与计划一致：状态栏默认展开，收起后仅渲染一个 `44×44px` 外框、`40×40px` 点击区域的展开按钮；坐标、高程、相机高度、FPS 和活动工具提示均不渲染。
- 时间轴展开时保持 `bottom: 74px`，状态栏收起时通过 Shell CSS 变量下沉到 `bottom: 14px`；左侧保留 8px 间距避让展开按钮，Cesium credits 同步从 `158px` 调整到 `98px`。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 均通过。
- 前端 `vue-tsc && vite build` 在沙箱内因 Windows 目录读取权限失败，授权环境使用相同命令重跑通过；仅保留仓库既有的 Sass legacy API、Rollup 注释、重复导入和 Geo 大 chunk 警告。
- 按仓库边界未运行前端自动化或浏览器测试；展开/收起、时间轴拖动和视觉层级仍由维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 单一仿真时间与太阳光照](../../decisions/ADR-20260830-geo-simulation-time-and-solar-lighting.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-31-geo-collapsible-status-bar.md)
