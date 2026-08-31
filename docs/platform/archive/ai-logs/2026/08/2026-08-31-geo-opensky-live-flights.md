---
title: Geo OpenSky 实时航线展示协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo OpenSky 实时航线展示协作记录

## 用户目标和约束

用户确认 Geo 是个人研究项目，OpenSky 足够，要求把 OpenSky 已有的实时航线展示实现为可由用户开启和关闭的功能。

## 关键问答与确认

- OpenSky 匿名 `/states/all` 提供实时状态向量，不提供完整商业航班计划；
- 真实请求验证返回 `Access-Control-Allow-Origin: https://opensky-network.org`，浏览器从 Cyber-Sight 直连会被 CORS 阻止；
- 因此新增 Platform `geo` 后端代理和共享契约，不在浏览器中保存 OpenSky 凭据；
- 前端按仓库规则不新增或运行自动化/浏览器测试，实际交互由维护者人工验收。

## AI 的重要假设

- “实时航线”解释为当前视域内的实时航空器位置，以及本次开启后根据轮询样本形成的短轨迹；不声称是完整计划航线；
- 默认关闭，只有用户开启后消耗 OpenSky 匿名额度；
- 墙钟实时数据不改变 `viewer.clock`，仿真时间轴仍只服务仿真和未来回放能力。

## 方案和执行摘要

- 完成 Platform 文档归档前置审查并推进 ledger；
- 以稳定模块名 `geo` 扩展共享契约、后端代理和前端 Flight 插件；
- 采用当前视域查询、30 秒轮询、手动刷新、实体上限和会话短轨迹；
- 把上游失败作为局部业务错误保留，不能转为空结果覆盖上次成功状态。

## 验证结果

- 共享契约、后端构建和前端 TypeScript 检查通过；
- 授权环境中的后端全量 `18` 个测试文件、`148` 项测试通过，包含 OpenSky 规范化、无坐标过滤、上游失败、业务错误、Nest 模块装配和超大视域拒绝；
- 授权环境中的前端生产构建通过；Geo 懒加载 JavaScript 为 `4,319.18 kB`（gzip `1,171.23 kB`），CSS 为 `75.36 kB`（gzip `13.58 kB`）；
- ESLint、格式检查、架构所有权检查和 `git diff --check` 通过；文档 CI 门禁返回 `NOT_DUE`；
- 受限 Windows 沙箱中的 Vite/Vitest 首次运行因 esbuild `Access is denied` 失败，相同命令在授权环境通过，确认是环境限制而不是源码错误；
- 未新增或运行前端自动化/浏览器测试；OpenSky 中国大陆覆盖、视觉密度、开关清理和异常恢复由维护者人工验收。

## 未决问题与下一步

- OpenSky 中国大陆实际覆盖、浏览器视觉和长时间轮询仍需维护者人工验收；
- 未来若需要历史回放、完整起降机场或稳定商用覆盖，重新评估数据供应商和 `viewer.clock` 时间范围。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../design/modules/geo.md)
- [OpenSky 实时航班 ADR](../../../decisions/ADR-20260831-geo-opensky-live-flight-tracking.md)
- [实施计划](../../../plans/2026-08-31-geo-opensky-live-flights.md)
- 关联提交：`feat: add OpenSky live flight layer`。
