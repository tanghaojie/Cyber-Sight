---
title: Geo 影像兜底与瓦片状态恢复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-30
status: completed
---

# Geo 影像兜底与瓦片状态恢复

## 用户目标和约束

用户要求只修复严格审查中的问题 1 和问题 4：配置天地图后缺少 Natural Earth 本地兜底，以及瞬时瓦片错误永久污染图层状态。若使用子智能体必须使用 Luna；本轮未使用子智能体。

## 关键问答与确认

无需新增产品决策。更新现有影像默认源 ADR：本地兜底从“无令牌默认”强化为“始终先加载”，瓦片错误从永久失败改为可恢复降级。

## AI 的重要假设

- Natural Earth 可作为远程影像下层持续显示，远程成功瓦片按正常不透明度覆盖它；
- Cesium provider 的 `errorEvent` 只证明失败，恢复必须来自后续真实 `requestImage` 成功，不能由固定超时推断；
- 用户主动移除或隐藏本地兜底层属于明确操作，不再自动补回。

## 方案和执行摘要

先更新现行设计、ADR、活动计划和协作记录，再实施代码与验证。数据插件始终先加载 Natural Earth；图层管理器把 provider 的真实 `requestImage` 包装为成功观察点，并在移除或销毁图层时恢复原方法、停止后续状态回调。

## 验证结果

- 配置天地图令牌时，启动顺序为 Natural Earth、天地图影像、天地图注记；本地层保持在远程底图下方；
- provider 错误将对应图层标记为 `degraded` 并保留最近错误，不再永久写为 `failed`；
- 后续真实瓦片请求成功时恢复 `ready` 并清除错误；图层移除或 manager 销毁后，迟到 Promise 不再回写状态；
- Cesium 1.144 provider 的 `requestImage` 方法可覆盖并恢复，`vue-tsc` 与生产构建验证类型和打包路径通过；
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`pnpm docs:archive:check:ci` 和 `git diff --check` 通过；
- 生产构建在授权环境通过，受限环境的首次失败为 Windows/esbuild 目录访问限制。

## 未决问题与下一步

最终交互由维护者人工验收：无令牌只加载 Natural Earth；有效/失效令牌下本地层始终保留；短暂断网恢复后降级状态清除；持续断网保持降级；用户主动隐藏或移除兜底层后不自动补回。本任务未创建或运行前端自动化测试。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../../design/modules/geo.md)
- [影像默认源 ADR](../../../../decisions/ADR-20260820-geo-imagery-defaults.md)
- [实施计划](../../../../archive/plans/2026-08-30-geo-imagery-fallback-and-recovery.md)
- 关联提交：本次交付提交。
