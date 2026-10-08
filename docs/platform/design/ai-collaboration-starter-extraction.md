---
title: 独立 AI 协作启动模板来源提取清单
scope: platform
repository: Cyber-Sight
status: accepted
implementation_status: applied_in_coaiforge
owner: project maintainers
updated: 2026-10-07
---

# 独立 AI 协作启动模板来源提取清单

## 基线与使用方式

来源为 Cyber-Sight 提交 `19646b40de73e114bf5447cfc14166af2c84bb47`，确认选择提交为 `68d655d`。本表记录提取处理依据；2026-10-07 已按边界在 CoAIForge 独立实现，目标技术提交 `6ae8374`、首基线提交 `bb67bd9`。保留 MIT LICENSE 和格式配置，协作规范、治理脚本与最小工程按目标改写；没有整仓复制或迁移来源业务。三种 Windows 工程技术验证通过，已推送 master，Windows/Linux CI 全部通过；维护者已确认前端人工验收通过，P1 已完成。

目标原则见[正式设计](ai-collaboration-starter.md)。下列源路径均相对于来源仓库；目标路径属于 CoAIForge 的组合输出。源码事实已通过 CodeGraph 和针对性读取核对，未检查远端 Forge。

## 保留思想、按目标改写的内容

| 来源路径                                                                                                                | 处理           | 目标与核对点                                                                                                                         |
| ----------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `AGENTS.md`                                                                                                             | 提炼           | 保留人类优先、暂存区门禁、严格文档流程、模块边界、验证和提交标记；移除所有权 scope、产品信息与上游同步；通用 HTTP 规范按实际能力适用 |
| `RTK.md`、根 AGENTS 中 CodeGraph 段落                                                                                   | 改为可选       | 有工具/索引时增强，无工具走标准命令；不自动安装或索引                                                                                |
| `docs/README.md`、`docs/foundation/design/documentation-governance.md`                                                  | 改写           | 单项目 docs 入口、按需读取、状态和生命周期；修正旧路径，不携带历史实施结论                                                           |
| `docs/foundation/design/module-boundaries.md`                                                                           | 改写           | `src/modules/<module>/`、显式公共文件、单向依赖、数据所有者，不再按 foundation/platform 分类                                         |
| `docs/foundation/design/testing-strategy.md`、`developer-workflow.md`                                                   | 按需提炼       | 三种工程适用的开发命令、前端人工验收与后端/契约/脚本自动化验证边界                                                                   |
| `docs/templates/design-template.md`、`adr-template.md`、`implementation-plan-template.md`、`ai-session-log-template.md` | 改写           | 目标 docs/templates 单一来源；移除 scope、上游字段，保留状态、日期、分类和必要内容                                                   |
| `scripts/docs/archive-audit.mjs`、`scripts/docs/archive-audit.test.mjs`                                                 | 重构并验证     | 单项目 policy/ledger，取消 forge-sync 导入、所有权分组、inherited 状态和上游操作要求                                                 |
| `docs/foundation/archive/archive-policy.json`                                                                           | 提炼协议       | 即时触发证据和阈值外置；已确认沿用 20/3/3/30 天，目标路径为 docs/archive/archive-policy.json                                         |
| `scripts/architecture/check-ownership.mjs`                                                                              | 改写职责       | 模块目录、公共入口、依赖方向与循环检查，不机械删除旧 scope 字符串后沿用                                                              |
| `scripts/git/commit-message.mjs`、`scripts/git/commit-message.test.mjs`                                                 | 核对后复用     | 提交类型协议及脚本测试；另核对 AI trailer 的校验覆盖，不能假设现有 hook 已验证全部 AGENTS 规则                                       |
| `.github/workflows/verify-commit-convention.yml`                                                                        | 参数化复用     | 新项目提交检查；新增适用工程与文档 CI，保留前端自动化边界                                                                            |
| `.prettierrc.json`、`eslint.config.mjs`、`tsconfig.base.json`                                                           | 裁剪/复用      | 格式单一来源，检查仅作用于已选择的工程，删除未用插件与旧路径                                                                         |
| `package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml`                                                                 | 重建最小依赖图 | 固定经验证的 Node/pnpm 与依赖；不能复制整仓锁文件或 forge workspace 匹配项                                                           |

## 启动工程与 health 的提取边界

| 来源路径                                                                                                                                             | 处理                                                                                | 适用结果   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------- |
| `apps/frontend/package.json`、`apps/frontend/vite.config.mts`、`apps/frontend/tsconfig.json`                                                         | 仅参考启动和构建；删除 Cesium、多入口、SVG 自动注册、主题与管理功能依赖             | 前端、全栈 |
| `apps/backend/package.json`、`apps/backend/tsconfig.json`、`apps/backend/src/server.ts`、`apps/backend/src/app.ts`、`apps/backend/src/app.module.ts` | 提取最小 Nest/Fastify 生命周期；不复制完整应用组装和 runtime/database 注入          | 后端、全栈 |
| `apps/backend/src/foundation/modules/health/`                                                                                                        | 移至目标 src/modules/health；保留进程存活语义，去掉 Public 对授权模块的依赖         | 仅全栈     |
| `packages/api-contract/src/foundation/modules/health/health.schema.ts`、`packages/api-contract/src/foundation/http/http.ts`                          | 提取 health 所需最小 Schema/响应封装，类型由 Schema 推导                            | 仅全栈     |
| `packages/api-contract/package.json`、`packages/api-contract/scripts/verify-dist.mjs`                                                                | 参考实际构建入口校验；新包名和导出显式登记，不导出旧业务契约                        | 仅全栈     |
| `apps/frontend/src/foundation/modules/health/composables/useHealth.ts`                                                                               | 只参考状态和请求失败处理；重写最小展示，解除 API 客户端、本地化、管理侧栏和轮询依赖 | 仅全栈     |
| `apps/backend/test/foundation/health.test.ts`                                                                                                        | 提取 health 与契约断言，去掉完整应用/鉴权/数据库测试依赖                            | 仅全栈     |

单选后端不附带 health；“空启动”不自动附送 Hello World API。单选前端不引用契约包，也不为将来业务预装路由、Pinia 或 Element Plus。全栈后端接口只表达进程存活，数据库就绪检查不在本例范围。

## 不进入目标模板的内容

- `scripts/forge-sync.mjs`、`scripts/forge-sync.test.mjs`、`.forge-sync.yml`、当前 `.archive-audit.json` 所有权配置和 Git upstream 安全配置。
- `docs/foundation/design/foundation-platform-ownership.md` 中上游/下游机制，以及产品品牌、部署、业务设计、历史计划、历史 AI 日志和来源归档台账。
- `apps/frontend/src/platform/`、`apps/backend/src/platform/` 的业务内容；业务能力留在后续独立迁移阶段。
- 现有认证/授权/管理模块、数据库与迁移、完整应用壳、PRISM/design-tokens、Cesium 及无实际用途的依赖。
- `.git`、`.codegraph`、个人 AI 会话/配置、实际环境变量文件、构建产物和本机路径。

此处“不进入”只约束目标模板生成内容，不授权从 Cyber-Sight 删除任何文件。现行规范可提炼为目标项目的治理文档，但不能把只读来源改造成新模板实现位置。

## 来源、许可和参数化

来源根 LICENSE 为 MIT，版权声明为 2026 JTLab。CoAIForge 已确认采用 MIT；复制实质性源码/文档时保留适用版权与许可说明，本次不重授权第三方材料。npm 包发布信息留待后续阶段。P1 逐项核对实际纳入依赖/资源的许可，避免把品牌图片和第三方示例素材当作通用资源。

项目名、包作用域、仓库地址及 README 元信息应参数化；不得删除必要来源署名来实现“去品牌”。模板不携带运行密钥或默认生产账号。

## P1 必须补齐的证据

- 三种输出文件/依赖/脚本清单，缺选应用不存在且无人为占位依赖。
- 模块公共文件与合法依赖清单，health 全链路契约和实际产物导入验证。
- 单项目审计在正常、DUE、IN_PROGRESS、BLOCKED、无 Git、无初始提交和首基线建立时的测试记录。
- 来源路径变更对照、目标无旧 scope/上游协议和产品业务残留检查；许可和来源说明不作为错误残留移除。
- Windows/Linux 上适用技术检查及前端人工验收状态；未经执行不得写成通过。

关联：[P1 实施计划](../archive/plans/2026-10-07-ai-collaboration-starter-p1.md)。

## 2026-10-08 拆分后的记录边界

按维护者明确授权，本文件已移除独立产品内容，仅保留仓库集成或通用模板证据；原始完整记录仍由 Git 历史追溯。
