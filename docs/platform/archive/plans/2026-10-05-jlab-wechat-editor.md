---
title: 桀士排版独立应用实施
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-10-05
updated: 2026-10-05
---

# 桀士排版独立应用实施

## 目标与范围

按照已确认设计交付 apps/wechat-editor 独立纯前端单页。仅横屏桌面，不做窄屏或手机工作台；保留文章阅读宽度模拟。无后台、路由、IP、教程、文章包与自动发布。

## 实施任务

- [x] P0：登记 Platform 所有权、锁定依赖、独立开发/构建及应用内部边界检查。
- [x] P1：单层工具栏、三类非模态左抽屉、Markdown 实时预览、可键盘/拖拽分栏。
- [x] P2：四类配色、九种章节、文字设置、可恢复局部标注、固定结尾、单文件及单图、本地草稿。
- [x] P3：受控内联 HTML、素材诊断、双格式剪贴板与人工验收说明。
- [x] 设计同步、归档与技术验证；关联提交为包含本记录的 feat(wechat-editor) 提交。

## 前置条件与方案

暂存区和工作区开始时为空；归档审计 NOT_DUE。不修改 Forge 所有的共享架构检查器，在新应用内提供静态模块依赖检查并单独执行。Markdown 采用 markdown-it 15.0.2（MIT），HTML 清洗采用 DOMPurify 3.4.16（Apache-2.0/MPL-2.0），其余沿用仓库已锁技术栈。开发端口 5174，base 使用相对资源路径，dist 为静态部署产物；正式公网 origin 待部署时确定。

## 验证与人工边界

执行格式、ESLint、TypeScript、独立生产构建、静态边界和归档 CI；不创建或运行前端自动化或浏览器测试。人工验收桌面工作台、输入法、选区/改稿、刷新保存、素材、剪贴板权限和公众号粘贴保存/明暗阅读。未人工验收的微信输出 profile 保持 candidate。

## 发布与回滚

独立 pnpm --filter @jlab/wechat-editor dev/build/preview。部署 dist 到独立 HTTPS origin，不依赖管理应用。撤销本轮提交可移除新应用接入；不删除浏览器草稿。

## 实际偏差与遗留问题

TypeScript、应用模块边界、仓库所有权、ESLint、独立生产构建、monorepo 全量构建、冻结锁文件安装与归档 CI 通过；格式检查与最终 diff 检查列入同轮提交门禁。开发入口 5174 返回 HTTP 200；未执行浏览器或前端自动化测试。按需注册 Element Plus 控件后，应用产物约 440 kB JS、53 kB CSS（gzip 约 167/9 kB），构建只有依赖注释警告；全仓库既有 frontend 构建存在 Sass 弃用警告，不影响完成。

四类配色和九种章节独立实现，未逐像素对照原站；TXT 不猜章节。偏好统一入 IndexedDB，未拆 localStorage。真实公众号接收、桌面交互、刷新恢复和人工功能验收仍待维护者按应用 README 完成；公网 origin 待部署时确认。微信 profile 保持 candidate，计划完成代表本轮代码交付和技术验证完成，不代表人工验收完成。

## 关联

- [应用设计](../../design/apps/jlab-wechat-editor.md)
- [实施协作记录](../ai-logs/feat/2026/10/2026-10-05-jlab-wechat-editor.md)
