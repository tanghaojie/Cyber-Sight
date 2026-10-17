---
title: AIModels 接入后的 Platform 文档复核
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-17
status: completed
change_type: docs
---

# AIModels 接入后的 Platform 文档复核

维护者要求完成两个项目改造并推送。功能提交后新增协议 ADR 触发 Platform 文档门禁，暂存区和工作区均为空，按仓库规则继续复核。

范围：c76aa95..9fc04f1。核对静态发布协议、目录读取、模型分组与坐标 resolver；现行定位设计需要明确新增受信发布入口的例外，普通 URL 行为保持有效。已在定位与渲染设计明确该范围，旧 ADR 保持有效，新 ADR 为目录入口扩展；无需要迁移的失效设计或 ADR，完成计划/日志已归档。现行 AIModels 设计补充真实接入提交、最终 AIModels 远端/CI/Vercel 证据；基线推进到 9fc04f1，Foundation 未修改。归档 CI 恢复 NOT_DUE，最终格式、diff 与本次记录链接检查通过。

前端真实交互、昼夜与视觉继续由维护者人工验收。

- Cyber-Sight 接入：9fc04f1ea95a1346c08eb4a95c2ed277df1e71a4，origin/master 已核对。
- AIModels 最终：e913492a6616addd9c395667462270f7fd871ccf，origin/master 已核对，CI 38998132258 成功，对应 Vercel READY。
- 本记录随 docs(platform): review AIModels integration archives 提交。
