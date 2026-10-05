---
title: 桀士排版配置即时保存与主动文章版本
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-10-05
---

# ADR-20261005-jlab-local-storage-history

维护者明确要求配置与固定结尾修改实时保存到 localStorage，不保留历史；文章 Markdown 在 IndexedDB 默认保存 current，用户主动新增版本才按时间戳保存新版。

采用唯一 localStorage 配置记录和 IndexedDB current/versions 分离。版本只保存正文、标注和正文必要旧素材，不保存排版或固定结尾。恢复只替换 current，继续使用当前配置；不自动增加历史。选择毫秒时间戳，在同毫秒或时钟回退时递增，避免覆盖版本。

旧完整 IndexedDB 草稿兼容迁移，已有 localStorage 配置优先。两种存储没有跨库原子事务；迁移先保证配置写入成功，再替换 current。未知格式/损坏数据暂停对应写入并保留原记录；多页面文章写入使用事务内 writeId 校验，配置通过 storage 事件提示暂停。

此决策替代原有完整草稿将配置、结尾和偏好一并存入 IndexedDB 的存储安排。独立纯前端边界继续遵守[原 ADR](ADR-20261004-jlab-wechat-editor-standalone-app.md)。浏览器清理、权限与配额仍可能丢失或阻止保存；需要云同步或配置历史时重新评审。人工验收和失败流程见[现行存储设计](../design/apps/jlab-wechat-editor-storage.md)。
