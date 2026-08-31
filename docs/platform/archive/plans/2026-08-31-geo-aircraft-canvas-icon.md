---
title: Geo 模拟飞机透明 Canvas 图标
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 模拟飞机透明 Canvas 图标

## 目标

修复本地 SVG 已加载但在 Cesium billboard 中仍显示黑色方框的问题，以透明 Canvas 绘制飞机轮廓并直接交给 Cesium。

## 范围

- 用透明 Canvas 飞机图标替换 SVG 资源 URL；
- 保持完整航线、单一时间轴和离线模拟边界不变；
- 删除不再使用的静态 SVG，并同步当前设计、ADR、协作记录和人工验收项。

## 非目标

- 不改动航线数据、后端、网络请求或时间轴控制；
- 不添加图标库、图片服务、外部资源或前端自动化测试。

## 实施任务

- [x] 创建透明 Canvas 飞机轮廓并接入 billboard；
- [x] 删除失效 SVG 资源，完成构建、门禁和人工验收交接。

## 验证与人工验收

- 授权环境下的前端生产构建、lint、格式、所有权和 diff 检查通过；
- Canvas 以透明背景直接提供给 `BillboardGraphics.image`，不再存在 SVG 资源 URL 或 data URI 解码路径；
- 前端自动化与浏览器测试依仓库规则未运行。维护者需确认启用模拟航班后，飞机仅显示青色轮廓且其包围区域透明，不出现黑色方框。
