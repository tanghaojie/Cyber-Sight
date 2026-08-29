---
title: Geo 外部模型放置与定位闭环
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-29
updated: 2026-08-29
---

# Geo 外部模型放置与定位闭环

## 目标

让用户加载外部 glTF/GLB 时能够明确设置模型位置、缩放和旋转，并在加载后继续编辑变换、重新定位到模型，补齐从放置到调整再到查看的完整会话闭环。

## 背景与设计依据

现有数据插件只提交模型 URL，底层 `modelMatrix` 没有由界面构造；资源快照不保存模型位姿，`flyTo` 还明确跳过 model。修复遵循 [Geo 前端空间可视化工作台](../../design/modules/geo.md) 的纯工具、controller、Vue UI 分层和显式渲染约束。

## 范围

- 定义经度、纬度、高度、统一缩放、heading、pitch、roll 的会话模型变换；
- 加载前允许填写参数，并可从当前视图中心取得建议位置；
- 为已加载模型显示可展开的变换编辑器，支持应用修改；
- 加载成功后自动飞到模型，并让后续定位动作飞到当前变换后的真实包围球；
- 每次放置、变换、显隐和定位后请求 Cesium 重绘；
- 同步 Geo Design、计划、AI 记录和验证结果。

## 非目标

- 不上传或代理外部模型，不解决目标服务的 CORS、鉴权或资源许可；
- 不持久化模型场景，不新增后端、API 契约或数据库；
- 不提供非统一三轴缩放、鼠标拖拽 gizmo、地形自动贴合或模型资产管理；
- 不创建或运行前端自动化、端到端或浏览器测试。

## 前置条件和风险

- 经纬度、纬度、缩放和全部角度必须在工具层校验，不能只依赖 HTML 输入约束；
- 模型包围球必须反映最新 `modelMatrix`，定位时不能继续走不支持 Primitive 的 `viewer.flyTo`；
- 前端构建和类型检查不能替代维护者对模型朝向、大小、位置与相机定位的人工验收。

## 实施任务

- [x] 扩展纯数据浏览器的模型变换类型、矩阵构造、更新和定位；
- [x] 扩展 data controller 的视图中心建议位置与模型更新接口；
- [x] 完成加载前参数和已加载模型编辑器；
- [x] 更新最终设计、验证结果和人工验收边界；
- [x] 归档计划和 AI 记录并创建提交。

## 测试与验证

- `pnpm format`、`pnpm format:check`；
- `pnpm --filter @cyber-ai-forge/frontend build`；
- `pnpm lint`、`pnpm architecture:check`；
- `pnpm docs:archive:check:ci`；
- `git diff --check`；
- 维护者人工验收视图中心取点、加载、六项位姿/缩放修改、显隐、定位和移除。

## 发布与回滚

随前端正常构建发布；若模型矩阵或定位行为回归，可整体回滚本次提交。

## 实际偏差和遗留问题

- 初始位置在面板创建时取一次当前视图中心，用户移动相机后可再次点击“使用视图中心”刷新；
- 加载成功后自动飞到模型，已加载资源摘要持续显示坐标、高度和缩放，展开“调整”可修改全部变换；
- 工具层对有限数值、经纬度范围和正缩放执行运行时校验，所有场景写入显式请求重绘；
- 沙箱内 Vite/esbuild 因 Windows 目录访问限制失败，同一前端生产构建在授权环境通过；
- `pnpm format`、`pnpm format:check`、前端生产构建、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 与 `git diff --check` 均通过；
- 按仓库边界未创建或运行前端自动化/浏览器测试，维护者仍需使用真实外部模型人工验收位置、朝向、缩放和相机定位。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [本次 AI 协作记录](../ai-logs/2026/08/2026-08-29-geo-model-placement.md)
