---
title: 桀士排版独立迁移来源交接计划
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: pending_human_acceptance
created: 2026-10-08
updated: 2026-10-08
---

# 桀士排版独立迁移来源交接计划

## 目标与当前状态

维护者已创建 `C:/Users/thj_3/Desktop/JLabWeChatEditor` 与 CoAIForge 0.2.0 frontend 模板，并授权完成迁移及 Cyber-Sight 相关设计、决策移植。目标技术交付已完成，完整保留功能和界面，首次原稿为空、默认配色与排版保留，不迁移旧浏览器数据。

目标 `docs/plans/active/2026-10-08-jlab-independent-migration.md` 是技术任务、偏差和人工验收的单一记录。本计划只记录来源交接与证据，避免两仓库重复更新技术清单；状态保持 pending_human_acceptance，待目标人工验收后完成来源交接归档。

## 已完成交接

- [x] 两仓库暂存区与工作区初始为空，确认目标目录、master、origin 和维护者生成的模板提交。
- [x] 核对 CLI/template 0.2.0、frontend 预设、许可证和真实模板快照；以目标独立工程安装依赖。
- [x] 六模块、应用入口、配置、按需 Element Plus 注册与样式迁入目标；首次原稿为空，保留持久化协议。
- [x] 核对业务依赖兼容性，严格 peer 冻结安装通过；目标使用独立端口 5175/4175 和相对 base。
- [x] 产品、UI、存储、迁移、六模块设计和三份适用 ADR 已迁移并适配为单项目文档；原始设计与调研作为明确标注的 reference 保留。
- [x] 格式、Lint、类型、生产构建、模块、文档与提交检查通过；21 项治理测试通过，根路径/子路径静态资源检查通过。
- [x] 目标形成真实技术提交及归档台账，目标归档 CI 为 NOT_DUE；目标计划与功能实施日志保留 pending_human_acceptance。
- [x] 来源迁移设计、活动计划与目录索引更新为实际技术交付状态，源应用、源数据与现行产品设计保留。

## 实际来源与提交

| 项目               | 实际值                                               |
| ------------------ | ---------------------------------------------------- |
| 来源提取基线       | `2e48a6c8b37a60c9bda704d6c3fefa4ce4fd7ef4`           |
| 目标维护者初始提交 | `b86bf90444a12ae7560eecc2ae03f7b65a6b3ff0`           |
| 模板快照           | `d07a9fcac33cbc1d40e57ab2c9de46cfaa8c80f9`           |
| 目标迁移技术提交   | `e8332edf5885c91a9b8546c60cc47cd2c4b7298b`           |
| 目标台账提交       | `04397afc33377dfb5b3f1752cab4a3b55f8914da`           |
| 目标归档审查基线   | `e8332edf5885c91a9b8546c60cc47cd2c4b7298b`           |
| 目标 origin        | `https://github.com/tanghaojie/JLabWeChatEditor.git` |

以上迁移技术与台账提交在本地生成，未推送；没有执行远端 CI 或正式部署。目标细节见 `docs/reference/migration-provenance.md` 和 `docs/reference/migration-validation.md`。

## 验证边界与遗留

Windows Node 24.19.0、pnpm 11.22.0 下适用技术检查通过。六模块 25 个文件核对仅有两项预定变化：空原稿初始化和等价的空格字符引用。静态 HTML 及相对资源在 `/` 与 `/jlab/` 访问通过，未执行浏览器功能自动化。

Lint 零错误、222 条警告，生产 JS 为 524.41 kB（gzip 188.37 kB），CSS 为 96.70 kB，Vite 超过 500 kB 的体积警告保留。上述检查不代替桌面交互、浏览器数据和公众号效果验收。

- [ ] 维护者按目标计划确认桌面尺寸、缩放、编辑、抽屉、标注、排版与阅读外壳。
- [ ] 维护者确认首次空数据、刷新恢复、主动历史、并发与保存失败规则及剪贴板操作。
- [ ] 维护者确认真实公众号粘贴、保存重开和微信明暗阅读效果，记录环境及差异。
- [ ] 目标验收完成并归档后，补充来源交接结果并归档本计划。

## 发布与回滚

本阶段交付独立应用、静态 dist 和部署说明，域名与平台待定。正式发布、推送、源应用删除或访问切换需要另行明确授权。保留源应用供回退；源/目标新写数据彼此独立，本阶段没有自动合并或回写能力，不清除源 origin 存储。

## 关联

- [迁移设计](../../design/apps/jlab-wechat-editor-migration.md)
- [迁移决策](../../decisions/ADR-20261008-jlab-independent-repository.md)
- [源模块边界](../../design/modules/wechat-editor.md)
- [目标仓库](https://github.com/tanghaojie/JLabWeChatEditor)
