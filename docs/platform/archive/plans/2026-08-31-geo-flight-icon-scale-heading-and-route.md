---
title: Geo 模拟飞机尺寸航向与单航线
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo 模拟飞机尺寸航向与单航线

## 目标

放大模拟飞机，让机头始终沿当前可见航线前进方向旋转，并移除重复的动态短轨迹，仅保留完整起终点航线。

## 范围

- 调整 Canvas 飞机 billboard 的显示比例；
- 以 Cesium 位置样本在当前屏幕的前进方向计算 billboard 旋转；
- 移除 `PathGraphics` 动态短轨迹，保留唯一完整大圆线；
- 同步当前设计、ADR、协作记录和人工验收项。

## 非目标

- 不改动航线数据、时间轴、后端或任何网络数据源；
- 不新建第二个 Clock，也不通过 `clock.onTick` 手动写入飞机位置；
- 不运行前端自动化或浏览器测试。

## 实施任务

- [x] 放大飞机并计算与可见航向一致的 billboard 旋转；
- [x] 删除动态短轨迹，只保留完整航线；
- [x] 完成构建、门禁和人工验收交接。

## 验证与人工验收

- 授权环境下的前端生产构建通过；`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和 `git diff --check` 通过；
- 飞机使用屏幕坐标中当前位置到前进位置的向量生成 `BillboardGraphics.rotation`，不写入实体位置；
- 前端自动化与浏览器测试依仓库规则未运行。维护者需确认飞机大小合适，机头沿可见航线前进方向旋转，且每条航线只显示一根完整起终点连线。
