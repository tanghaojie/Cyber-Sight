---
title: Geo 浏览器时区时间轴与太阳环境光
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-02
status: completed
change_type: fix
---

# Geo 浏览器时区时间轴与太阳环境光

## 用户目标和约束

维护者要求先把时间轴显示改为浏览器时区，再按已解释的最小环境光方案修改。继续只使用 Viewer Clock，不增加普通用户的渲染配置负担。

## 关键问答与确认

此前代码审查发现：模型已有默认环境贴图，但 `scene.atmosphere.dynamicLighting` 未设为 SUNLIGHT；环境贴图默认更新时间精度为一小时。用户已授权修改。夜间 IBL 0.2 先保留，后续以实际模型视觉对比校准。

## AI 的重要假设

浏览器本地时区以运行环境的 Date / Intl 为准；绝对时间戳和 JulianDate 不附加偏移。日历日窗口遵守浏览器夏令时规则，航班 UTC 日周期不变。

## 方案和执行摘要

工作区与暂存区初始为空。浅克隆补全历史后完成启动审计；Platform DUE 来自 3 项完成记录与 31 天间隔，创建并完成独立归档复核计划。已修改 TimeDock、Time controller、Scene plugin 和 Data loader，并同步现行设计与 ADR。

时间格式使用浏览器默认时区和 shortOffset，刻度按本地日历对齐，秒/分钟用绝对时长递进；初始/回到现在的日期窗口用本地日历日。Scene 安装时开启 SUNLIGHT，释放时恢复原值。外部 Model 和 3D Tiles 均以 300 秒仿真时间配置环境贴图更新；不新增 Clock 或计时器。

## 验证结果

`pnpm format`、`pnpm lint`、`pnpm architecture:check`、API 契约构建及 frontend `vue-tsc && vite build` 通过，双入口产物生成；代码 diff 审查完成。归档后的最终 `pnpm format:check`、`pnpm docs:archive:check:ci` 和 diff 检查通过；文档状态 NOT_DUE，无断链或所有权冲突。构建存在依赖 Sass 弃用、Rollup 注释与 bundle 体积提示，未影响构建结果。按仓库规则未创建或运行前端自动化及浏览器测试。

## 未决问题与下一步

浏览器时区、夏令时、不同地区太阳位置与 GPU 反射效果需要维护者人工验收；曝光、夜间 IBL、阴影和资产完善不在本轮范围。

代码已在独立任务分支提交，提交后文档 CI 门禁仍为 NOT_DUE。初次 GitHub 集成创建 tree 的请求返回 403（Resource not accessible by integration），先以本地提交、补丁和 Git bundle 交付。后续检查发现 GitHub 应用安装列表为空；维护者通过 OpenAI 官方 ChatGPT Codex Connector 安装入口补充 Cyber-Sight 仓库授权后，写入权限恢复。普通 Git 传输返回 401，改用 GitHub Git Data API 上传原始 tree / commit 并创建任务分支，远端 SHA 与本地一致。

已创建 [草稿 PR #1](https://github.com/tanghaojie/Cyber-Sight/pull/1)。Vercel 自动触发 Git 来源的预览部署，首轮部署对应 `77cb3a272a297ce45f2d00a6796a57602bb7d2cf`，状态 READY：[预览地址](https://cyber-sight-9nezh2jfv-tanghaojies-projects.vercel.app)。GitHub 提交约定检查通过。生产分支仍为原基线；未手工部署或进行浏览器功能验收。

## 相关设计、ADR、计划和提交

- [时间轴设计](../../../../../design/modules/geo-unbounded-timeline.md)
- [模型渲染设计](../../../../../design/modules/geo-model-rendering.md)
- [ADR](../../../../../decisions/ADR-20261002-geo-browser-time-and-solar-environment.md)
- [实施计划](../../../../plans/2026-10-02-geo-local-time-and-solar-environment.md)

关联代码提交：`231f44fb51286b2948be7f4e8353b850324b0956`（`fix(geo): use browser-local timeline and solar environment lighting`），带真实模型 GPT-6 的 AI trailer。
