---
title: 岗位管理功能实施
type: implementation
status: completed
created: 2026-08-07
updated: 2026-08-07
---

# 目标

按照 `docs/design/modules/positions.md` 实施岗位管理模块，并落实岗位与部门、用户的关联规则。岗位不设置岗位编码。

# 范围

- 新增 `positions` 模块的共享 API 契约、数据库表与迁移。
- 新增岗位 CRUD、岗位选项和用户岗位替换能力。
- 在用户维护流程中接入岗位校验与事务性关联更新。
- 新增岗位管理页面、路由注册、菜单/权限种子和用户岗位选择交互。
- 完成格式、类型、构建和后端相关验证；前端行为保留人工验收边界。
- 实施完成后更新设计文档、数据库设计、AI 记录和归档索引，并提交变更。

# 约束与验收

- 遵守 `src/modules/system/<module>` 模块边界；跨模块仅依赖已登记公共文件。
- `sys_positions` 按部门唯一，`sys_user_positions` 保存用户岗位关联，不重复存储部门 ID。
- 组织关系失效、岗位停用和软删除必须按设计规则处理。
- 业务响应与错误码沿用现有契约，不新增岗位编码字段或新错误码。

# 风险与待确认项

- 前端自动化测试不在仓库约定范围内，需在交付时明确人工验收项。
- `pnpm docs:archive:check` 的默认 Node 运行环境因 `EPERM: lstat C:\Users\thj_3` 失败；已使用工作区 Node 复核，结果为 `NOT_DUE`。

# 实施结果

- 已完成契约、数据库 Schema、追加迁移、后端岗位模块和前端岗位管理页面。
- 已在用户创建/编辑/删除事务接入岗位关系校验、替换和失效；部门选项接口允许 `positions.manage` 读取。
- 已增加 Schema 与迁移静态断言；共享契约 TypeScript 检查和工作区缓存 Prettier 检查通过。
- 标准 pnpm 格式、构建和测试受默认 Node 路径权限、缺失工作区依赖链接及 npm registry EACCES 阻塞；前端行为仍需人工验收。
