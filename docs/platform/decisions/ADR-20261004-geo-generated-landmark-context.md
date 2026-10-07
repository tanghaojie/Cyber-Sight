---
title: Geo 开放数据街区与外部资产生成
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: accepted
date: 2026-10-04
---

# ADR-20261004：Geo 开放数据街区与外部资产生成

## 背景

全球地标系列需要周边体量、材质与昼夜，逐栋手工建模成本高。用户授权第一版生成器、材质、台北资产和 Sight 加载交付。照片式城市覆盖和固定光照不适合作为所有城市的统一昼夜基础。

## 决策

生成器在 sample-data 素材工程处理 Overture/OSM 数据并输出静态资源。Sight 通过显式 scene.json 加载，不运行生成任务，不增加资产后台。真实轮廓和可用高度与估算信息分别记录；共用 PBR 材质和固定窗灯分布。

第一版分块 3D Tiles 使用椭球体地面，制作阶段排除主体，加载时校验最终坐标/变换与区域一致。给生成瓦片显式登记太阳/窗灯和三档质量。保留默认影像、普通模型坐标确认和原科技扫描行为。

## 结果与边界

新增地标复用生成流程；数据缺失仍需要少量修正，不能称逐栋实景复原。实时生成、真实地形适配、街道人工受光和城市反射留待后续。场景索引是新增明确能力，不扩大旧 GLB metadata 的猜测读取。

## 关联

- [设计](../design/modules/geo-landmark-context.md)
- [模型与地理参考](ADR-20261003-geo-model-authoring-and-georeference.md)
