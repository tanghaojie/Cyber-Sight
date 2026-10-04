---
title: Forge PRISM UI 同步
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-04
updated: 2026-10-04
---

# Forge PRISM UI 同步

## 目标与范围

从 Cyber-Sight `71d1d65` 合并 Forge `86bf968`，吸收 `5c5e829` PRISM UI 与上游归档收尾。Foundation 与 Integration 按项审查；Platform 页面适配 PRISM 并保留品牌和 Geo；排除 Forge 网站、README.en 和部署工作流。

## 设计依据与风险

依据 [接入设计](../../design/prism-ui-integration.md) 和上游 PRISM 升级指南。暂存区和工作区起始为空，master 跟踪 origin/master，上游 push URL 为 DISABLED。合并保留第二父提交，禁止 squash、rebase 或强推。需保护 Cesium 锁文件、双入口、产品文案及历史 Platform ledger。

## 实施任务

- [x] 审查差异并准备设计、计划、协作记录。
- [x] 以 --no-ff --no-commit 合并并审查冲突。
- [x] 适配 Platform 首页、关于页与品牌样式，确认 Geo 源码不变。
- [x] 完成规定验证，归档计划/日志，创建带真实模型 trailer 的合并提交。

## 验证与人工边界

安装、format、format:check、lint、architecture:check、test、build、docs:archive:check:ci。浏览器、12 个主题组合、CRUD 与 Geo 视觉由维护者人工验收。无数据库变化，不运行数据库迁移。

## 发布与回滚

在 sync/forge-2026-10-04 交付可审阅提交；本轮不向上游推送。回滚须保留 Git 历史并按独立提交处理。

## 实际结果

- `pnpm install --frozen-lockfile` 通过，安装本地 hooks。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 通过。
- `pnpm build` 通过，包含设计令牌包、API 契约、后端与 frontend 的 vue-tsc/Vite；产出 index.html、geo.html 及唯一 cesiumStatic 目录。
- `pnpm test` 通过：10 项同步/归档/提交规范脚本测试、API 契约产物校验、17 文件共 143 项后端测试。
- `pnpm docs:archive:check:ci` 返回 NOT_DUE；Platform 独立审查，Foundation INHERITED，Forge EXCLUDED。
- 保留既有 Sass legacy API、Rollup PURE 注释和 Cesium 大 chunk 警告。不运行前端/浏览器自动化测试；12 个主题组合、CRUD/权限及 Geo 两入口视觉由维护者人工验收。

## 冲突选择与关联提交

README 继续采用下游版本；关于页移植上游布局、原有 about.locales 保留；首页 home.locales 保留下游版本、页面移植 PRISM 布局。删除已退役 Forge 网站、Forge 文档、README.en 及 Pages 工作流的新增/冲突文件。Platform 归档设计与索引保留下游，再登记本次结果。Platform ledger 以本地历史复核后推进；Foundation ledger 继承上游。锁文件保留 supports-color peer 解析与 Cesium，仅增加 frontend workspace 链接和 design-tokens importer；移除已退役网站 importer。AGENTS、后端、API 契约、Geo 源码和双入口配置均无本轮差异。

未移植默认 CYBER 摄影图片，改用 PlatformArtwork 通用结构兜底；未替换 Cyber-Sight 主张文案。无数据库迁移。本计划与协作记录随 `chore(sync): merge Forge PRISM UI 86bf968` 交付，上游 SHA 为 `86bf9688f9c4d2e3690bf6dcd89897e3b2c71277`，原下游为 `71d1d65bec7cfd007bef4130fff556403bdf917d`。

## 相关记录

- [接入设计](../../design/prism-ui-integration.md)
- [Platform 审查计划](2026-10-04-platform-archive-review.md)
- [协作记录](../ai-logs/chore/2026/10/2026-10-04-forge-prism-ui-sync.md)

关联合并提交：`24f612cc778c781e18ca612a7375b9f02c03b382`。提交后上游历史触发架构归档审查，复核最终树后以该合并提交作为 Platform ledger 基线；收尾记录通过独立 docs 提交完成。
