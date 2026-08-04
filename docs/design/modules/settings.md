---
title: 前端系统设置模块
status: active
owner: maintainers
updated: 2026-08-04
---

# 前端系统设置模块

## 背景与目标

管理端需要集中配置用户界面偏好。`settings` 将配置保存在当前浏览器；导航菜单风格已接入应用壳，其余设置项保留待后续功能接入。

## 范围与非目标

本模块提供 Header 用户菜单入口、系统设置 Dialog、导航菜单风格、主题颜色、深色模式、Tags View、侧栏 Logo 与动态标题六项配置，以及本地持久化和安全降级。

本模块不请求或保存后端配置，不同步跨浏览器/设备。导航菜单风格以外的 CSS 主题、深色模式、TagView、侧栏品牌或浏览器标题仍不改变实际行为；每项功能由后续独立变更接入。

## 职责与边界

- `settings.store.ts` 是模块的设置数据所有者：恢复、校验、暂存提交和清除浏览器数据。
- `SettingsDialog.vue` 是模块公开的编辑界面：只编辑草稿，保存时提交到 Store，取消时不改变已保存配置。
- `settings.locales.ts` 是模块的固定中英文界面文案；资源加载器自动发现并校验键集合。
- `AdminLayout.vue` 消费 `settings.store.ts` 的公开设置并决定应用壳使用顶部或侧边导航；`AppHeader.vue` 只通过 `SettingsDialog` 展示设置入口。
- `shared/browserStorage.ts` 仅提供安全的浏览器存储访问；不拥有任何设置键或业务语义。

## 公共接口

- `settings.store.ts` 导出 `useSettingsStore()`、`SystemSettings`、`NavigationMenuStyle`、`ThemeColor` 与 `DEFAULT_SYSTEM_SETTINGS`。
- Store 公开只读 `settings`，并提供 `save(settings)`、`reset()`；输入会校验、克隆并写入浏览器存储。
- `SettingsDialog.vue` 接受并暴露标准 `v-model`，由应用壳组件控制打开状态。
- `settings.locales.ts` 以 `settings.*` 命名空间提供中英文固定文案。

## 数据模型与数据流

```text
AppHeader 用户下拉
    -> SettingsDialog 草稿
        -> settings.store.save()
            -> localStorage: cyber_system_settings:v1

AdminLayout
    -> settings.store.settings.navigationMenuStyle
    -> matchMedia('(max-width: 1023px)')
    -> 顶部导航 或 始终显示的侧边导航
```

配置结构为：

- `navigationMenuStyle`: `sidebar` 或 `top`；默认 `sidebar`。
- `themeColor`: `aurora`、`ocean`、`violet` 或 `sunset`；默认 `aurora`。
- `darkMode`: 布尔值；默认关闭。
- `tagsView`: 布尔值；默认开启。
- `sidebarLogo`: 布尔值；默认开启。
- `dynamicTitle`: 布尔值；默认开启。

存储值必须是完整、已知的对象；任何键缺失、类型不匹配或 JSON 损坏时回退默认值。`localStorage` 不可用、空间不足或浏览器策略限制时保留当前会话内存值，不能阻断管理端使用。

桌面宽度下，保存的 `navigationMenuStyle` 直接决定导航呈现。`max-width: 1023px` 的窄屏始终优先使用侧边导航，且不改写用户保存的首选项；窗口恢复到桌面宽度后自动恢复保存的风格。侧边模式的导航栏不使用打开、关闭或遮罩交互，始终占据应用壳左侧。

## 依赖关系

```text
AppHeader -> SettingsDialog.vue -> settings.store.ts -> Pinia + Vue + shared/browserStorage
AdminLayout -> settings.store.ts
```

依赖只从应用壳流向模块公开文件。模块不读取 Router、认证、导航、TagView 或侧栏内部状态；应用壳通过 Store 的公开设置决定呈现，避免反向耦合。

## 失败模式与安全考虑

- 损坏或旧版存储内容：拒绝并使用默认设置。
- 无法写入 `localStorage`：显示的本会话设置保持可用，但刷新后不保证恢复。
- 浏览器多账号：设置是设备级界面偏好，不包含身份、令牌或服务器数据；若未来需要账号隔离，必须递增存储键版本并明确迁移策略。
- 预留字段被未接入功能误用：每个后续消费者需在其设计中声明响应时机、回退值及与本模块的依赖关系。

## 测试与验证策略

遵循前端验证边界：AI 执行格式化、格式检查、TypeScript 检查、生产构建与最终 diff 检查，不创建或运行前端自动化、端到端或浏览器测试。维护者人工验收：

1. 用户下拉可打开系统设置，并能取消、保存与恢复默认值。
2. 刷新页面后六项已保存值恢复，损坏的 `localStorage` 值不影响应用启动。
3. 保存侧边/顶部风格后刷新页面，桌面端恢复对应布局；窄屏强制侧边导航，恢复宽度后回到保存风格。
4. 侧边模式没有隐藏、显示或关闭按钮，导航始终可见。

## 兼容性与迁移

新增存储键为 `cyber_system_settings:v1`，不读取历史键。未来结构不兼容时递增版本；仅在明确需要保留用户设置时提供一次性迁移。

## 相关 ADR、计划和 AI 日志

- 计划：[添加前端系统设置入口](../../archive/plans/2026-07-31-system-settings.md)
- AI 日志：[添加前端系统设置入口](../../archive/ai-logs/2026/07/2026-07-31-system-settings.md)
- 不新增 ADR；本次不改变现行架构或后端行为。
