---
title: Geo 空间可视化模块 MVP 实施计划
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: active
created: 2026-08-14
updated: 2026-08-14
---

# Geo 空间可视化模块 MVP 实施计划

## 目标

在 Cyber-Sight 中交付首个复杂 Platform 业务模块：一个可授权、可保存、可恢复、可扩展并具备受控
AI 命令入口的 Cesium 三维空间工作区。最终实现必须与 Geo 设计、共享契约、Platform 数据模型、
测试和人工验收边界一致。

## 背景与设计依据

Cyber-Sight 当前只有首页和关于页两个轻量 Platform 模块，Platform API 契约、后端模块和数据库迁移
链均为空扩展入口。Geo 复杂度低于 Market，且维护者拥有成熟的旧项目经验，因此先用 Geo 验证业务
平台纵向扩展方式。

本计划以[Geo 空间可视化模块](../../design/modules/geo.md)和
[Geo 编译期插件与统一命令架构](../../decisions/ADR-20260814-geo-compile-time-plugins-and-commands.md)
为依据。主要作用域是 `platform`；前置授权扩展影响 `foundation`，但必须先在 Cyber AI Forge
上游仓库单独设计和实施，再同步到 Cyber-Sight，本计划不得直接修改下游 `docs/foundation/**` 或
Foundation 源码。

## 范围

- Geo 前端、后端、共享契约、Platform Schema 和 Platform migration；
- Geo 菜单、功能权限和 `geo_scenes` 数据资源贡献；
- 场景、图层、绘制要素、修订控制和事务快照保存；
- 编译期插件注册、Viewer 生命周期、命令目录和首批内置插件；
- 现代化工作区与明确的错误、加载和降级状态；
- 最小 Geo AI 命令提案链路；
- 自动化验证、维护者人工验收清单、设计回写和文档归档。

## 非目标

- Market、Intelligence 或跨业务 AI Foundation；
- 远程插件、插件市场、用户代码执行和第三方插件 ABI；
- PostGIS、地图服务代理、瓦片生产、数据托管和服务器端空间分析；
- 实时协作、多租户、分享审批、移动端专业作业和离线地图；
- 整体合并旧 Geo 仓库或默认发布旧项目示例数据；
- 前端自动化、端到端和浏览器测试。

## 前置条件和风险

### 硬前置条件

- [ ] 在 Cyber AI Forge 创建独立 Foundation 设计和计划，提供 Platform 功能权限与数据资源的通用贡献入口；
- [ ] 在 Forge 完成实现、测试和提交，再按 Cyber-Sight 上游同步协议同步；
- [ ] 验证 Geo 可以登记权限目录、菜单权限和 `geo_scenes` 资源，而无需修改 Foundation 文件或由 Platform migration 写 Foundation 表；
- [ ] 确定首版允许使用的数据服务及许可证，准备开发环境公开令牌；所有秘密仍由后端或环境变量管理；
- [ ] 选择与当前 Vite、Vue、TypeScript、Node 和目标浏览器兼容的稳定 Cesium 版本，并记录安装结果。

在授权贡献入口完成前，可以进行契约、纯前端 Viewer PoC 和数据库设计，但不得把弱化为
`authenticated`、无权限菜单或仓储硬编码所有者规则作为最终实现提交。

### 主要风险

- Cesium 构建资源、Worker 和静态路径配置与 Vite 生产构建不一致；
- 插件销毁不完整导致重复事件、图层或内存占用；
- 外部服务的 CORS、令牌、访问频率和许可证阻断可重复演示；
- 场景 JSON 过大或插件配置版本变化导致保存和恢复不稳定；
- AI 供应商选择过早，把模型 SDK 和提示词细节泄漏到 Geo 领域层；
- 为追求“插件化”预先创建没有真实消费者的扩展点。

## 实施任务

### 阶段 0：Foundation 授权扩展与同步

- [ ] 在 Forge 明确 Platform 授权贡献的公共接口、组合方式、数据库目录同步和超级管理员初始授权策略；
- [ ] 覆盖重复权限键、非法资源、未登记动作、委托边界和 Platform 无贡献时的兼容测试；
- [ ] 完成 Forge 提交后，在干净 Cyber-Sight 工作区按专用同步分支流程合并；
- [ ] 记录上游 SHA、冲突选择和完整验证结果；
- [ ] 在 Cyber-Sight 验证 Foundation 仍不依赖 Platform，Platform 可以贡献 Geo 权限和资源定义。

完成条件：Geo 可以从 Platform 注册三类功能权限和 `geo_scenes` 数据资源，Foundation 源码中不存在
Geo 名称或业务规则。

### 阶段 1：模块骨架、契约与数据库

- [ ] 新建前端、后端和 API 契约的 `platform/modules/geo/`，登记所有公共文件；
- [ ] 在 `platform.contracts.ts`、`PlatformModule` 和 Platform Schema 聚合入口显式装配 Geo；
- [ ] 定义场景、图层、GeoJSON 要素、快照、分页和 AI 命令提案 Zod Schema；
- [ ] 建立 `geo_scenes`、`geo_scene_layers`、`geo_scene_features` Drizzle 表和必要索引；
- [ ] 生成并逐行审查 Platform migration，确认不创建或修改 Foundation 表；
- [ ] 登记 `geo.workspace.read`、`geo.scenes.manage`、`geo.ai.use` 和 `geo_scenes`；
- [ ] 新增 `/geo` 菜单迁移和 `geo-workspace` 视图键，不修改 Foundation 菜单实现。

完成条件：契约包可构建；Schema/migration 测试通过；空库可按 Foundation 后 Platform 顺序迁移；
Geo 模块尚无具体 Cesium 功能也不会破坏应用启动。

### 阶段 2：场景应用服务和 API

- [ ] 实现场景仓储、数据访问谓词和场景列表/count；
- [ ] 实现创建、详情、元数据更新、事务快照保存和软删除；
- [ ] 由服务端写入所有者并以 `expectedRevision` 防止丢失更新；
- [ ] 限制 JSON 深度、字符串长度、图层数、要素数和请求体大小；
- [ ] 为全部 Controller 路由绑定共享契约和显式权限声明；
- [ ] 新增稳定错误码并同步 `docs/reference/error-codes.md`；
- [ ] 测试未认证、缺少功能权限、`self`/`all`、范围外隐藏、修订冲突和事务回滚。

完成条件：不依赖 Cesium UI 即可通过 API 完成安全的场景生命周期，列表、详情和写操作的数据范围
一致。

### 阶段 3：Viewer、工作区和插件内核

- [ ] 安装 Cesium 并完成 Vite 开发/生产 Worker、Widget、Asset 路径配置；
- [ ] 实现非响应式 `GeoViewerAdapter`、幂等创建/销毁和场景切换；
- [ ] 实现 `GeoCommand` 注册、运行时校验、副作用等级和统一执行器；
- [ ] 实现图层适配器、交互工具和插件 manifest 的最小注册机制；
- [ ] 实现场景/图层左栏、中央画布、属性右栏、状态栏和响应式抽屉；
- [ ] 接入 Geo API、未保存状态、加载状态、错误隔离和修订冲突处理；
- [ ] 验证离开路由、重新进入和连续切换场景不会累积 Viewer 资源。

完成条件：可以创建、保存、关闭并恢复空场景；工作区符合 Cyber-Sight 视觉与可访问性边界；插件内核
只有真实扩展点。

### 阶段 4：首批内置插件

- [ ] 实现 XYZ、WMS、GeoJSON 和 Cesium 3D Tiles 图层适配器；
- [ ] 实现图层添加、显隐、透明度、排序、移除、失败重试和状态恢复；
- [ ] 实现绘制、距离测量、面积测量和结果清除工具；
- [ ] 把绘制和测量结果序列化为受限 GeoJSON，并通过场景快照持久化；
- [ ] 对未知插件、旧 `pluginVersion`、无效 URL、CORS 和缺少令牌提供局部错误状态；
- [ ] 只选用授权明确的开发数据，生产默认配置不包含私人令牌和授权不明数据。

完成条件：至少一种影像、一种矢量和一种 3D Tiles 数据可以加载并随场景恢复；绘制与测量可用；
单插件失败不影响其他插件。

### 阶段 5：受控 Geo AI 纵向能力

- [ ] 在核心工作区通过人工验收后定义最小 `GeoModelProvider` 端口；
- [ ] 选择一个后端模型适配器，并通过运行时配置管理提供器、模型和密钥；
- [ ] 实现 `POST /geo/ai/commands:propose`，只返回共享 Schema 接受的命令提案；
- [ ] 实现场景上下文最小化、命令允许列表、权限复核和外部文本隔离；
- [ ] UI 展示命令、参数、影响和确认要求，禁止模型直接执行；
- [ ] 覆盖无效模型输出、超时、权限变化、危险命令和服务不可用；
- [ ] 记录是否出现值得在 Market 阶段提取的通用模型或工具协议，不在本阶段直接上移 Foundation。

完成条件：自然语言可以可靠提出相机、图层和工具命令；非 `view` 命令必须确认；关闭 AI 配置后
Geo 核心功能完全可用。

### 阶段 6：收尾、文档与交付

- [ ] 更新 Geo 设计为最终实现事实，移除未采用接口和占位内容；
- [ ] 更新 ADR 状态并记录偏差、兼容策略和复审条件；
- [ ] 补充 README、运行时配置示例、数据服务说明和维护者人工验收步骤；
- [ ] 完成全部自动化验证和适用的空 PostgreSQL 18 数据库验证；
- [ ] 由维护者完成前端人工验收并记录结果或明确剩余边界；
- [ ] 更新计划和 AI 日志的实际偏差、验证结果、遗留问题与关联提交；
- [ ] 将完成计划和 AI 日志移入对应 Platform archive 并更新索引；
- [ ] 创建带真实 AI 模型 trailer 的提交，并验证提交内容。

## 测试与验证

每个阶段执行与改动相称的局部验证；最终至少执行：

```text
pnpm format
pnpm format:check
pnpm lint
pnpm test
pnpm build
pnpm architecture:check
pnpm docs:archive:check:ci
```

数据库可用时额外执行：

```text
pnpm db:migrate
pnpm test:db
```

前端只执行格式、类型和生产构建，不创建或运行自动化浏览器测试。人工验收项以 Geo 设计中的清单为
准，并明确自动化验证不能替代 Cesium 交互、视觉和长时间资源生命周期验收。

## 发布与回滚

- 按阶段形成可审阅提交，阶段 0 的 Forge 工作和 Cyber-Sight 同步提交与 Geo 业务提交分离；
- Geo 菜单、权限目录、Platform migration、API 和前端页面作为同一可用版本发布；
- AI 通过后端运行时配置独立启用，未配置时隐藏或禁用入口，不影响核心 Geo；
- 外部数据提供器通过配置启用，默认部署不携带维护者私人凭据；
- 发布失败时回滚应用提交并恢复对应数据库备份；已经执行的业务 migration 不通过删除历史文件回滚，
  需要追加修复 migration 或按发布前备份恢复；
- 已保存场景的 `schemaVersion` 和 `pluginVersion` 不得通过前端回滚静默丢弃。

## 实际偏差和遗留问题

当前尚未实施。已确认的前置差距是 Foundation 暂无 Platform 授权贡献入口；该事项必须在 Forge
解决后同步。Cesium 具体版本、公开演示数据提供器和模型提供器在各自阶段开始时依据兼容性、许可和
可用配置确认，不改变本计划的模块边界。

## 相关设计、ADR 和 AI 日志

- [Geo 空间可视化模块](../../design/modules/geo.md)
- [Geo 编译期插件与统一命令架构](../../decisions/ADR-20260814-geo-compile-time-plugins-and-commands.md)
- [Geo 模块设计协作记录](../../ai-logs/2026/08/2026-08-14-geo-platform-design.md)
