---
title: Cyber-Sight PRISM UI 接入
scope: platform
repository: Cyber-Sight
status: active
owner: project maintainers
updated: 2026-10-04
---

# Cyber-Sight PRISM UI 接入

## 目标与边界

接入 Forge `86bf9688f9c4d2e3690bf6dcd89897e3b2c71277` 的 PRISM 六主题双模式设计。主要作用域为 Platform；Foundation、公共设计令牌和 Integration 从上游继承，Forge 宣传站不进入下游。

## 接口与数据流

`@cyber-ai-forge/design-tokens` 提供主题元数据与公共 CSS。Foundation settings 保持偏好存储和主题 ID，应用壳、登录和管理组件消费语义色。Platform 的 home/about 保持页面注册接口、现有 API 和 Cyber-Sight 本地化文案，吸收上游布局和样式。PlatformLogo 尊重 tone 与语义色；PlatformArtwork 使用可选品牌图接口的通用结构兜底，不导入 Forge 图片。

## 兼容性

保留 Cyber-Sight README、品牌配置、公开 URL、JWT 和浏览器存储标识、Geo 全部源码及 Sight/Standalone Geo 双入口。Geo 独立深色空间工作台保持现有布局，共享基础样式变更仍需人工验收。无 API、数据库或迁移变化。

## 失败模式与验证

锁文件必须包含 frontend 对设计令牌的 workspace 链接并保持 Cesium 依赖。无品牌图仍可本地显示通用结构；六主题及旧值迁移沿用上游。AI 执行安装、格式、Lint、架构、脚本/后端测试、类型/生产构建与归档 CI；不运行前端或浏览器自动化测试。人工验收覆盖 12 个主题组合、导航、登录、CRUD、权限、首页、关于页及 Geo 两入口。

## 相关依据

- [上游同步](upstream-synchronization.md)
- [PRISM 升级指南](../../foundation/guides/prism-upgrade.md)
- [完成计划](../archive/plans/2026-10-04-forge-prism-ui-sync.md) 与 [协作记录](../archive/ai-logs/chore/2026/10/2026-10-04-forge-prism-ui-sync.md)。

## 验证结果

- `pnpm install --frozen-lockfile` 通过，安装本地 hooks。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 通过。
- `pnpm build` 通过，包含设计令牌包、API 契约、后端与 frontend 的 vue-tsc/Vite；产出 index.html、geo.html 及唯一 cesiumStatic 目录。
- `pnpm test` 通过：10 项同步/归档/提交规范脚本测试、API 契约产物校验、17 文件共 143 项后端测试。
- `pnpm docs:archive:check:ci` 返回 NOT_DUE；Platform 独立审查，Foundation INHERITED，Forge EXCLUDED。
- 保留既有 Sass legacy API、Rollup PURE 注释和 Cesium 大 chunk 警告。不运行前端/浏览器自动化测试；12 个主题组合、CRUD/权限及 Geo 两入口视觉由维护者人工验收。
