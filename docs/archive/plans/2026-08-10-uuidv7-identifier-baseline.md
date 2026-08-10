---
title: UUIDv7 单一标识符与空库基线实施计划
status: completed
created: 2026-08-10
updated: 2026-08-10
---

# UUIDv7 单一标识符与空库基线实施计划

## 目标

把全部持久实体从顺序数字 ID 一次性迁移到数据库生成的 UUIDv7，重建只支持 PostgreSQL 18 空库的单一迁移基线，不保留双 ID 或旧数字兼容层。

## 范围

- 共享 API 契约、17 张应用表及其全部实体引用。
- 后端认证、授权、用户、角色、部门、岗位、菜单、字典和接口日志。
- 前端 API、树、选择器、表单、路由与用户本地缓存键。
- Drizzle 迁移、journal、snapshot、种子、数据库检查和现行文档。

## 非目标

- 不提供旧数据库原地升级或线上双写。
- 不迁移旧数据、旧 JWT 或旧浏览器标签页缓存。
- 不用 UUID 替换权限键、资源键、字典值和请求 ID。

## 实施任务

- [x] 建立 UUIDv7 设计、ADR 和协作记录。
- [x] 迁移共享契约与数据库 Schema。
- [x] 迁移后端全部 ID 类型和认证授权语义。
- [x] 迁移前端 ID 类型、根节点与缓存键。
- [x] 重建单一空库迁移基线和种子。
- [x] 更新现行模块设计、部署指南和验证记录。
- [x] 通过全量验证，在空 PostgreSQL 18 数据库完成迁移检查。
- [x] 归档计划和协作记录并提交。

## 验证

- `pnpm test`
- `pnpm build`
- `pnpm lint`
- `pnpm format:check`
- `pnpm docs:archive:check:ci`
- `pnpm db:migrate` 与 `pnpm test:db`，仅使用任务专用空 PostgreSQL 18 数据库。

## 实际验证结果

- `pnpm test`：通过，后端 16 个测试文件、140 个测试全部通过，共享契约构建通过。
- `pnpm build`：通过，共享契约、后端、前端和推广站生产构建全部完成；前端仅保留既有 Sass、Rollup 注释和 chunk 大小警告。
- `pnpm lint`：通过。
- `pnpm exec lint-staged --max-arg-length 4000`：通过；默认 pre-commit 在 Windows 上因一次传递 80 个源码文件触发命令行长度限制，故在提交前以相同任务的小批次模式完成验证。
- `pnpm format`：通过；为保护任务开始前的人类未跟踪文件，执行时通过临时 ignore 清单排除 `.workbuddy/` 和两份文章草稿。
- `pnpm format:check`：排除上述既有人类文件后通过；未排除的全仓命令只报告两份既有文章草稿，不属于本任务且未改写。
- `node scripts/docs/archive-audit.mjs --fail-on-due`：通过，结果为 `NOT_DUE`；该命令与 `pnpm docs:archive:check:ci` 调用同一审计脚本，后者因运行工具的沙箱路径权限未直接取得结果。
- PostgreSQL 18.4 空库：`pnpm db:migrate` 与 `pnpm db:check` 均通过，确认 17 张应用表、UUIDv7 主键默认值、34 个 nullable UUID 审计列、根节点 `null` 和完整种子；任务专用容器已删除。

## 偏差与遗留

- 未提供旧数字数据库、旧 JWT 或旧客户端缓存兼容，符合用户确认的空库切换约束。
- 前端仓库不维护自动化浏览器测试；生产构建已通过，交互行为仍由维护者人工验收。
- 关联提交为本计划归档所在的 UUIDv7 基线提交。

## 回滚

切换失败时必须同时回滚应用版本和数据库连接；新 UUID 数据库保留用于排查。禁止把旧数字数据库连接到 UUID 版本应用，也禁止只回滚前端或后端之一。

## 相关文档

- [UUIDv7 标识符与空库基线](../../design/uuid-identifier-model.md)
- [ADR-0039](../../decisions/ADR-0039-single-uuidv7-identifiers.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-10-uuidv7-identifier-baseline.md)
