---
title: Geo 数据面板与地图交互精简
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-20
updated: 2026-08-20
---

# Geo 数据面板与地图交互精简

## 目标

精简 Geo 数据面板的信息密度，补充高德 GCJ-02 显式启用入口，让对比面板使用真实图层名称，并统一地图默认与绘制/测量状态下的鼠标光标。

## 背景与设计依据

- `docs/platform/design/modules/geo.md` 要求数据目录渐进披露、局部失败隔离、交互工具经 `InteractionManager` 管理。
- 当前底图源卡片展开描述、warning 和限制原因，导致列表项偏大；当前图层也展开 warning。
- `GeoImagerySourceOptions.allowGcj02` 已作为高德源的安全门禁存在，但没有进入数据面板；比较控制器仍使用“图层 1/2”占位名称。

## 范围

- 将底图源项收敛为名称、坐标系、状态、添加按钮和描述 tooltip；隐藏 warning 文案。
- 隐藏当前图层 warning，保留必要的失败错误反馈。
- 在数据面板提供高德 GCJ-02 显式启用开关，并让可用性即时反映该设置。
- 通过 Geo capability 将数据模块维护的真实影像图层名称提供给比较模块。
- 删除比较面板的暂停/显示按钮。
- 为地图画布设置默认 `grab` 光标，标绘和测量继续由交互状态切换为 `crosshair`。

## 非目标

- 不新增前端自动化、端到端或浏览器测试。
- 不在本次实现新的 GCJ-02 到 WGS84 坐标转换算法；开关继续表示显式允许加载现有高德候选源。
- 不改变第三方影像源许可、网络和 CORS 责任，不改动后端、契约或数据库。

## 前置条件和风险

- 任务仅涉及 Platform 前端 geo 模块和 Platform 文档。
- 高德开关打开后，现有实现仍不提供通用纠偏；warning 不在列表卡片中展示，用户通过开关和源状态判断是否可添加。
- 影像图层能力需保持单向依赖：数据插件发布只读名称查询能力，对比插件不得穿透数据控制器内部状态。

## 实施任务

- [x] 精简底图源项和当前图层项的模板与样式。
- [x] 暴露并接入高德 GCJ-02 显式启用开关。
- [x] 通过 capability 为对比选择项提供真实图层名称，并移除暂停/显示按钮。
- [x] 设置默认抓手光标并保持标绘/测量十字光标。
- [x] 更新 Geo 设计、计划和 AI 协作记录。
- [x] 执行格式、类型、构建、lint、归档 CI 检查并记录人工验收边界。

## 测试与验证

- `rtk pnpm format`、`rtk pnpm format:check` 通过。
- 前端 `vue-tsc`/生产构建、`rtk pnpm lint`、`rtk pnpm architecture:check` 和 `rtk pnpm docs:archive:check:ci` 通过；构建在授权环境完成。
- 已完成代码静态核对；底图卡片高度/信息项、i 图标 tooltip、当前图层、开关、真实对比名称、比较操作和地图光标状态仍需维护者人工浏览器验收。

## 发布与回滚

本次为前端 UI 与模块内能力调整。若需回滚，恢复数据面板、比较面板及 geo capability 的本轮改动，不涉及数据库或外部服务状态。

## 实际偏差和遗留问题

- 未实现新的 GCJ-02 到 WGS84 通用纠偏；开关沿用原有显式允许加载语义。
- 未运行前端自动化、端到端或浏览器测试，符合仓库前端验证边界。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo 前端编译期插件架构](../../decisions/ADR-20260814-geo-frontend-plugin-architecture.md)
- [Geo 影像默认源与失败隔离](../../decisions/ADR-20260820-geo-imagery-defaults.md)
- [Geo 数据面板与地图交互精简协作记录](../../ai-logs/2026/08/2026-08-20-geo-panel-interaction-refinement.md)
- 关联提交：本轮最终 Git 提交（以 `git log -1` 为准）
