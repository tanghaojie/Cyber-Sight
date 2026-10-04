---
title: Forge PRISM UI 同步与 Platform 归档复核
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-04
status: completed
change_type: chore
---

# Forge PRISM UI 同步与 Platform 归档复核

## 用户目标与约束

用户要求再次同步上游 UI。获取远端后发现新增 5c5e829 和 86bf968。按既有同步授权合并 PRISM，保留 Cyber-Sight 产品事实，不运行前端自动化测试。

## 执行摘要

暂存区和工作区起始干净，安全远端配置正确，建立 sync/forge-2026-10-04。写代码前建立 Platform 接入设计、实施计划及 DUE 归档审查计划。rtk 在环境中不可用，使用现有 Git/pnpm 命令。

## 重要假设与选择

吸收上游共享 UI，同时手工移植适用的 Platform 页面设计；不引入 Forge 宣传图片。保留 Geo 功能和双入口。不复制上游 Platform 归档 ledger。

## 验证、冲突与提交

- `pnpm install --frozen-lockfile` 通过，安装本地 hooks。
- `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm architecture:check`、`git diff --check` 通过。
- `pnpm build` 通过，包含设计令牌包、API 契约、后端与 frontend 的 vue-tsc/Vite；产出 index.html、geo.html 及唯一 cesiumStatic 目录。
- `pnpm test` 通过：10 项同步/归档/提交规范脚本测试、API 契约产物校验、17 文件共 143 项后端测试。
- `pnpm docs:archive:check:ci` 返回 NOT_DUE；Platform 独立审查，Foundation INHERITED，Forge EXCLUDED。
- 保留既有 Sass legacy API、Rollup PURE 注释和 Cesium 大 chunk 警告。不运行前端/浏览器自动化测试；12 个主题组合、CRUD/权限及 Geo 两入口视觉由维护者人工验收。

冲突涉及 README、about 页面、home 文案、Forge 宣传文件、Platform 索引/ledger/退休站设计与锁文件。保留 README、品牌及现有文案；首页/关于页和 Logo 接入 PRISM 样式，通用结构图代替上游摄影。排除 Forge、README.en、Pages 和上游 Platform 文档/ledger。锁文件保留下游 Cesium 与 peer 解析并增加设计令牌 importer；冻结安装通过。Foundation 应用源码除既有 Cyber-Sight 品牌 locales 外与上游一致。Geo、后端、契约与双入口未改动。

Platform 审查从 DUE 经 IN_PROGRESS 到 NOT_DUE，复核 2910f7d..71d1d65 的当前 Geo 和同步事实，无失效 Geo ADR 需要归档；更新本轮品牌/关于页现行设计，ledger 仅推进到已复核 71d1d65。Foundation ledger 原样继承上游。

本地合并提交：`chore(sync): merge Forge PRISM UI 86bf968`，上游第二父为 86bf968，原下游 71d1d65。本轮不向远端推送或部署。

- [实施计划](../../../../plans/2026-10-04-forge-prism-ui-sync.md)
- [接入设计](../../../../../design/prism-ui-integration.md)

## 合并后审查收尾

实际合并提交为 `24f612cc778c781e18ca612a7375b9f02c03b382`，第二父提交为 `86bf9688f9c4d2e3690bf6dcd89897e3b2c71277`。提交后审计首次计入新上游历史，报告 architecture change detected。继续同一审查计划，复核最终树与白名单后，将 Platform ledger 从预合并复核 71d1d65 推进到已完成合并 24f612c。Foundation 台账不变，未调整审计门限。最终 CI 恢复 NOT_DUE；用 `docs(platform): close PRISM sync archive review` 提交收尾，无代码变化。
