---
title: Geo 模拟飞机尺寸航向与单航线协作记录
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 模拟飞机尺寸航向与单航线协作记录

## 用户目标

用户反馈模拟飞机太小、机头没有对准航向，并询问每条航线的两条线是否可以只保留一根。

## 诊断与计划

两条线分别是完整起终点大圆线和 `PathGraphics` 的动态短轨迹。删除后者。Billboard 不会自动消费实体的速度朝向，因此使用当前位置与前进位置的屏幕投影计算 `rotation`；仍由 `SampledPositionProperty` 驱动位置，不手动写入实体坐标。

## 实际改动与验证

- 飞机显示比例从有效约 0.3 倍提高为近景 0.86 倍，并相应提高远景最小比例；
- 删除 `PathGraphics`，每条航线只保留一个 `ArcType.GEODESIC` 完整大圆线；
- `CallbackProperty` 通过当前和前进位置的 `SceneTransforms.worldToWindowCoordinates` 计算屏幕旋转，机头始终指向可见前进方向；
- 前端生产构建、lint、格式、所有权、文档门禁和 diff 检查通过；浏览器视觉互动依仓库规则保留给维护者人工验收。
