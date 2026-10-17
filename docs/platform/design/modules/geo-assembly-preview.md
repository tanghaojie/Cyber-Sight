---
scope: platform
status: active
updated: 2026-10-17
---

# Geo 本地建筑拼装预览

用户需要在本地查看 AIModels 已发布 GLB 的构件飞入效果。本次属于 Geo 内部临时开发能力，使用 `/geo.html?assemblyPreview=1` 显式启用，只有 Vite DEV 模式加载组件；生产构建不提供入口。

## 职责与接口

`components/preview/AssemblyPreview.vue` 只负责操作和状态显示；`tools/model/assembly-preview.ts` 的 `createAssemblyPreview(viewer, rendering)` 拥有下载、Primitive、动画、镜头、取消和清理，返回 `load / play / pause / seek / clear / dispose`。这些均为 Geo 内部接口，不增加跨模块公共依赖。页面只组装组件，组件使用 Viewer 访问端口和 Scene 公开 capability。

加载固定地址 `https://jt-ai-models.vercel.app/tmp/building_assembly.glb`，复用 `prepareGeoModelAsset` 与统一模型渲染管理器。演示位置为成都附近明确标注的示例坐标，不声称模型包含真实地理定位；在当前地形上采样高度。模型就绪后同时激活全部构件动画，通过公开 `animationTime` 和 `animateWhilePaused` 使用同一实际经过秒数，短片段停留末帧。预览独立于场景 Clock，不改变昼夜、时间倍率或航班时间。

## 数据流、失败与清理

DEV + URL 参数 → Viewer ready → 动态组件 → 下载 GLB → 地形高度 → Model ready → 注册统一渲染 → 激活动画 → 固定覆盖建筑及飞入范围的镜头 → 自动播放。面板可暂停、重播、拖动进度、显示完成状态及移除模型。

网络、地形、加载、场景渲染异常显示可重试错误；异步加载和镜头等待检查取消状态。移除、重试、退出页面时取消下载、ready 等待与镜头飞行，注销渲染句柄、事件及 Blob URL，销毁自有 Primitive；不修改原始 GLB、不改现有模型加载语义。

## 验证边界

执行格式、类型、lint、生产构建及文档审计。按仓库约定不运行前端或浏览器自动化。人工打开本地入口确认：首次自动播放、全构件同步顺序、暂停/拖动/重播、结束保持、移除/失败重试/离开页面，且昼夜时间和原有数据加载不变。生产包不得包含该预览入口或专用组件。实际视觉效果由维护者查看。
