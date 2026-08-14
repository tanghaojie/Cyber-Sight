---
title: 前端运行时多语言模块
status: active
owner: project maintainers
updated: 2026-08-11
---

# 前端运行时多语言模块

## 背景与目标

Cyber-Sight 默认使用中文，但运行时管理界面需要同时服务中文和英文使用者。`localization` 模块为
Vue 应用提供统一的语言状态、文案解析、日期格式、Element Plus 语言包和语言切换入口，使
页面无需刷新即可在 `zh-CN` 与 `en-US` 之间切换。

## 范围与非目标

本模块覆盖前端运行时界面的固定文案、无障碍标签、静态路由标题、脚手架默认动态菜单、
权限与数据范围等稳定代码目录、Element Plus 内置文案，以及日期和数字格式。

以下内容不在范围内：

- README、设计文档、源码注释、Swagger 和后端日志；
- 用户录入的菜单名称、部门名称、角色名称、字典内容及其他业务数据；
- 后端根据 `Accept-Language` 返回不同响应；
- 账号级或跨设备语言偏好同步；
- 自动读取浏览器首选语言改变脚手架的默认中文行为。

## 职责与边界

`apps/frontend/src/foundation/modules/localization/` 是前端运行时语言能力的数据和规则所有者：

- 只接受 `zh-CN` 和 `en-US` 两种受支持语言，默认与回退语言都是 `zh-CN`；
- 从版本化浏览器键恢复语言并在切换后持久化；
- 安装 Vue I18n，向调用方公开翻译、语言切换和本地化格式化能力；
- 为 Element Plus 选择匹配语言包，并同步 `<html lang>`；
- 提供登录页和应用 Header 可复用的语言切换组件；
- 校验每个模块及 shared 资源的中英文资源具有相同键集合。

各业务模块拥有自己的 `*.locales.ts` 资源和领域文案。`src/foundation/shared/localization/shared.locales.ts`
拥有新增、查看、删除等跨模块的领域无关界面文案，并以 `shared.*` 作为稳定命名空间；模块
不得重复定义这些文案。`localization` 不集中拥有认证、用户、角色、菜单等业务模块的翻译，也
不允许业务模块直接读写其内部语言状态。资源加载器发现并注册模块与 shared 的语言资源，其他
模块只依赖登记的公共文件。

## 公共接口

- `src/foundation/shared/localization/localization.resource.ts`：公开 `SupportedLocale`、资源结构和中英文键
  集合校验辅助函数。
- `src/foundation/shared/localization/shared.locales.ts`：公开通过资源校验的 `shared` 通用界面文案。
- `localization.ts`：公开受支持语言元数据、Vue 插件实例、`useLocalization()`、
  `setLocale()`、`translate()`、本地化标签解析和日期格式化能力。
- `LocalizationProvider.vue`：在应用根部连接当前语言与 Element Plus Config Provider。
- `LanguageSwitcher.vue`：公开无账号依赖的中英文切换控件。
- `*.locales.ts`：模块与 shared 公开的纯翻译资源文件；统一导出名为 `localizationResource`，
  只能导出通过资源辅助函数校验的数据，不得产生业务副作用。

模块外代码不得直接操作 Vue I18n 全局实例、Element Plus locale 或语言存储键。

## 数据模型与数据流

语言代码使用 BCP 47：

```text
SupportedLocale = 'zh-CN' | 'en-US'
```

浏览器存储键为 `${platform.storagePrefix}_locale:v1`，当前 Forge 默认值仍为 `cyber_ai_forge_locale:v1`。读取不到、存储不可用、值损坏或值不受支持时使用
`zh-CN`；写入失败只影响刷新后的恢复，不阻断当前会话切换。

每个模块资源以中文键集合为结构基准，英文资源必须提供相同键。界面文案使用稳定 key，
插值变量只携带数值或用户数据，不把拼接后的中文句子当作 key。

```text
应用启动
    -> Foundation 发现自身模块与 shared/localization，Platform 通过公共注册函数登记自己的 *.locales.ts
    -> 创建并安装 localization
    -> 恢复 Platform 命名空间下的 locale:v1 或使用 zh-CN
    -> LocalizationProvider 选择 Element Plus locale
    -> 页面、路由标题和日期格式响应当前语言
```

用户切换语言后不刷新页面。模块更新 Vue I18n locale、浏览器存储与 `<html lang>`；依赖
翻译 key 的页面标题、侧栏、面包屑、标签显示和 `document.title` 随响应式状态重新计算。

## 默认导航与用户数据边界

数据库菜单契约和表结构保持不变。导航模块拥有脚手架默认菜单指纹目录，每个指纹由节点
类型、规范完整路径、组件标识和初始中文名称共同组成：

- 完整匹配指纹的默认菜单使用对应翻译 key；
- 任一字段被维护者修改后不再匹配，直接显示数据库 `name`；
- 未登记的目录、页面菜单和外链始终直接显示数据库 `name`；
- 不根据局部名称、菜单 ID 或模糊规则猜测翻译，不改写 Store 中的原始菜单数据。

代码定义且已有稳定键的权限、数据资源、操作类型和范围类型可以按稳定键翻译。来自数据库
且由用户维护的名称始终作为不可翻译数据展示。

静态与默认动态路由保存本地化标签描述而不是只保存渲染后的中文。应用壳在当前语言下解析
标题；`tag-view` 继续保存原有 `{ path, title }` 结构，显示层可根据 Router 中的标签描述
重新计算标题，因此不升级或删除现有标签历史。

## 用户提示与服务端错误

共享 API 响应和后端 `err` 字段保持不变。前端按稳定业务 `status` 和当前操作场景选择本地化
用户提示，不根据 `err` 文案做业务分支。服务端原始错误只作为未知失败的诊断兜底，不为运行时
语言能力修改后端协议或路由。

## 依赖关系

```text
main.ts + App.vue
    -> localization 公共入口
        -> Vue I18n + Element Plus locale + shared/browserStorage
        -> shared/localization 资源定义与通用文案

各业务模块
    -> localization 公共组合式函数 + shared.* 翻译键
    -> 自有 *.locales.ts

AdminLayout + Router + navigation
    -> 本地化标签描述
    -> tag-view 的字符串展示边界
```

`localization` 不依赖认证、导航、菜单或页面模块。默认菜单识别规则由 `navigation` 拥有；
应用壳作为组合点同时消费 Router、navigation、tag-view 和 localization。

## 视觉与交互

语言切换器采用与现有 Cyber-Sight 应用壳一致的克制工业仪表风格：石墨色表面、细边框、暖白文字和
薄荷绿当前态。登录页使用适合暗色氛围的紧凑版本，Header 使用相同组件的浅表面变体。控件
必须支持键盘操作、明确焦点态和可读的中英文标签；切换不触发布局跳动或页面刷新。

## 失败模式与安全考虑

- 翻译键缺失：开发阶段由 TypeScript 资源结构校验发现；运行时回退中文，不显示空白。
- 持久化不可用或损坏：当前会话继续工作，下次启动回退中文。
- 日期值为空或不可解析：格式化函数返回空字符串，调用方不因无效时间中断渲染。
- 默认菜单被修改：指纹失配后显示用户录入名称，禁止用旧翻译覆盖。
- 自定义菜单与默认路径接近：只有完整指纹匹配才翻译，避免误判。
- 切换后标签仍显示旧语言：显示层从 Router 标签描述重新解析，不依赖持久化标题作为最终文案。
- 原始 API 错误为英文：已知业务场景显示本地化提示，未知错误保留安全兜底且不得泄露敏感信息。

语言存储只包含受支持语言代码，不包含账号、令牌或个人数据。

## 测试与验证策略

遵循前端验证边界，不创建或运行前端自动化、组件或浏览器测试。AI 执行格式化、ESLint、
TypeScript 检查和生产构建；维护者人工验收：

1. 首次访问默认中文，登录页和管理端均可切换中英文。
2. 切换后无需刷新，固定文案、Element Plus、日期、标题和无障碍标签同步更新。
3. 刷新和重新登录后恢复浏览器保存的语言，无效存储值回退中文。
4. 默认系统菜单、面包屑和历史标签同步翻译；修改菜单名称后始终显示录入值。
5. 部门、角色、字典和自定义菜单等用户数据在两种语言下保持原样。
6. 桌面与窄屏布局中的切换器可见、可聚焦且不破坏现有 Header 和登录布局。
7. 已知错误与成功提示使用当前语言，未知失败仍有安全可理解的兜底。

## 兼容性与迁移

本次不修改数据库、迁移、后端或共享 API 契约。现有菜单、账号和业务数据无需迁移。
`cyber_ai_forge_tag_view_history:v1:<userId>` 结构不变。语言偏好使用新的独立键，不读取或删除其他
浏览器存储。

## 未决问题

无。新增语言、账号级语言同步、后端错误本地化或用户数据多语言需要独立设计。

## 相关 ADR、计划和 AI 日志

- [ADR-0029：采用前端模块化运行时本地化](../../decisions/ADR-0029-frontend-runtime-localization.md)
- [完成计划](../../archive/plans/2026-07-31-runtime-localization.md)
- [AI 协作记录](../../archive/ai-logs/2026/07/2026-07-31-runtime-localization.md)
- [无效日期回归修复](../../archive/plans/2026-07-31-safe-localized-date-formatting.md)
- [共享多语言资源提取](../../archive/plans/2026-07-31-shared-localization-resources.md)及其
  [AI 协作记录](../../archive/ai-logs/2026/07/2026-07-31-shared-localization-resources.md)
