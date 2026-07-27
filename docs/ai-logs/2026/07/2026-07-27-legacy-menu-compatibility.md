---
title: 旧菜单数据兼容与导航容错
date: 2026-07-27
status: completed
---

# 旧菜单数据兼容与导航容错

## 用户目标和约束

用户报告左侧菜单未显示、打开菜单管理报错，要求修复现有实现。

## 关键问答与确认

本地真实数据库已包含动态菜单字段。通过 Fastify 注入确认 `/admin/menus/tree` 因旧 `test` 按钮记录不满足新版严格响应 Schema 返回 HTTP 500；`/navigation/menus` 则把该空外链节点下发到前端。

浏览器直接打开 `/menus` 还复现出动态路由安装前的未匹配警告和短暂空白。根路由需要一个受保护的启动兜底记录，待菜单装载后重新解析；兜底仍未被真实路由替换时再进入 404。

用户进一步明确是整个 `AppSidebar` 未显示。检查确认布局把 `sidebarOpen` 初始设为 `false`，只有有效视口达到 1024px 才由 CSS 强制显示；窗口缩放或嵌入式预览低于该断点时会默认移出屏幕。

## AI 的重要假设

旧菜单的真实意图无法从 `type/path` 自动可靠推断，因此不能擅自删除或转换存量记录。菜单管理读取应兼容并展示旧记录，运行时导航应排除不可打开的节点。

## 方案和执行摘要

保留严格 `MenuRequest` 作为新增/编辑边界，把 `MenuSummary` 调整为兼容性读取模型；导航树构造只保留目录、具备站内路径和组件标识的菜单，以及合法 HTTP(S) 外链按钮。前端增加动态 URL 启动兜底路由，菜单装载后重新匹配，未知地址继续跳转独立 404。`AppSidebar` 首次进入默认展开，小屏仍可通过遮罩、关闭按钮或导航动作收起。

## 验证结果

真实数据库 Fastify 注入验证 `/navigation/menus` 与 `/admin/menus/tree` 均返回 HTTP 200；导航响应排除了空外链 `test`，管理树仍返回全部 9 条记录。浏览器验证左侧有效菜单、菜单管理表格及直接打开 `/menus` 均正常，新的直达页面没有 warning/error。布局测试确认 `AppSidebar` 首次渲染 `open=true`。

全仓 `pnpm test` 通过：后端 41 项、前端 24 项、共享契约 TypeScript 检查通过。`pnpm build` 成功。

## 未决问题与下一步

旧 `test` 记录仍是小写编码和空外链，管理员可在恢复后的菜单管理页编辑或删除；系统不会擅自改写用户数据。无其他阻塞问题。

## 相关设计、ADR、计划和提交

- `docs/design/dynamic-navigation-and-branding.md`
- `docs/design/modules/menus.md`
- `docs/decisions/ADR-0010-database-navigation-and-controlled-view-registry.md`
- `docs/plans/archive/2026-07-27-legacy-menu-compatibility.md`
- 提交主题：`fix: restore sidebar and legacy menu loading`
