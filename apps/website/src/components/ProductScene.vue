<script setup lang="ts">
import { computed } from 'vue'
import type { Locale, SceneContent } from '../content'

const props = defineProps<{
  scene: SceneContent
  locale: Locale
}>()

const ui = computed(function () {
  if (props.locale === 'zh') {
    return {
      overview: '系统概览',
      users: '用户管理',
      roles: '角色与授权',
      menus: '菜单管理',
      docs: '项目文档',
      welcome: '早上好，维护者',
      health: '系统运行状态',
      active: '正常',
      modules: '可用模块',
      contracts: '契约检查',
      search: '搜索名称或部门',
      name: '用户',
      department: '部门',
      status: '状态',
      action: '操作',
      enabled: '启用',
      permission: '功能权限',
      dataScope: '数据范围',
      current: '当前部门',
      tree: '菜单结构',
      route: '路由路径',
      component: '组件标识',
      design: '现行设计',
      decisions: '架构决策',
      plans: '活动计划',
      verified: '已验证',
    }
  }

  return {
    overview: 'Overview',
    users: 'Users',
    roles: 'Roles & Access',
    menus: 'Navigation',
    docs: 'Project docs',
    welcome: 'Good morning, maintainer',
    health: 'System health',
    active: 'Healthy',
    modules: 'Available modules',
    contracts: 'Contract checks',
    search: 'Search name or department',
    name: 'User',
    department: 'Department',
    status: 'Status',
    action: 'Action',
    enabled: 'Active',
    permission: 'Functional access',
    dataScope: 'Data scope',
    current: 'Current department',
    tree: 'Menu structure',
    route: 'Route path',
    component: 'Component key',
    design: 'Current design',
    decisions: 'Decisions',
    plans: 'Active plan',
    verified: 'Verified',
  }
})

const sidebarItems = computed(function () {
  return [ui.value.overview, ui.value.users, ui.value.roles, ui.value.menus]
})
</script>

<template>
  <div class="product-scene" :data-kind="scene.kind" aria-hidden="true">
    <div class="scene-window-bar">
      <span class="scene-window-mark">CYBER / CONSOLE</span>
      <span class="scene-window-dots" aria-hidden="true"><i></i><i></i><i></i></span>
    </div>

    <div v-if="scene.kind === 'contract'" class="code-scene">
      <div class="code-sidebar">
        <strong>api-contract</strong>
        <span>src/modules</span>
        <span class="is-active">users.schema.ts</span>
        <span>roles.schema.ts</span>
        <span>menus.schema.ts</span>
      </div>
      <div class="code-editor" aria-label="Zod runtime contract example">
        <div>
          <em>01</em><code><b>export const</b> userSchema = z.object({</code>
        </div>
        <div><em>02</em><code>&nbsp;&nbsp;id: z.number().int(),</code></div>
        <div><em>03</em><code>&nbsp;&nbsp;username: z.string().min(1),</code></div>
        <div><em>04</em><code>&nbsp;&nbsp;departmentId: z.number().nullable(),</code></div>
        <div><em>05</em><code>&nbsp;&nbsp;status: z.enum(['active', 'disabled']),</code></div>
        <div><em>06</em><code>})</code></div>
        <div class="code-result"><span></span> ZOD → NEST → OPENAPI</div>
      </div>
    </div>

    <div v-else-if="scene.kind === 'docs'" class="docs-scene">
      <div class="docs-tree">
        <strong>docs/</strong>
        <span class="is-open">design/</span>
        <span class="is-child is-active">system-overview.md</span>
        <span class="is-child">module-boundaries.md</span>
        <span>{{ ui.decisions }}/</span>
        <span>{{ ui.plans }}/</span>
      </div>
      <div class="docs-document">
        <span class="docs-kicker">CURRENT SYSTEM TRUTH</span>
        <div class="scene-document-title">{{ ui.design }}</div>
        <div class="docs-line is-wide"></div>
        <div class="docs-line"></div>
        <div class="docs-line is-short"></div>
        <div class="docs-callout">
          <i></i>
          <span>{{ ui.verified }} / 2026-08-10</span>
        </div>
        <div class="docs-grid"><span></span><span></span><span></span><span></span></div>
      </div>
    </div>

    <div v-else class="app-scene">
      <aside class="app-sidebar">
        <div class="mini-logo"><span>C</span></div>
        <nav>
          <span
            v-for="(item, index) in sidebarItems"
            :key="item"
            :class="{
              'is-active': index === ['home', 'users', 'roles', 'navigation'].indexOf(scene.kind),
            }"
          >
            <i></i>{{ item }}
          </span>
        </nav>
        <div class="sidebar-foot">V 0.1.0</div>
      </aside>

      <div class="app-content">
        <div class="app-topbar">
          <span>{{ scene.title }}</span>
          <div><i></i><i></i><b>JT</b></div>
        </div>

        <div v-if="scene.kind === 'home'" class="home-view">
          <div class="scene-title-row">
            <div>
              <small>OPERATOR / 08:32</small>
              <div class="scene-view-title">{{ ui.welcome }}</div>
            </div>
            <span class="health-pill"><i></i>{{ ui.active }}</span>
          </div>
          <div class="metric-grid">
            <div>
              <small>{{ ui.health }}</small
              ><strong>99.98%</strong><span class="metric-line"></span>
            </div>
            <div>
              <small>{{ ui.modules }}</small
              ><strong>12</strong><span class="metric-bars"><i></i><i></i><i></i><i></i></span>
            </div>
            <div>
              <small>{{ ui.contracts }}</small
              ><strong>121</strong><span class="metric-ring"></span>
            </div>
          </div>
          <div class="activity-panel">
            <div class="panel-heading"><span>SYSTEM ACTIVITY</span><small>LIVE</small></div>
            <div class="activity-chart">
              <i
                v-for="height in [34, 50, 42, 72, 61, 88, 69, 94, 82, 100]"
                :key="height"
                :style="{ height: `${height}%` }"
              ></i>
            </div>
          </div>
        </div>

        <div v-else-if="scene.kind === 'users'" class="table-view">
          <div class="table-toolbar">
            <span>{{ ui.search }}</span
            ><span class="table-new-action">+ NEW USER</span>
          </div>
          <div class="fake-table">
            <div class="fake-row fake-head">
              <span>{{ ui.name }}</span
              ><span>{{ ui.department }}</span
              ><span>{{ ui.status }}</span
              ><span>{{ ui.action }}</span>
            </div>
            <div
              v-for="user in ['Lena Xu', 'Morgan Chen', 'Jamie Lin', 'Alex Zhao']"
              :key="user"
              class="fake-row"
            >
              <span><i class="avatar"></i>{{ user }}</span
              ><span>Platform Lab</span><span><b class="status-dot"></b>{{ ui.enabled }}</span
              ><span>•••</span>
            </div>
          </div>
        </div>

        <div v-else-if="scene.kind === 'roles'" class="roles-view">
          <div class="role-list">
            <small>ROLE MATRIX</small>
            <span class="is-active"><i></i>Platform Admin<b>12</b></span>
            <span><i></i>Operations<b>08</b></span>
            <span><i></i>Auditor<b>04</b></span>
          </div>
          <div class="permission-panel">
            <div class="panel-heading">
              <span>{{ ui.permission }}</span
              ><small>KEY / SCOPE</small>
            </div>
            <label
              v-for="permission in ['users:read', 'users:write', 'roles:read', 'menus:manage']"
              :key="permission"
              ><i></i><span>{{ permission }}</span
              ><b>ALLOW</b></label
            >
            <div class="scope-box">
              <small>{{ ui.dataScope }}</small
              ><strong>{{ ui.current }}</strong>
            </div>
          </div>
        </div>

        <div v-else class="navigation-view">
          <div class="menu-tree-panel">
            <small>{{ ui.tree }}</small>
            <span class="tree-root"><i></i>System</span>
            <span class="tree-child"><i></i>{{ ui.users }}</span>
            <span class="tree-child is-active"><i></i>{{ ui.roles }}</span>
            <span class="tree-child"><i></i>{{ ui.menus }}</span>
          </div>
          <div class="route-panel">
            <small>ROUTE REGISTRY</small>
            <div class="scene-route-title">{{ ui.roles }}</div>
            <label
              ><span>{{ ui.route }}</span
              ><b>/system/roles</b></label
            >
            <label
              ><span>{{ ui.component }}</span
              ><b>system.roles</b></label
            >
            <div class="route-node-map"><i></i><i></i><i></i><i></i><span></span></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
