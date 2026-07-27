---
title: JTLab 品牌、主题与数据库动态导航
status: active
owner: maintainers
updated: 2026-07-27
---

# JTLab 品牌、主题与数据库动态导航

## 背景与目标

管理端从临时品牌 NOVA 演进为“桀士实验室”的 JTLab。品牌名应由前端配置读取，视觉统一采用以 `#70CFA2` 为主色的精密实验室风格。导航、路由和页面组件不再由前端重复写死，而由当前用户可访问的数据库菜单树驱动。

## 范围与非目标

本设计包括品牌配置、全局主题令牌、数据库菜单树、受控动态页面加载、树形侧栏、四个基础资料前端模块拆分，以及 HTTP 401/404/500 的应用级处理。

本轮不实现任意远程组件、运行时上传 Vue 文件、按钮级接口鉴权、组织/租户或可视化页面搭建器。数据库只能选择前端构建时已经注册的页面组件。

## 职责与边界

- `src/config/app.config.ts` 提供品牌名、品牌缩写、产品说明和主色等可修改配置；页面不得散落硬编码品牌名。
- `menus` 模块拥有菜单 CRUD、当前用户导航树、树构造规则以及菜单数据契约。
- 前端 `navigation` 模块获取导航树并维护加载状态；应用路由组合根根据树中 `menu` 节点动态注册子路由。
- `src/router/view-registry.ts` 是数据库组件标识到模块公开懒加载器的唯一受控映射。
- `AppSidebar` 只渲染传入的树：`directory` 展开/折叠，`menu` 使用站内路由，`button` 使用新窗口外链。
- 用户、角色、菜单和字典页面分别由 `users`、`roles`、`menus`、`dictionaries` 模块拥有，不再复用配置驱动的业务 `ResourceView.vue`。
- 共享 API Client 识别 HTTP 401/404/500，并调用应用在启动时注册的处理器；不再广播 DOM 事件。

## 公共接口

- `GET /navigation/menus`：返回当前登录用户可访问的启用菜单树，响应为 `{ status: 0, data: MenuTreeNode[] }`。
- 菜单记录新增 `component` 和 `externalUrl`：目录无需页面组件；菜单必须配置站内 `path` 与已注册 `component`；按钮必须配置 `http/https` 外链。
- 各前端业务模块的 `index.ts` 公开页面懒加载器和本模块所需的稳定 API，不公开页面内部状态。
- `installGlobalHttpErrorHandler()` 在应用启动时注入清会话、路由跳转和消息提示行为。

## 数据模型与数据流

登录用户进入受保护路由时，路由守卫先恢复会话，再请求 `/navigation/menus`。后端按用户角色与 `role_menus` 过滤启用、未删除菜单，并补齐被授权节点的祖先目录，按 `sortOrder` 和 `id` 构造树。前端保存树并为其中有效 `menu` 节点注册路由；页面组件通过 `component` 在受控注册表中解析并懒加载。

```text
users -> user_roles -> roles -> role_menus -> menus
                                           |
                                           v
                                  current-user menu tree
                                           |
                  +------------------------+----------------------+
                  v                        v                      v
             directory                 menu                   button
          expand/collapse       dynamic internal route       external URL
```

菜单 CRUD 成功后，当前导航缓存失效；下次加载或刷新会重新读取数据库。删除有子节点的目录或仍被角色引用的菜单由后端拒绝，避免产生悬空导航。

## 依赖关系

路由组合根只依赖各模块公共入口和 `navigation` 模块。`navigation` 依赖共享 API Client；业务页面之间不互相导入。后端 `menus` 模块通过 `auth` 公共入口获取当前用户，并通过自己的仓储查询菜单与角色关系。

## 失败模式与安全考虑

- 未注册或为空的 `component` 不生成动态路由，并在菜单管理页标记为配置问题。
- 外链只接受 `http:` 与 `https:`，使用 `target="_blank"` 和 `rel="noopener noreferrer"`。
- 循环父子关系、节点自引用和孤立父节点在树构造时被隔离；菜单写入时拒绝自身作为父级。
- HTTP 401 清空本地用户和导航状态后跳转登录页，并保留原目标路径；404 跳转独立错误页；500 通过 `ElMessage.error(err)` 展示安全错误文本。
- 动态路由不是服务端权限校验替代品；后端接口仍必须独立鉴权。

## 测试与验证策略

- 契约测试覆盖菜单类型对应字段、导航树响应和外链协议。
- 后端单元测试覆盖树构造、角色过滤、祖先补齐与循环保护。
- 前端测试覆盖动态路由解析、树形侧栏三种节点、四个独立页面入口以及 401/404/500 行为。
- 执行全仓测试、TypeScript 构建、数据库迁移生成检查与前端生产构建；浏览器检查桌面及窄屏登录、折叠菜单和 404 页面。

## 兼容性与迁移

新增数据库迁移为现有菜单增加 `component`、`external_url`，并把原五个菜单补齐组件标识。迁移同时把基础菜单整理为“工作台”“组织与权限”“系统配置”三级树，并确保超级管理员角色关联新增目录。

旧的 `navigation.ts`、静态业务子路由、`ResourceView.vue` 与 `modules/admin` 在迁移完成后删除。保留 `/users`、`/roles`、`/menus`、`/dictionaries` 路径，避免已有书签失效。

## 未决问题

- 后续若模块数量增加，可为页面组件注册表增加自动一致性检查或生成脚本。
- 菜单修改后是否通过服务端推送使所有在线会话即时刷新，留待存在实时权限撤销需求时评估。

## 相关 ADR、计划和 AI 日志

- `docs/decisions/ADR-0010-database-navigation-and-controlled-view-registry.md`
- `docs/decisions/ADR-0011-registered-application-http-error-handler.md`
- `docs/plans/archive/2026-07-27-jtlab-dynamic-navigation.md`
- `docs/ai-logs/2026/07/2026-07-27-jtlab-dynamic-navigation.md`
