---
title: Geo 默认外部数据与赛博城市渲染
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-09-01
status: completed
---

# Geo 默认外部数据与赛博城市渲染

## 用户目标和约束

用户要求模型 URL 默认填写指定 glTF，Geo 启动默认加载指定成都建筑 3D Tiles，并先确认白模渲染方案。用户否定原生分级着色，确认“深蓝楼体 + 发光窗格 + 青色轮廓 + 蓝紫扫描带”的 CustomShader 方向，随后要求相机视角高度大于 30 km 时隐藏该 Tileset。

仓库约束：Geo 属于 Platform 前端模块；保持 Data 插件和纯 Cesium 工具边界、唯一 `viewer.clock`、只有太阳光照/阴影的场景光照边界、按需渲染和人工浏览器验收。

## 关键问答与确认

- 第一版原生 `Cesium3DTileStyle` 高度分级方案被用户认为不好看，不实施。
- 用户确认使用 CustomShader 程序化赛博城市材质。
- 30 km 语义为相机椭球高严格大于阈值时自动隐藏，回到阈值内恢复用户此前显示意图。

## AI 的重要假设

- 材质 `emissive` 只让建筑表面自发光，不创建照亮周边的人工光源，因此不扩展 Scene 光照范围。
- 扫描动画只在现有 Clock 播放时推进，暂停时冻结；不创建独立动画循环。
- 默认样式只作用于启动预置；手工加载的第三方 Tileset 保持原始材质。
- 启动加载异步执行，不阻塞 Data 插件贡献和其他依赖插件安装。

## 方案和执行摘要

新增 Data 预置常量与纯 Cesium Shader 工具；Data browser 负责 Shader、Clock、高度可见性、渲染失败降级和资源清理，controller 发布可描述状态，DataPanel 只展示并调用 controller。启动预置成功后自动定位，失败留在 Data 局部错误状态。模型输入默认填写指定 glTF；启动预置默认启用科技扫描并提供原始材质切换。

## 验证结果

- 开始前暂存区与工作区为空，`pnpm docs:archive:check` 返回 Platform `NOT_DUE`。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 和 `git diff --check` 通过。
- `pnpm --filter @cyber-ai-forge/frontend build` 通过，包含 `vue-tsc` 与 Vite 生产构建；输出仅包含仓库既有警告。
- `pnpm docs:archive:check:ci` 返回 Platform `NOT_DUE`。
- 遵守前端验证边界，未创建或运行自动化、端到端和浏览器测试。

## 未决问题与下一步

真实 Shader 编译、视觉、GPU 成本、远程 CORS、自动定位和 30 km 阈值必须由维护者在浏览器中人工验收。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../../design/modules/geo.md)
- [赛博城市启动预置 ADR](../../../../decisions/ADR-20260901-geo-cyber-city-tileset-preset.md)
- [实施计划](../../../plans/2026-09-01-geo-cyber-city-preset.md)
