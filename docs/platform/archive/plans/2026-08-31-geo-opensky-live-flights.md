---
title: Geo OpenSky 实时航线展示
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
---

# Geo OpenSky 实时航线展示

## 目标

在 Geo 工作台增加可由用户开启和关闭的 OpenSky 实时航班任务组：按当前地图视域拉取飞机状态，在 Cesium 中显示航空器位置，并在本次开启会话内累积短轨迹。

## 背景与设计依据

项目是个人研究用途，OpenSky 的匿名实时状态接口足以满足展示需求。真实响应头验证表明 OpenSky 只允许自身站点跨域访问，Cyber-Sight 浏览器不能直接调用，因此需要在 Platform `geo` 模块内增加无存储、无凭据的后端代理。

现行 Geo 插件架构要求常驻资源归属插件 `DisposableScope`，动态场景写入显式调用 `requestRender()`。仿真时间 ADR 要求不得创建第二个 Clock；本功能消费墙钟实时快照，不修改 `viewer.clock`，未来历史回放另行设计。

## 范围

- 在共享契约中定义视域查询、规范化航空器状态和成功/失败响应；
- 在后端 `geo` 模块增加经过认证的 OpenSky 匿名代理、上游超时和响应校验；
- 在前端 Geo 内增加 Flight 插件、开关、状态面板、30 秒轮询、手动刷新、飞机位置和会话短轨迹；
- 关闭功能、离开页面或插件销毁时中止请求并释放定时器、DataSource、Entity 和轨迹缓存；
- 补充后端自动测试及前端人工验收边界。

## 非目标

- 不接入 OpenSky OAuth、账号密钥、历史 Flight/Track 接口或数据库；
- 不提供航班计划、起降机场、延误、登机口或完整商业航线；
- 不持久化、共享或回放轨迹；
- 不让 OpenSky 实时数据改变仿真时间轴；
- 不新增或运行前端自动化、端到端或浏览器测试。

## 前置条件和风险

- Platform 归档审查已完成，`pnpm docs:archive:check:ci` 返回 `NOT_DUE`；
- 匿名额度按来源 IP 计费，视域越大单次消耗越高；实现必须只在用户开启后轮询，并阻止全球级超大视域请求；
- OpenSky 在中国大陆的覆盖和呼号完整性不作保证；空结果是有效结果，业务错误不得被伪装为空列表；
- 前端实体数量和标签必须有上限，避免全球视域拖垮 Cesium。

## 实施任务

- [x] 验证 OpenSky 接口、跨域响应头和匿名额度边界；
- [x] 更新 Geo Design 并新增长期决策 ADR；
- [x] 实现共享契约与后端 Geo OpenSky 代理；
- [x] 实现前端 Flight 插件、开关、轮询和短轨迹渲染；
- [x] 完成后端测试、静态验证和最终 diff 复核；
- [x] 更新最终实现记录，归档计划与 AI 日志并提交。

## 测试与验证

- 后端 Geo OpenSky 服务测试：合法响应规范化、无坐标行过滤、上游失败；
- `pnpm format`、`pnpm format:check`；
- `pnpm lint`、前端 TypeScript 检查与生产构建；
- 后端测试与构建、API 契约构建；
- `pnpm architecture:check`、`pnpm docs:archive:check:ci`、`git diff --check`；
- 维护者人工验收：默认关闭；开启后显示飞机和短轨迹；移动地图后按新视域刷新；关闭后立即清空；限频、断网和空结果状态可理解。

## 发布与回滚

随前后端正常构建发布。若 OpenSky 不可用，功能保持关闭或显示局部错误，不影响 Viewer 和其他插件；可整体回滚本计划关联提交移除代理和 Flight 插件。

## 实际偏差和遗留问题

- 为避免真实 Nest 运行时把 `fetch` 误判为注入依赖，上游请求逻辑提取为可测试纯函数，`GeoService` 保持无构造依赖，并增加模块装配测试；
- 共享查询 Schema 与前端同时限制视域面积不超过 400 平方度，避免绕过界面直接发起全球级匿名查询；
- 前端使用独立 `CustomDataSource`、常量航空器位置和折线短轨迹，不消费或修改 `viewer.clock`；单次最多显示 600 架未落地航空器，每架保留 12 个样本；
- OpenSky 真实中国大陆覆盖、长时间额度消耗、视觉密度、断网后保留上次成功画面以及关闭/离开页面后的浏览器资源释放仍需维护者人工验收；仓库规则禁止新增或运行前端自动化和浏览器测试。

## 实际验证结果

- `pnpm --filter @cyber-ai-forge/api-contract build`：通过；
- `pnpm --filter @cyber-ai-forge/backend build`：通过；
- `pnpm --filter @cyber-ai-forge/backend test -- geo-open-sky.test.ts`：授权环境通过，实际执行后端全量 `18` 个测试文件、`148` 项测试；
- `apps/frontend/node_modules/.bin/vue-tsc.CMD --noEmit -p apps/frontend/tsconfig.json`：通过；
- `pnpm --filter @cyber-ai-forge/frontend build`：授权环境通过，Geo 懒加载 JavaScript 为 `4,319.18 kB`（gzip `1,171.23 kB`），CSS 为 `75.36 kB`（gzip `13.58 kB`）；
- `pnpm lint`、`pnpm architecture:check`、`git diff --check`：通过；
- `pnpm format:check`、`pnpm docs:archive:check:ci`：通过，归档状态为 `NOT_DUE`；
- 前端生产构建仅保留既有 Sass legacy API、第三方 PURE 注释、AdminLayout 动静态导入和 Geo 大 chunk 警告；没有新增阻断错误。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo OpenSky 实时航班数据边界 ADR](../../decisions/ADR-20260831-geo-opensky-live-flight-tracking.md)
- [本次 AI 协作记录](../ai-logs/2026/08/2026-08-31-geo-opensky-live-flights.md)
