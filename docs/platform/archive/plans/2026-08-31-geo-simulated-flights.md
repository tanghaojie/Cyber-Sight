---
title: Geo 前端模拟航班
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 前端模拟航班

## 目标

把无法在浏览器中可靠直连的实时航班功能替换为完全离线的前端模拟航班：保留航班任务组、开关、轨迹和时间轴互动，但删除 Geo 后端、OpenSky 契约和所有网络请求。

## 范围

- 固定内置模拟航线和航空器展示信息；
- 航线位置样本绑定唯一的 `viewer.clock`，由 Cesium 插值和速度朝向驱动；
- 删除 Platform 后端 `geo` 模块、共享 OpenSky Schema、后端测试及前端 API 边界；
- 明确标示数据为模拟，启动、关闭和页面销毁均释放实体资源。

## 非目标

- 不连接任何外部航班服务、代理、密钥、缓存或持久化；
- 不模拟真实航班计划、航线覆盖或真实时间；
- 不创建第二个 Clock，也不新增前端自动化或浏览器测试。

## 实施任务

- [x] 更新设计、ADR 和协作记录；
- [x] 以 `SampledPositionProperty` 实现模拟航班图层和控制器；
- [x] 移除 OpenSky 前后端和契约代码；
- [x] 完成格式、类型、构建、架构和文档门禁，并进行人工验收交接。

## 验证与人工验收

- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和 `git diff --check`；
- API 契约、后端和前端适用构建；
- 维护者在 Geo 页面确认：开启后出现明确标注的模拟飞机和短轨迹；时间轴播放、暂停和拖动会驱动位置；关闭后实体消失；离开再进入没有重复实体或网络航班错误。

## 实际结果

- 删除了 API 契约、Nest Geo 模块、OpenSky 服务测试和前端 HTTP 边界；
- 8 架内置模拟飞机以 UTC 日内的 5 分钟位置样本、`SampledPositionProperty`、`VelocityOrientationProperty` 和路径图形展示；
- `pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、API 契约构建、后端构建、授权环境的前端生产构建和 `git diff --check` 通过；
- 前端自动化与浏览器测试依仓库规则未运行，保留上述人工验收项。
