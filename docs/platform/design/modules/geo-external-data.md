---
title: Geo 外部数据独立菜单
scope: platform
repository: Cyber-Sight
status: active
owner: project maintainers
updated: 2026-10-17
---

# Geo 外部数据独立菜单

## 职责与边界

“外部数据”位于 Geo 左侧任务菜单，紧随“数据”，直接打开独立加载面板。“数据”只负责底图与注记、地形。外部数据只提供 GeoJSON URL、模型 URL、3D Tiles URL 三种入口；移除地标与周边、场景 URL、台北示例及相关场景操作入口。

这是现有 Platform Geo 模块内的 UI 分工。继续由 data 插件持有唯一 controller、数据资源和 Cesium 生命周期，不增加后端、API、依赖或跨模块公共接口。地标底层解析及生命周期实现保留，但当前菜单不暴露该能力。

## 交互设计

- 首屏按 GeoJSON、模型、3D Tiles 顺序显示三个类型按钮，默认选中 GeoJSON；每次只展开对应的 URL 和加载操作。
- GeoJSON 与 3D Tiles URL 默认空白；模型 URL 保留原有 DEFAULT_GEO_MODEL_URL。类型切换保留三个输入及模型放置草稿。
- 模型表单保留 WGS84 经度、纬度、椭球高及“使用视图中心”；缩放和姿态收在可选详情中。
- 类型选择下方呈现独立加载卡片，当前会话的已加载数据单列管理，保留显示、定位、移除、模型调整与瓦片材质切换。
- 加载期间禁止重复提交，以当前 controller 的 loadingOperation 提示真实加载类型。错误在加载表单附近显示，保留 URL 以便重试。

## 内部文件与数据流

`data.plugin.ts` 在同一插件中登记 data 与 external-data 两个任务组和两个 panel。`DataPanel.vue` 管理底图与地形；`ExternalDataPanel.vue` 管理三种 URL 表单和资源操作。两者调用同一 `data.controller.ts`，再进入既有工具层与 Scene 渲染 capability。`GeoWorkspacePage.vue` 只补齐任务元数据和面板选择，不承载加载规则。

公共文件仍以 [Geo 模块设计](geo.md) 登记为准，不对其他模块公开两个面板。切换菜单不重建 Viewer 或 controller；模型坐标确认仍由既有 overlay 承载。

## 失败模式与验证

远端失败、跨域限制、无效模型和坐标确认取消继续遵循既有 controller 行为；菜单拆分不修改资源加载规则。默认瓦片仍由插件启动逻辑处理。

执行格式检查、前端 TypeScript/生产构建、修改文件 ESLint、模块所有权与文档归档 CI 检查。按仓库规则不创建或运行前端自动化、浏览器测试。维护者人工验收：独立菜单顺序、数据页仅两个 Tab、三个 URL 默认值与切换、地标入口消失、三类加载/错误/资源管理、模型定位与坐标确认、1280×720 下导航与面板可滚动。

## 交付与复核证据

实现提交为 `c76aa95`，本轮 TypeScript/生产构建、ESLint、格式与模块边界检查通过。提交后 Platform 达到累计 3 个完成事项，触发文档复核；复核范围为 `e71a7b3..c76aa95`，确认 `d4cf929` 的预览完成按钮命名函数、`bd52b3a` 的配色/照明隔离与本次菜单拆分均已进入现行设计。没有被取代但未归档的 Design/ADR，既有计划和协作记录已归档；人工视觉边界保留。
