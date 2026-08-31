---
title: Geo 无界时间轴与每日循环航线协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 无界时间轴与每日循环航线协作记录

## 用户目标和约束

用户要求先评估当天时间轴能否改为类似 Cesium 原生 Timeline 的持续拖动与可缩放刻度，随后要求说明“可见窗口”和“仿真时间”的区别，并确认模拟航班采用每日循环航线，最后授权开始实施。

## 关键问答与确认

- 24 小时限制来自当前 Time controller 和 range UI 的首版策略，不是 Cesium 时钟限制；
- 单屏可见窗口确定为最小 1 分钟、最大 10 年，平移不设产品边界；
- 每日航班以 UTC 固定起飞时刻和飞行时长重复，航段外不显示飞机，完整大圆线常驻；
- 不重新启用 Cesium 原生 Timeline/Animation，继续用自定义底部 dock 和唯一 `viewer.clock`。

## AI 的重要假设

“每日循环航线”解释为每天同一 UTC 时刻重复同一航段，而不是飞机 24 小时始终沿路线往返。若维护者希望航班落地后立即回到起点并无间断循环，应在实施前明确调整航段外可见性语义。

## 方案和执行摘要

Time controller 采用 `ClockRange.UNBOUNDED`，保留唯一 `viewer.clock` 并新增独立可见窗口状态。TimeDock 以自定义 UTC 刻度轨替代 range input：空白拖动平移，滚轮围绕指针缩放，游标拖动或点击定位并暂停，键盘提供平移、缩放和回到现在。Flight 从复制 Clock 边界生成有限 `SampledPositionProperty`，改为按 `JulianDate` 确定性求值的每日 UTC 航段；航段外返回不可见位置，不在每个 tick 手动写实体位置。

## 验证结果

- 开始前 `git diff --cached --quiet` 通过；
- `pnpm docs:archive:check` 返回 Platform `NOT_DUE`；
- 已只读核对当前 Time controller、Flight 工具、Geo 模块设计与相关 ADR；
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和 `git diff --check` 通过；
- 受限沙箱中的 Vite/esbuild 读取配置目录失败，授权环境以相同 `pnpm --filter @cyber-ai-forge/frontend build` 命令通过；
- 依仓库规则未运行前端自动化或浏览器测试。

## 未决问题与下一步

实现完成并同步 Geo 设计与相关 ADR。维护者后续需人工验收时间轴手势、各级刻度可读性、太阳昼夜变化、每日航班循环与资源释放。

## 相关设计和计划

- [设计方案](../../../design/modules/geo-unbounded-timeline.md)
- [实施计划](../../../archive/plans/2026-08-31-geo-unbounded-timeline-and-daily-flight-cycle.md)
