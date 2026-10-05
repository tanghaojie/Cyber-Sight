---
title: 桀士排版组件注册修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-05
status: completed
change_type: fix
---

# 桀士排版组件注册修复

## 用户反馈与证据

运行空白，Element Plus 组件未注册。main.ts 仅注册原有五类组件，上一轮新增 Drawer、RadioGroup、RadioButton 的模板用法，却遗漏入口注册和 CSS。类型和构建检查未发现运行时全局组件注册遗漏。

## 执行与边界

补齐按需注册及对应 theme-chalk 样式，核对所有模板标签。任务开始时暂存区为空，既有人类 index.html 修改隔离保留。不更改依赖、存储或业务逻辑。不运行前端自动化或浏览器测试；人工验收待维护者执行。

## 验证与关联

此前仅核对全部 8 类模板标签对应入口 .use 和 CSS 导入存在，未核对 install 实现，不能证明注册生效；入口 ESLint、vue-tsc 类型检查、六模块边界与生产构建通过。pnpm format、pnpm format:check、git diff --check 和 pnpm docs:archive:check:ci 均通过。未运行浏览器，运行时白屏消失和交互尚待维护者刷新验收。设计：../../../../../design/modules/wechat-editor.md；计划：../../../../plans/2026-10-05-jlab-component-registration.md。关联提交为包含本文件的修复提交。

启动审计为 Platform DUE（completed features reached 3）；完成布局后归档复核，保留有效 Design/ADR，Platform ledger 推进到实际已复核的 25ff537。最终审计 NOT_DUE，Foundation INHERITED、Forge EXCLUDED。复核计划：../../../../plans/2026-10-05-jlab-layout-archive-review.md。

## 同事项继续修复

维护者反馈 Radio 两组件仍无法解析。核对当前 Element Plus radio/index.mjs 和 utils/vue/install.mjs，RadioGroup/RadioButton 为 withNoopInstall；.use 调用确实不注册组件。先前仅检查 .use 存在的结论不足，予以更正。改用 app.component 显式登记两组件；无需新增依赖或改变排版行为。已核对其余 Button、Drawer、Select、Slider、Switch 为 withInstall，Option 由 Select 安装器登记。两类 Radio 改为显式 app.component 注册，直接绕开空安装器。入口 ESLint、vue-tsc、模块边界和生产构建均通过；pnpm format、pnpm format:check、归档 CI 和 git diff --check 均通过。无前端自动化或浏览器检查，交互由维护者验收。关联后续修复提交为包含本次记录更新的提交。
