---
title: 接口日志前端与运维导航
status: completed
created: 2026-08-05
updated: 2026-08-05
---

# 接口日志前端与运维导航

## 目标

提供受 `api_logs.read` 权限保护的只读接口日志查询工作台，并通过数据库迁移自动提供“运维监控”
目录及接口日志菜单。

## 背景与设计依据

后端已完成日志采集、保留期和 `GET /admin/api-logs` 脱敏查询。前端仅消费共享契约公开字段，
不新增统计、自动轮询或敏感数据展示。菜单和权限遵循 `docs/design/modules/menus.md` 与
`docs/design/modules/api-logs.md`。

## 范围

- 新增前端 `system/api-logs` 模块、双语文案、页面注册、分页筛选表格和详情抽屉。
- 追加迁移，创建“运维监控”目录与其下的接口日志菜单，并向超级管理员写入兼容菜单关联。
- 更新 API 日志、菜单和前端模块设计，以及迁移测试。

## 非目标

- 不新增聚合统计、日志导出、删除、编辑、全文或模糊检索。
- 不保存、展示或传输请求体、响应体、IP、Cookie、Token、User-Agent 或查询参数。

## 前置条件和风险

- 后端筛选均为精确匹配，前端必须清晰表达该限制。
- 日志查询本身会被审计，页面不得自动轮询。
- 数据库迁移只能追加，不能修改既有 `0001` 日志表与权限迁移。

## 实施任务

- [x] 创建并注册接口日志前端模块。
- [x] 追加运维监控菜单和超级管理员数据迁移，扩展迁移测试。
- [x] 执行格式、TypeScript、构建和后端测试验证。
- [x] 更新实际结果并归档计划与协作记录。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `npx vue-tsc --noEmit`
- `pnpm build`
- `pnpm --filter @scaffold/backend test`
- 维护者人工验收筛选、详情、动态菜单权限和窄屏布局。

## 发布与回滚

先执行追加迁移，再部署包含已注册页面的前端。回滚时停用或删除菜单记录；已追加的审计表和日志
记录保持不变，不回滚历史数据。

## 实际偏差和遗留问题

无实现偏差。额外补充默认菜单指纹与双语导航资源，使迁移创建的框架菜单在英文界面中也能
本地化；同时为权限目录补充 `api_logs.read` 的本地化名称。

## 相关设计、ADR 和 AI 日志

- `docs/design/modules/api-logs.md`
- `docs/design/modules/menus.md`
- `docs/archive/ai-logs/2026/08/2026-08-05-api-logs-frontend.md`

## 完成结果

- 新增 `system/api-logs` 前端模块，提供精确筛选、分页、响应式表格与请求 ID 可复制的详情抽屉。
- 追加 `0002_api_log_operations_menu`，自动创建 `/ops` 下的“运维监控 / 接口日志”菜单，绑定
  `api_logs.read`，并为超级管理员写入功能权限和兼容菜单关联。
- 通过 `pnpm format`、`pnpm lint`、`npx vue-tsc --noEmit`、
  `pnpm --filter @scaffold/backend test`（110 项）和 `pnpm build`。构建仅保留项目既有的 Sass
  legacy API、Rollup PURE 注释及静态/动态导入提示。
