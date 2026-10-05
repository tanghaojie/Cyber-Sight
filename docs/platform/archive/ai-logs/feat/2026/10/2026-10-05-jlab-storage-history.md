---
title: 桀士排版数据存储与文章版本协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
change_type: feat
status: completed
date: 2026-10-05
---

# 协作记录

用户要求详细实现数据存储和历史数据，确认配置/固定结尾实时覆盖 localStorage，无历史；文章 IndexedDB 默认 current，主动新增版本按时间戳保存。

方案：配置与文章分离，历史只保留文章/标注/必要素材；兼容旧完整草稿，无自动历史。恢复继续使用当前配置，事务检查并发写入。工作区原有 index.html 修改不触碰；不运行前端自动化或浏览器测试。

初始暂存门禁通过，归档审计 NOT_DUE；现行代码已核对，历史记忆仅用于定位设计，未作为实现事实。维护者随后确认 index.html 标题由本人修改，并授权一并提交；AI 保留标题文字。

实现：localStorage 配置同步覆盖与失败重试；IndexedDB 数据库版本 2、格式 2 current、主动时间戳 versions；新增与 current 同事务，历史只保存正文所需素材。旧格式先确保配置迁移，再替换 current；已有配置优先。恢复继续使用当前配置及其结尾必要旧图片，不创建历史。保存/恢复/删除串行，writeId 校验并发；历史读取错误独立显示。配置修改不写 current。

验证：typecheck、26 文件/80 导入模块边界、生产构建、workspace ESLint、根 pnpm format、diff 空白检查、最终 format:check、13 份变更 Markdown 相对链接检查和归档 CI 检查通过，Platform 为 NOT_DUE。VueUse PURE 注释提示仅影响构建注释清理，无构建失败。无自动化/浏览器测试，功能人工验收待维护者执行，清单写入应用 README。

未决边界：localStorage 与 IndexedDB 无跨库原子事务；关页补保存为尽力操作，浏览器清理和配额不保证持久化。工作范围仅 Platform 独立编辑器，未触及其他应用或 Foundation。

关联：[设计](../../../../../design/apps/jlab-wechat-editor-storage.md)、[ADR](../../../../../decisions/ADR-20261005-jlab-local-storage-history.md)、[计划](../../../../plans/2026-10-05-jlab-storage-history.md)。交付提交是本记录所在的 `feat(wechat-editor): persist settings and manage article versions`，实际 SHA 通过本文件 Git 历史与最终回复关联。
