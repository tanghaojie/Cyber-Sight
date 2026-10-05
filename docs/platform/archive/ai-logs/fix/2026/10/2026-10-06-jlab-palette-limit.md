---
title: 桀士排版统一配色数量与重置
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-10-06
status: completed
change_type: fix
---

# 桀士排版统一配色数量与重置

用户明确总数最多九个、最少一个；默认六组可修改删除，重置所有配色恢复默认六组。本轮去掉默认/自定义分组。旧版最多十五组数据不静默删减：允许读入，提示用户删除或重置；新写入严格1至9组。重置配色库不改当前文章实际颜色，保持预览不跳变。暂存区和工作区为空，归档NOT_DUE。实际检查与提交完成时补充。

## 实际实现与验证

typesetting公共saveColorPreset/deleteColorPreset/updateColorPreset/resetColorPresets控制配色快照与数量边界，Vue只发出patch。重置恢复默认六组，preset标记custom以避免实际颜色与默认卡片选中状态不符。workspace读取允许旧十五组，写入限制九组并给出专门超限提示；缩减完成后即时保存，无新库或记录格式。

ESLint、TypeScript、生产构建、六模块边界（28文件/94导入）、仓库所有权检查通过；最终格式、diff和归档CI检查通过后提交。构建保留VueUse PURE注释和510.18kB主包提示。未运行前端自动化或浏览器测试；人工验证1/9数量边界、更新颜色、重置确认/取消、刷新恢复和超限旧列表恢复。

关联提交：`fix(wechat-editor): unify palette limits and restore defaults`（本记录所在提交），[计划](../../../../plans/2026-10-06-jlab-palette-limit.md)。
