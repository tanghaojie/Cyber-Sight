---
title: Geo 无界时间轴与每日循环航线协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: active
---

# Geo 无界时间轴与每日循环航线协作记录

## 用户目标和约束

用户要求先评估当天时间轴能否改为类似 Cesium 原生 Timeline 的持续拖动与可缩放刻度，随后要求说明“可见窗口”和“仿真时间”的区别，并确认模拟航班采用每日循环航线。当前轮次只产出交互和时间语义方案，不修改功能代码。

## 关键问答与确认

- 24 小时限制来自当前 Time controller 和 range UI 的首版策略，不是 Cesium 时钟限制；
- 单屏可见窗口确定为最小 1 分钟、最大 10 年，平移不设产品边界；
- 每日航班以 UTC 固定起飞时刻和飞行时长重复，航段外不显示飞机，完整大圆线常驻；
- 不重新启用 Cesium 原生 Timeline/Animation，继续用自定义底部 dock 和唯一 `viewer.clock`。

## AI 的重要假设

“每日循环航线”解释为每天同一 UTC 时刻重复同一航段，而不是飞机 24 小时始终沿路线往返。若维护者希望航班落地后立即回到起点并无间断循环，应在实施前明确调整航段外可见性语义。

## 方案和执行摘要

新增草案设计和活动实施计划。方案将 UI 可见窗口与 `viewer.clock.currentTime` 分离：平移/缩放只改变刻度窗口，游标定位和播放才改变场景仿真时间；时钟采用 `ClockRange.UNBOUNDED`。Flight 需从复制 Clock 起止时间生成有限样本，改为按 `JulianDate` 确定性求值的每日循环位置属性，且不在每个 tick 手动写实体位置。

## 验证结果

- 开始前 `git diff --cached --quiet` 通过；
- `pnpm docs:archive:check` 返回 Platform `NOT_DUE`；
- 已只读核对当前 Time controller、Flight 工具、Geo 模块设计与相关 ADR；
- 本轮无功能代码变更，尚未执行前端构建或浏览器验收。

## 未决问题与下一步

等待维护者确认进入实施。实施完成后，更新当前 Geo 设计与相关 ADR、执行静态门禁，并交接时间轴、太阳光照、每日航班和资源生命周期人工验收。

## 相关设计和计划

- [设计方案](../../../design/modules/geo-unbounded-timeline.md)
- [实施计划](../../../plans/active/2026-08-31-geo-unbounded-timeline-and-daily-flight-cycle.md)
