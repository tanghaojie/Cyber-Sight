---
title: 关于项目模块
status: active
owner: maintainers
updated: 2026-08-07
---

# 关于项目模块

## 定位与边界

`about` 是脚手架内置的产品介绍页面，负责解释 Cyber Scaffold 的定位、工程蓝图、核心能力和技术基础，并提供项目 GitHub 入口。它只消费品牌配置、图标、固定本地化文案和静态视觉结构，不读取业务数据，也不承载 README 的完整说明、认证状态或后端 API。

页面放在 `apps/frontend/src/modules/system/about/`，因为它属于脚手架系统能力；后续具体产品的“关于我们”或企业资料应放在 `src/modules/biz/<module>/`，不能复用本模块承载业务内容。

## 公共接口与路由

- `registerViews.ts` 登记稳定组件键 `about`，供数据库菜单动态路由加载。
- 菜单迁移提供 `/about`、`component = about`、`layout = AdminLayout` 的根级菜单。
- 页面内部使用 `<a>` 打开 `appConfig.githubUrl`，不新增 API 或权限键。

## 数据流

```text
sys_menus(关于项目)
    -> GET /navigation/menus
    -> navigation store / dynamicRoutes
    -> AdminLayout
    -> AboutPage
```

页面本身不伪造运行时统计；“模块、契约、文档”的展示是产品定位和 README 的精选表达。菜单顺序由数据库 `sort_order` 控制，当前迁移将其放在已有根菜单之后。

## 视觉与交互

- Hero 使用深色 CYBER 视觉、网格、轨道、节点和渐进式入场动画，突出“工程蓝图”概念。
- 通过架构层、能力卡片、技术栈标签和演进路径把 README 内容转译成可扫读的展示面。
- GitHub CTA 和 Logo 链接均使用新窗口安全属性；卡片和节点仅增强层次，不改变导航语义。
- `prefers-reduced-motion: reduce` 时关闭连续动画，保留静态结构和可读性。
- 中英文固定文案归属 `about.locales.ts`，数据库菜单名称保持用户可编辑的原始值。

## 失败模式与验证策略

- 若菜单未执行迁移，页面仍可被构建期登记，但不会出现在已认证导航中；应重新执行迁移并刷新导航。
- 若菜单组件键被错误修改，`viewRegistry` 会记录缺少组件并跳过该菜单，不允许任意动态导入。
- 外部链接不影响应用内路由；网络不可用时页面正文仍可正常浏览。
- AI 执行格式检查、TypeScript/生产构建和适用后端测试；Logo 跳转、末尾菜单顺序、窄屏布局与减少动效由维护者人工验收。
