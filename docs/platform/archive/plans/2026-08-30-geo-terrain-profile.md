---
title: Geo 地形剖面采样修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-30
updated: 2026-08-30
---

# Geo 地形剖面采样修复

## 目标

修复 Geo 地形采样无法形成用户工作流的问题，使用户能在地图上绘制采样线，沿线采样当前地形，并在地形面板中查看剖面与关键统计。

## 背景与设计依据

现有 `TerrainAnalysisTool.sample()` 只能采样调用方预先传入的离散坐标，面板把入口隐藏在“坐标分析”折叠区，并要求手工输入经纬度；controller 未接入 `InteractionManager`，采样结果也没有剖面展示。这与用户预期的画线地形剖面不一致。

依据 [Geo 当前设计](../../design/modules/geo.md)，有状态鼠标工具必须经过插件 controller 和统一交互管理器，纯 Cesium 绘制与采样逻辑留在 `tools/terrain/`。

## 范围

- 在地图上单击添加采样线折点、移动预览、双击完成，并支持取消；
- 沿多段线等距生成有限数量的采样点，使用当前 terrain provider 取得高程；
- 保存采样线结果，计算累计距离、最低/最高高程与总距离；
- 在 Terrain 面板中展示可读的 SVG 地形剖面、统计、错误和清除入口；
- 同步 Geo 设计、计划、AI 协作记录和人工验收边界。

## 非目标

- 不新增后端、API、数据持久化、导出或前端自动化测试；
- 不改变等高线、地形着色和淹没算法；
- 不新增图表依赖。

## 前置条件和风险

- 高精度采样依赖当前 terrain provider 提供 `availability`；椭球体或不支持的 provider 必须反馈明确错误；
- 双击通常伴随单击事件，完成逻辑需要去除末尾过近的重复点；
- 采样点数必须受限，避免长路径导致请求和渲染压力。

## 实施任务

- [x] 增加可释放的地形剖面画线 session，并接入统一交互管理器；
- [x] 实现沿线路径等距插值、采样结果累计距离与地图结果线；
- [x] 重组 Terrain 面板并显示 SVG 剖面和统计；
- [x] 完成格式、类型、lint、架构、构建和文档门禁验证；
- [x] 补充实际结果并归档计划与 AI 协作记录。

## 测试与验证

- 自动门禁：`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、前端类型/生产构建、`pnpm docs:archive:check:ci`；
- 维护者人工验收：加载 World Terrain 后画两点及多折点路径，双击得到剖面；核对统计、取消、清除、工具互斥、切换椭球体后的错误反馈和重复操作资源清理。

## 发布与回滚

纯前端提交随 Cyber-Sight 常规构建发布。回滚本次提交即可恢复原坐标采样入口，不涉及数据迁移。

## 实际偏差和遗留问题

- 画线交互支持单击折点、移动预览、双击完成和 `Esc`/按钮取消，并通过 `InteractionManager` 与其他鼠标工具互斥；
- 沿线按约 100 米间距生成至少 32、最多 500 个等距点，调用当前 terrain provider 高精度采样；
- 地图保留采样后的贴地高程线，面板以内联 SVG 展示累计距离/高程剖面和总距离、最低/最高高程；
- 地形 provider 变化会取消进行中的剖面任务并清除旧 provider 的剖面结果；
- `pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm --filter @cyber-ai-forge/frontend build` 和 `git diff --check` 通过；生产构建在沙箱内遇到已知 Windows esbuild 目录访问限制，授权环境同命令通过；
- 未执行前端自动化或浏览器测试；真实地形交互与视觉仍由维护者人工验收。

## 相关设计、ADR 和 AI 日志

- [Geo 当前设计](../../design/modules/geo.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-30-geo-terrain-profile.md)
