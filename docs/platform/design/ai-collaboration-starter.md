---
title: 独立 AI 协作启动模板
scope: platform
repository: Cyber-Sight
status: accepted
implementation_status: completed_in_coaiforge
owner: project maintainers
updated: 2026-10-07
---

# 独立 AI 协作启动模板

## 定位与状态

维护者已确认目标：提炼 Cyber-Sight 的人与 AI 协作经验，形成独立项目模板。核心交付是 AGENTS.md、现行设计和文档治理体系；代码只提供最小启动环境。P0 交付设计与清单，P1 制作可运行模板，后续阶段才实现并发布 CLI，最后迁移 Geo 和桀士排版。

本文是已接受的目标设计。2026-10-07 已在 CoAIForge 完成 P1 技术实现与三种工程的 Windows 独立验证，目标提交为 `6ae8374`、`bb67bd9`；经维护者授权已推送 master，[Windows/Linux CI](https://github.com/tanghaojie/CoAIForge/actions/runs/37642662208) 的 7 个任务全部通过，维护者已明确确认前端人工验收通过，P1 已完成。文件位于来源仓库，按当前规则声明 `scope: platform`；新模板自身的代码、文档、审计配置均不采用 Forge/Foundation/Platform scope，不继承上游只读身份，也不使用 Forge 合并同步协议。该决定不修改 Cyber-Sight 现行架构或治理。

## CoAIForge 仓库与模板源组织

维护者已创建独立仓库 CoAIForge，本地位置为 `C:/Users/JackieTang/Desktop/CoAIForge`，远端为 `https://github.com/tanghaojie/CoAIForge.git`。2026-10-07 只读核验时工作区仅有 .git，master 尚无初始提交；这是核验快照，不代表已经实施 P1。目标仓库采用 MIT，保留适用来源版权和第三方许可。

模板源码采用公共基础 + 前端/后端片段 + 全栈 health 补充的组合方式。公共基础单一维护 AGENTS.md、docs 规范和公共治理脚本；前端、后端片段各自提供空启动工程；全栈额外组合契约和 health 调用示例。组合过程需处理 manifest、脚本及文档索引，不能只按文件覆盖而保留缺选应用依赖。具体目录名称由 P1 实现设计登记，不改变已确认的组合模式。

## 生成结果与非目标

用户安装 CLI 后交互选择前端、后端或全选；三种结果均使用 pnpm workspace。CLI 本身的安装方式不改变生成项目的包管理器。

| 选择 | 应用与依赖                                     | 示例与运行边界                                         |
| ---- | ---------------------------------------------- | ------------------------------------------------------ |
| 前端 | Vue 3、Vite、TypeScript；仅 apps/frontend      | 最小启动页面，无业务模块、后端请求或契约包             |
| 后端 | NestJS、Fastify、TypeScript；仅 apps/backend   | 可启动和关闭的空应用，无示例业务路由、health 或契约包  |
| 全选 | 两个应用及 packages/api-contract，契约使用 Zod | 唯一示例为 health：后端接口、共享 Schema、前端状态展示 |

不预置认证、授权、用户、角色、部门、岗位、菜单、字典、数据库、迁移、缓存、管理布局、UI 组件库、状态管理或业务路由框架。不因现有项目使用某个依赖就将其带入模板。后续项目可按明确需求自行增加模块。

本阶段不创建 Geo SDK，不迁移应用，不建设模板自动升级工具，不确定 npm 包名或发布方式。框架大版本升级与功能扩充不混入本次提取。

## 目录与模块边界

以下展示全栈结果；单选时删除未选应用和契约包，不生成不存在能力的占位目录。

```text
project/
├─ AGENTS.md
├─ apps/
│  ├─ frontend/src/
│  │  ├─ main.ts
│  │  ├─ App.vue
│  │  └─ modules/health/
│  └─ backend/src/
│     ├─ server.ts
│     ├─ app.module.ts
│     └─ modules/health/
├─ packages/api-contract/src/modules/health/
├─ docs/
│  ├─ README.md
│  ├─ design/modules/
│  ├─ decisions/
│  ├─ plans/active/
│  ├─ ai-logs/<change-type>/YYYY/MM/
│  ├─ guides/
│  ├─ reference/
│  ├─ templates/
│  └─ archive/
│     ├─ README.md
│     ├─ archive-policy.json
│     ├─ archive-ledger.json
│     ├─ design/
│     ├─ decisions/
│     ├─ plans/
│     └─ ai-logs/
├─ scripts/
├─ .github/workflows/
├─ package.json
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
└─ tsconfig.base.json
```

树中的能力目录表示目标位置，空目录不必预建。前后端和契约使用相同模块名；每个模块在 `docs/design/modules/` 登记职责、非目标、公共接口、依赖、数据流、失败模式和验证边界。组装入口只注册能力。跨模块依赖只使用登记的公共文件，禁止访问私有状态、循环依赖和无差别 barrel；包发布入口等必要例外必须登记。

移除所有权 scope 后仍保留模块边界，不能将业务重新散落到根 views/services/stores 中。没有业务的单选工程不凭空创建模块。

## health 契约和调用边界

全栈沿用来源 health 的进程存活语义与响应形状：`GET /health` 返回 `{ status: 0, data: { status: 'ok', timestamp: '<ISO datetime>' } }`。它不承诺数据库或外部服务已就绪，无请求参数、鉴权、数据库或持久化。

数据流：前端 health 公共 API → 后端 health Controller → 共享 Zod 响应 Schema → 前端响应校验与状态展示。Schema 是唯一结构来源，类型由 `z.infer` 推导；生产构建必须能够导入契约包实际产物。前端只表达加载、成功和失败，不复用当前管理侧栏、轮询、本地化或登录拦截器。超时、不可达或不符合 Schema 的响应不得显示为健康成功。

后端 health 的公共模块入口、Controller 及契约 Schema 文件在 P1 模块设计中登记；移除现有 `Public` 装饰器的授权模块依赖。保留 API 契约优先和运行时校验规范；输入校验、分页、错误码等通用约定按未来实际接口适用，不为 health 增加演示接口或未用基础设施。现有 Swagger/ContractRoute 等实现是否需要裁剪由 P1 依赖核对确定，不得因此引入管理功能。

## AGENTS.md 与 docs 的共同协议

| 规则         | 目标行为                                                                                     |
| ------------ | -------------------------------------------------------------------------------------------- |
| 人类内容优先 | 当前人类指令与确认内容优先；开始时既有未提交改动视为人类内容，无法隔离时停止询问             |
| 暂存区硬门禁 | 首次修改前执行 git diff --cached --quiet；已有暂存内容时停止，请维护者先提交，不代为处理     |
| 最小阅读     | 先读 docs/README.md 和活动计划，再按索引选择现行设计/ADR；归档默认不读                       |
| 非简单改动   | 实施前准备设计、计划、AI 日志；长期决策进入 ADR；小型机械改动沿用现有豁免边界                |
| 文档事实边界 | 设计描述现状或明确标注待实施目标；日志不代替正式设计，不将静态检查写成功能验收               |
| 任务收尾     | 更新设计及实际验证、偏差和未决事项；完成计划与日志标记 completed 并归档，更新索引            |
| 提交         | 适用验证通过后默认自动提交，用户明确暂不提交时除外；失败或归属不明时不勉强提交               |
| AI 标记      | 提交末尾保留真实模型名称 trailer；模型不明确则停止提交；提交后读取日志核验                   |
| 辅助工具     | RTK 安装时可用；已有 CodeGraph 索引且工具可用时优先定位；缺失时标准命令回退，不自动安装/索引 |

提交标题继续使用 `<type>(<scope>)?!: <summary>`。这里的可选 `scope` 是 Git 提交主题标签，例如 docs 或 health，不是被移除的目录所有权 scope。允许类型和 AI 日志分类沿用 chore、docs、feat、fix、refactor、style、test、ci、build、revert。

保留 `Co-Authored-By: -AI- [实际模型名称] <ai@scaffold-proj.com>` 协议；方括号是文档说明占位，不得原样提交，亦不硬编码模板作者的模型身份。

目标文档 frontmatter 不含 `scope`、`review_scopes`、`downstreamAction` 或上游身份。保留适用的 title、status、owner、日期；AI 日志保留 change_type；归档审查计划保留 type。docs/templates 单一维护设计、ADR、计划和协作记录模板。当前设计、有效 ADR、活动工作和历史证据分开管理。

通用 AGENTS.md 保留强制规则与阅读入口，详细规范链接到唯一现行来源。每种工程只携带与实际能力匹配的设计；前端单选不声称已存在后端契约，后端单选不声称已有 health。来源项目的历史计划、AI 日志、验收记录、产品 ADR 和 ledger 不作为新项目历史复制。

## 单项目归档审计

保留任务前审计、条件触发复核和最终 CI 门禁；只读问答等豁免遵循当前规则。策略位于 `docs/archive/archive-policy.json`，台账位于同目录的 archive-ledger.json。移除 repositoryRole、managed/inherited/excluded scopes、integrationOwner、路径所有权分类，以及对 `.forge-sync.yml` 和 forge-sync 的依赖。

审计保留有效提交、已接受 ADR、已完成计划、距上次复核时间与即时触发证据。维护者确认默认阈值沿用 20 个有效提交、3 个新接受 ADR、3 个完成计划、30 天，并保留架构变化、文档冲突和 ADR 被替代等即时触发；后续通过策略配置调整。输出针对整个项目，区分 NOT_DUE、DUE、IN_PROGRESS、BLOCKED；IN_PROGRESS 不得让最终 CI 默认为通过。

维护者确认 CLI 默认只初始化 Git，不自动创建首个提交。首个真实提交后，由显式操作登记审计基线，台账变更再按项目提交规则保存。该选择只约束 CLI 创建项目的动作，不取消 AI 开发完成并通过适用验证后的默认提交规则。

新项目没有来源仓库的 Git 历史。不能复制来源 SHA、用未来提交或 HEAD 字面量冒充复核基线。P1 必须覆盖未初始化 Git、无首个提交、首次真实基线登记和正常复核的生命周期；未建基线时输出明确诊断，不能谎报 NOT_DUE。实施设计需要区分首提交前的结构验证与有基线后的正常审计，避免“必须先通过有基线审计才能创建首提交”的循环前置条件。具体命令在 P1 定义并验证；本轮不实现初始化脚本或创建目标首提交。

## 验证与失败模式

三种结果分别执行依赖安装、适用的格式/Lint/类型检查与生产构建。后端、契约和治理脚本执行适用的自动化测试；前端不创建或运行单元、组件、E2E 或浏览器自动化测试，除非维护者明确要求。前端状态展示与交互由人类验收，记录未验收项，不将构建成功当成功能通过。

| 风险                                        | 实施要求                                                           |
| ------------------------------------------- | ------------------------------------------------------------------ |
| 清空业务后仍引用 auth、数据库、主题或原仓库 | 按提取清单核对依赖与产物，并在脱离来源目录的工程中验证             |
| 模块检查器只会识别旧所有权路径              | 重写为模块公共边界检查，脚本测试覆盖跨模块私有导入和循环等失败场景 |
| 单选工程仍运行不存在 workspace 的命令       | 分别验证三套脚本和依赖图，不能用全栈成功代替单选成功               |
| 工具缺失导致规则无法执行                    | RTK/CodeGraph 回退路径、无索引和未安装场景有明确指引               |
| 复制旧历史、身份或验收结论                  | 新项目从自己的真实基线起步，只带适用的现行规范                     |
| 模板间规范漂移                              | P1 确定规范单一来源和组合清单；公共标准不能维护成三份独立副本      |

P1 在 CoAIForge 固定并验证 Node 24.18.0、pnpm 11.13.1，以及 Vue 3/Vite 5/Nest 11/Fastify 5/TypeScript 5/Zod 4 的精确依赖和三套锁文件。契约同源生成 ESM/CommonJS 产物，前端生产构建与后端实际导入均通过。三种工程的适用检查分别在 Windows 本地与 Windows/Linux CI 通过，维护者已明确确认前端人工验收通过。CoAIForge 仓库、组合模式、阈值、Git 初始化策略和 MIT 已确认。CLI 安装命令、npm 包名、发布渠道和更新机制不在本轮决定。

## 关联与交付边界

- [提取清单](ai-collaboration-starter-extraction.md)
- [长期决策](../decisions/ADR-20261007-independent-ai-collaboration-starter.md)
- [P1 实施计划](../archive/plans/2026-10-07-ai-collaboration-starter-p1.md)

P0 的交付仍为文档；P1 技术实现及实际证据由 [CoAIForge](https://github.com/tanghaojie/CoAIForge) 独立维护，提交 `6ae8374`、`bb67bd9` 已推送 master，Windows/Linux CI 全部通过。P1 接续记录已完成归档，不在 Cyber-Sight 重复执行模板代码。P0 及本次来源同步从 Platform 归档索引追溯。
