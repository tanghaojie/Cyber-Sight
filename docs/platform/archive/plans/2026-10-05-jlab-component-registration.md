---
title: 桀士排版组件注册修复
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-05
updated: 2026-10-05
---

# 桀士排版组件注册修复

## 目标与依据

维护者反馈运行空白、Element Plus 未注册。上一轮新增 Drawer 和 Radio 组件，但 main.ts 显式注册清单与样式导入未同步。依据现行模块设计补齐入口；保留按需注册方式，无依赖或模块边界变化。

## 实施与验证

- [x] 核对全部模板的 el-* 组件与入口注册、样式。
- [x] 补齐 Drawer、RadioGroup、RadioButton。
- [x] 格式、Lint、类型、构建、归档 CI 与 diff 检查，归档后提交。

不运行前端自动化或浏览器测试；白屏消失与抽屉/radio 交互由维护者人工验收。保留既有人类 index.html 修改，不纳入提交。此前仅核对全部 8 类模板标签对应入口 .use 和 CSS 导入存在，未核对 install 实现，不能证明注册生效；入口 ESLint、vue-tsc 类型检查、六模块边界与生产构建通过。pnpm format、pnpm format:check、git diff --check 和 pnpm docs:archive:check:ci 均通过。未运行浏览器，运行时白屏消失和交互尚待维护者刷新验收。

设计：../../design/modules/wechat-editor.md；日志：../ai-logs/fix/2026/10/2026-10-05-jlab-component-registration.md。关联提交为包含本文件的修复提交。

## 同事项继续修复

维护者反馈 Radio 两组件仍无法解析。核对当前 Element Plus radio/index.mjs 和 utils/vue/install.mjs，RadioGroup/RadioButton 为 withNoopInstall；.use 调用确实不注册组件。先前仅检查 .use 存在的结论不足，予以更正。改用 app.component 显式登记两组件；无需新增依赖或改变排版行为。已核对其余 Button、Drawer、Select、Slider、Switch 为 withInstall，Option 由 Select 安装器登记。两类 Radio 改为显式 app.component 注册，直接绕开空安装器。入口 ESLint、vue-tsc、模块边界和生产构建均通过；pnpm format、pnpm format:check、归档 CI 和 git diff --check 均通过。无前端自动化或浏览器检查，交互由维护者验收。关联后续修复提交为包含本次记录更新的提交。
