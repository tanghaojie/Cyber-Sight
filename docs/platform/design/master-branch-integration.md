---
title: Cyber-Sight master 分支集成
scope: platform
repository: Cyber-Sight
status: active
owner: project maintainers
updated: 2026-10-07
---

# Cyber-Sight master 分支集成

## 目标与边界

将本地 master 的桀士排版与独立协作启动模板 P0 文档，与 origin/master 的 Geo 显示质量、坐标选择和地标周边交付合并。保留双方提交历史、业务实现、有效设计、ADR 和归档证据；本次只手工处理 Platform 文档冲突，不形成新的业务接口或长期技术决策。

本次合并双方为本地 `b9b74c6` 与远端 `6262b51`。Foundation、共享契约、数据库和依赖保持两侧已有内容，不执行 Forge 上游同步。独立启动模板 P1 仍未实施。

## 文档与归档数据流

Platform 的设计、决策和归档索引合并双方新增条目。两条历史台账基线分别为本地 `66b264c` 和远端 `dad0830`，各自只证明原有审查范围。冲突解决阶段保留本地较新的台账原值；共同合并提交生成后，复核合并树并在后续文档提交中将台账推进到该真实提交，不能使用日期或尚未生成的提交替代审查证据。

## 失败模式与验证

未解决的台账冲突会使归档检查因 JSON 解析失败而 BLOCKED。本次已获维护者明确授权处理这些冲突以及现有暂存内容。合并完成后重新运行归档检查，若出现 DUE 或 IN_PROGRESS，继续同一 Platform 审查计划，直到最终 CI 门禁通过。

验证 Geo 源码与远端父提交一致、桀士排版源码与本地父提交一致；检查双方文档链接、冲突标记、格式、lint、架构、生产构建及适用测试。不运行前端或浏览器自动化测试；静态检查不代替 Geo 与桀士排版的人工交互和视觉验收。

推送使用 `git push origin master`，保留所有父提交。远端有新提交时重新检查并正常合并；回滚采用后续正常提交。

## 关联与交付状态

- [Geo 地标周边设计](modules/geo-landmark-context.md)
- [桀士排版设计](apps/jlab-wechat-editor.md)
- [实施与归档审查计划](../plans/active/2026-10-07-master-conflict-resolution.md)
- [协作记录](../ai-logs/chore/2026/10/2026-10-07-master-conflict-resolution.md)

## 合并前验证结果

冻结锁文件安装、全仓格式检查、Lint、架构检查、五个 workspace 的类型/生产构建全部通过；构建生成 Sight 和 Standalone Geo 两个 HTML 入口、Cesium 静态资源以及桀士排版独立入口。现有 10 项仓库脚本测试、API 契约产物校验、17 文件共 143 项后端测试通过。

724 个文件的 Git blob 核对通过：406 个前后端/共享包文件保留远端实现；318 个桀士排版、锁文件、仓库配置、工作流与 Foundation 文档文件保留本地实现。没有业务源码的手工改写或未解决的冲突。保留已有 Sass legacy API、Rollup PURE 注释和大 chunk 警告，人工交互及视觉验收仍待维护者。

共同合并树的实际提交与最终归档结果在任务完成时补充。
