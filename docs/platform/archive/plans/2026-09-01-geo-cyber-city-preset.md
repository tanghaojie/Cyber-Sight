---
title: Geo 默认外部数据与赛博城市渲染
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-09-01
updated: 2026-09-01
---

# Geo 默认外部数据与赛博城市渲染

## 目标

为 Geo 数据面板提供可直接加载的默认 glTF 地址，启动时加载并定位成都建筑 3D Tiles，以程序化赛博 Shader 改善白模视觉，并在相机高度超过 30 km 时自动隐藏该预置 Tileset。

## 背景与设计依据

- `docs/platform/design/modules/geo.md`：Data 插件、纯 Cesium 工具、Viewer 生命周期、单一 Clock 和人工验收边界。
- `ADR-20260901-geo-cyber-city-tileset-preset.md`：确认 CustomShader、启动预置、原始材质切换和 30 km 自动隐藏语义。
- Cesium 1.144：`CustomShader` 可用于 `Cesium3DTileset`，资源由应用显式销毁；CustomShader 不与 `Cesium3DTileStyle` 叠加。
- 维护者已确认“深蓝楼体 + 发光窗格 + 青色轮廓 + 蓝紫扫描带”方向，并追加高于 30 km 自动隐藏要求。

## 范围

- 模型 URL 输入框默认填写指定 glTF 地址。
- Data 插件启动后异步加载指定成都 3D Tiles，成功后自动定位。
- 为启动预置提供程序化赛博 Shader 和“科技扫描 / 原始材质”切换。
- 扫描相位跟随唯一 `viewer.clock` 的播放状态，不新增定时渲染循环。
- 预置 Tileset 在相机高度大于 30 km 时自动隐藏，回落后恢复用户显示意图。
- 更新当前设计、ADR、计划、AI 协作记录及人工验收矩阵。

## 非目标

- 不为用户手工加载的第三方 Tileset 默认套用赛博 Shader。
- 不增加月光、人工场景光源、天气、全屏 Bloom 或额外纹理服务。
- 不上传、代理、缓存或持久化远程模型和 Tileset。
- 不创建或运行前端自动化、端到端或浏览器测试。

## 前置条件和风险

- 远程 Vercel 资源的网络、CORS 和长期可用性不由仓库控制，失败必须保持局部可恢复。
- CustomShader 属于实验能力，生产构建不能替代真实浏览器/GPU 验收。
- Shader 必须保留模型工具的批次颜色输入，避免高亮和点击分类完全失效。
- 自动隐藏必须区分用户主动隐藏与高度策略隐藏，回到 30 km 内不能擅自显示用户已关闭的资源。

## 实施任务

- [x] 建立默认 URL/预置常量和纯 Cesium 赛博 Shader 工具。
- [x] 扩展 Data browser/controller 的 Tileset 样式、Clock 相位、30 km 可见性和资源清理语义。
- [x] 接入启动异步加载、成功后自动定位、默认模型 URL和资源卡片状态/样式切换。
- [x] 更新设计和人工验收矩阵，完成静态验证、归档、提交及 trailer 验证。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm architecture:check`
- `pnpm --filter @cyber-ai-forge/frontend build`
- `pnpm docs:archive:check:ci`
- `git diff --check`
- 人工：默认 Tileset 加载并定位；科技/原始切换；太阳光照和模型工具；时间播放/暂停对应扫描移动/冻结；30 km 上下阈值且用户主动隐藏状态不丢失；远程失败和页面离开无残留。

## 发布与回滚

按现有 Platform 前端流程发布。若远程资源或 Shader 在目标浏览器不可用，可回退单一提交；不得用持续重试、额外场景光源或全屏后处理掩盖失败。

## 实际验证结果

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check` 和 `git diff --check` 通过。
- `pnpm --filter @cyber-ai-forge/frontend build` 通过，包含 `vue-tsc` 与 Vite 生产构建；只出现仓库既有的 Sass legacy API、Rollup 注释、动态/静态导入和大 chunk 警告。
- `pnpm docs:archive:check:ci` 返回 Platform `NOT_DUE`。
- 按仓库约束未运行前端自动化或浏览器测试；真实 Shader 编译、远程 CORS、视觉和 GPU 成本、自动定位、30 km 阈值与资源清理仍由维护者人工验收。

## 实际偏差和遗留问题

- 为实验性 CustomShader 增加保守降级：场景报告渲染错误时，活动科技扫描 Tileset 恢复原始材质，并在 Data 局部错误状态提示。
- 未增加原计划范围之外的人工场景光、Bloom、纹理网络请求或独立动画循环。

## 相关设计、ADR 和 AI 日志

- [Geo 当前设计](../../design/modules/geo.md)
- [赛博城市启动预置 ADR](../../decisions/ADR-20260901-geo-cyber-city-tileset-preset.md)
- [本次 AI 协作记录](../ai-logs/2026/09/2026-09-01-geo-cyber-city-preset.md)
