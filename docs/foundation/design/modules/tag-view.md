---
title: 前端标签历史模块
status: active
owner: maintainers
updated: 2026-08-10
---

# 前端标签历史模块

## 背景与目标

`tag-view` 为管理端应用壳提供已打开页面的标签导航，并在浏览器刷新后恢复当前账号曾经打开的页面。它让用户能够在历史页面之间切换，并提供关闭当前、关闭其他和关闭全部等基础清理动作。

## 范围与非目标

模块只管理前端页面标签、账号级浏览器持久化和标签控制界面，不拥有 Vue Router、认证会话、后端菜单或页面组件。当前不缓存页面组件实例，不恢复表单草稿、滚动位置、查询参数或 hash，也不在不同浏览器或设备之间同步历史。

## 职责与边界

- `TagView.vue` 是模块公开的标签导航组件，展示历史、当前项和操作入口，并通过事件请求导航或关闭。
- `tag-view.store.ts` 是模块公开的 Pinia Store，拥有历史数据、账号作用域切换、持久化和关闭规则。
- `AdminLayout.vue` 是应用组合点：把当前路由同步给 Store，按 `settings.store.ts` 的公开 `tagsView` 偏好控制导航组件可见性，并把组件事件转换为 Router 导航。关闭可见性不会清除或停止记录历史，因此重新开启后可恢复当前账号的标签。
- 模块不依赖 `auth`、`navigation` 或任何页面模块。账号 ID、当前路径和标题均由应用壳通过公共命令传入。

## 公共接口

`tag-view.store.ts` 暴露 `useTagViewStore()` 和只读数据结构 `TagViewItem`：

- `activate(userId)`：切换到当前账号的持久化作用域并恢复历史。
- `deactivate()`：清理内存中的账号与历史，不删除该账号已持久化的数据。
- `open({ path, title })`：新增页面；同一路径已存在时只更新标题，不创建重复标签。
- `close(path)`：删除指定标签并返回相邻的后备标签。
- `closeOthers(path)`：只保留指定标签。
- `closeAll()`：清空当前账号的标签历史。

`TagView.vue` 接受 `tags` 和 `activePath`，公开 `navigate`、`close`、`close-current`、`close-others`、`close-all` 事件。

## 数据模型与数据流

每个标签只保存 `{ path, title }`。`path` 使用不含 query 和 hash 的规范路由路径，既作为页面唯一键，也作为重新导航目标；这样不会因筛选条件产生重复标签，也不会把可能敏感的查询参数长期写入浏览器存储。

持久化键为带 Platform `storagePrefix`、版本号和 UUID 用户 ID 的 `${platform.storagePrefix}_tag_view_history:v2:<userId>`。Store 激活账号时先通过 `EntityIdSchema` 校验 UUID，再解析并校验 JSON，拒绝非绝对路径、空标题和重复路径；后续每次变更同步写回。浏览器不提供 `localStorage`、JSON 损坏或写入失败时，模块降级为当前会话内存状态。

`AdminLayout` 在账号或当前路由变化时先激活对应账号，再登记当前页面。关闭当前标签后优先导航到其右侧标签，其次左侧标签；没有相邻标签时回到 `/`。关闭全部后回到 `/`，根入口解析器会选择当前用户仍可访问的动态根页面、首个动态页面或无权限页，并把实际落点重新加入历史。

标签持久化结构不因多语言增加字段。应用壳显示标签时优先从当前 Router 的
`meta.localizedTitle` 解析当前语言；没有标签描述或路由已失效时继续使用 Store 保存的
`title`。切换语言会以新标题重新打开当前路径并更新现有记录，不删除历史。

## 依赖关系

```text
AdminLayout + Vue Router + auth.user.id
    -> TagView.vue
    -> tag-view.store.ts
        -> Pinia + Vue + shared/browserStorage
```

依赖保持从应用组合根指向模块公共文件。`tag-view` 不反向读取认证 Store 或 Router，也不跨模块访问导航内部状态。

## 失败模式与安全考虑

- 持久化不可用或数据损坏：忽略无效数据，保留可用的内存交互，不阻断页面导航。
- 菜单权限或路由配置变化：历史标签仍可显示；重新打开不可达路径时交由现有 Router 404 流程处理，用户可关闭陈旧标签。
- 多账号共用浏览器：UUID 用户 ID 隔离存储键；退出只清空内存，不删除该账号下次登录需要恢复的历史。
- 持久化内容不包含 token、用户资料、query 或 hash；页面标题和路径仍属于本地浏览痕迹，清理站点数据即可删除。

## 测试与验证策略

遵循前端验证边界，不创建或运行前端自动化测试。AI 执行格式化、ESLint、TypeScript 检查和生产构建；维护者人工验收：

1. 打开多个静态和动态页面后标签顺序、当前态和点击切换正确。
2. 刷新页面或重新登录同一账号后恢复历史，不同账号互不共享。
3. 单标签关闭、关闭当前、关闭其他和关闭全部的后备导航正确。
4. 窄屏下标签区域可横向滚动，操作入口可用，不破坏侧栏抽屉、Header 和主内容布局。
5. 禁用或损坏 `localStorage` 时页面导航仍可使用。

## 兼容性与迁移

2026-08-10 UUID 基线不迁移数字 ID 使用的 `cyber_ai_forge_tag_view_history:v1:<userId>`、旧 `cyber_tag_view_history:v1:<userId>` 或更早的 `jtlab_tag_view_history:v1:<userId>` 数据；应用从 v2 UUID 键重新记录标签。未来数据结构变化时递增键版本，并明确迁移或丢弃策略。

## 相关 ADR、计划和 AI 日志

- 计划：[实现管理端 tag view](../../archive/plans/2026-07-30-frontend-tag-view.md)
- AI 日志：[实现管理端 tag view](../../archive/ai-logs/2026/07/2026-07-30-frontend-tag-view.md)
- 不新增 ADR；本次仅在既有前端模块边界内增加系统模块，长期行为由本设计记录。
