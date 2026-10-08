---
title: 独立产品拆分收尾
scope: platform
repository: Cyber-Sight
status: completed
owner: project maintainers
date: 2026-10-08
change_type: refactor
---

# 独立产品拆分收尾

## 用户目标与关键指令

维护者确认迁移没有问题，要求删除已迁出排版工具的所有来源内容，后续两个项目分别维护。授权涵盖应用、产品资源、专属现行/归档文档，以及配置和混合记录引用。

## 事实、选择与实际改动

任务前暂存区和工作区为空，归档审计 NOT_DUE。CodeGraph 返回没有可用索引，使用定向路径/引用搜索，未创建索引。创作者实验室署名、Geo/平台源码、Foundation 和独立项目不属于删除范围。

专属记录删除，混合记录保留非产品证据并声明本次删减；剩余应用仍使用的依赖保留，锁文件通过工作区移除重新收敛。仅在来源仓库进行文件删除，删除路径必须验证在仓库根内。

初始 Platform 相对链接扫描发现 80 处原有失效链接，产品删除后仍为 80，未新增失效链接。已向维护者说明，维护者明确要求本轮继续修复；范围扩大为旧归档链接同步，保留历史事实和 Foundation 只读边界。

## 验证与提交

实际删除 35 个原应用跟踪文件及其本地目录、54 份专属文档/资源，清理相关索引和同步保护路径；混合记录仅删去撤出产品内容并注明维护者授权日期。产品名称和路径没有剩余引用。锁文件移除 11 个专属包，剩余 importer、包和快照内容一致；Cesium 所需 DOMPurify 3.4.13 保留。

80 处原有历史失效链接已修复，涉及 45 个文件；77 处恢复到现有现行/归档文档，3 处指向经 cat-file 和 origin 历史核验的固定 Git 版本。修复后 Platform 相对链接失效为 0；686 个剩余应用、共享包和 Foundation 跟踪文件未改。独立项目没有修改。

Windows Node 24.19.0/pnpm 11.22.0 下冻结离线安装、格式、Lint、架构、四个 workspace 类型/生产构建、10 项仓库脚本测试、契约产物校验、17 文件共 143 项后端测试、diff 及最终归档 CI 通过。归档状态 NOT_DUE。保留原有 Sass legacy API、Rollup PURE 注释与 Geo 大 chunk 提示。不运行前端或浏览器自动化，不把静态构建当作 Geo 人工效果验收。关联提交从本文件 Git 历史定位，创建后核验真实模型 trailer；不推送。

关联[设计](../../../../../design/product-separation.md)、[计划](../../../../plans/2026-10-08-product-separation.md)。

技术交付提交为 4221d9cbe4a466cb6bcb9565014ea568cb241b1b，模型标记已核验。提交后审计因历史完成计划的链接修改触发 DUE；已完成[独立复核](../../../docs/2026/10/2026-10-08-product-separation-archive-review.md)，推进 Platform 的真实基线并恢复最终 NOT_DUE。
