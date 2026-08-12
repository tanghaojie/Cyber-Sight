---
title: Foundation 与 Platform 使用独立数据库迁移链
status: accepted
date: 2026-08-12
---

# ADR-20260812：Foundation 与 Platform 使用独立数据库迁移链

## 背景

单一 Drizzle 输出目录包含 SQL、snapshot 和 journal。Forge 与业务平台在共同历史上分别生成迁移会竞争编号、修改同一 journal，并使系统升级与业务迁移的执行顺序不确定。

## 决策

Foundation 与 Platform 分别使用 Schema 生成入口、Drizzle 配置、输出目录和迁移记录表。根迁移命令固定先执行 Foundation，再执行 Platform。运行时仍通过单一聚合 Schema 使用所有表。

本次迁移只支持全新 PostgreSQL 18 空库。Sight 没有需要兼容的业务迁移或数据，因此直接重建两条干净历史，不为旧 journal 提供转换。

Platform Schema 可以引用 Foundation 的公共表；Foundation Schema 禁止引用 Platform。正式启用自动生成 Platform 迁移前，必须通过外键 PoC 验证不会重复生成 Foundation 表；若当前 Drizzle Kit 无法可靠隔离，则 Platform 使用 custom migration，并由所有权检查验证 SQL。

## 正面结果

- Forge 与业务平台不再争用迁移编号、snapshot 和 journal。
- Foundation 升级与 Platform 演进具有稳定执行顺序。
- 数据库历史与源码所有权一致。

## 负面结果与风险

- 数据库命令和验证流程增加。
- 跨作用域外键需要专门生成验证。
- 两个迁移记录表必须同时纳入运维检查。

## 验证和复审条件

- 空库按 Foundation、Platform 顺序初始化成功。
- Platform 迁移不创建或修改 Foundation 拥有的表。
- Foundation 迁移不引用 Platform 对象。
- 当 Drizzle 原生支持更合适的组合迁移模型时复审实现，但保持所有权原则不变。

## 相关设计和计划

- [数据库设计](../design/database-schema-and-migrations.md)
- [所有权边界设计](../design/foundation-platform-ownership.md)
- [实施计划](../plans/active/2026-08-12-foundation-platform-restructure.md)
