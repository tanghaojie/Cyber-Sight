<template>
  <section class="mx-auto grid max-w-[1480px] gap-6" aria-label="工作台总览">
    <div class="relative overflow-hidden rounded-[30px] bg-[#173b31] px-6 py-8 text-white shadow-[0_24px_70px_rgba(20,48,40,.18)] sm:px-9 sm:py-10">
      <div class="pointer-events-none absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_82%_20%,rgba(201,255,87,.28),transparent_24%),linear-gradient(120deg,transparent_45%,rgba(255,255,255,.04)_45%)]" />
      <div class="relative max-w-2xl">
        <p class="mb-5 text-[10px] font-black tracking-[.22em] text-[#c9ff57] uppercase">Thursday · Operations brief</p>
        <h2 class="font-display text-3xl font-black tracking-[-.045em] sm:text-[44px] sm:leading-[1.08]">
          一处掌握系统脉络，<br class="hidden sm:block">让管理动作清晰发生。
        </h2>
        <p class="mt-5 max-w-xl text-sm leading-7 text-white/56">
          用户、角色、菜单与基础字典已经汇集到统一工作台。选择左侧模块，即可在当前内容区无刷新切换。
        </p>
      </div>
      <div class="relative mt-8 flex flex-wrap gap-3">
        <RouterLink to="/users" class="inline-flex h-11 items-center rounded-xl bg-[#c9ff57] px-5 text-xs font-black text-[#173b31] transition hover:-translate-y-0.5 hover:bg-white">
          管理用户
          <span class="ml-3 text-lg">→</span>
        </RouterLink>
        <RouterLink to="/menus" class="inline-flex h-11 items-center rounded-xl border border-white/15 bg-white/5 px-5 text-xs font-bold text-white/75 transition hover:bg-white/10 hover:text-white">
          配置菜单
        </RouterLink>
      </div>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <RouterLink
        v-for="module in modules"
        :key="module.to"
        :to="module.to"
        class="group rounded-3xl border border-[#dce2dc] bg-white/75 p-5 transition duration-200 hover:-translate-y-1 hover:border-[#b9c7bd] hover:bg-white hover:shadow-[0_18px_45px_rgba(32,56,47,.08)]"
      >
        <div class="flex items-start justify-between">
          <span class="grid size-11 place-items-center rounded-2xl bg-[#e8eee9] text-[#2a5948] transition group-hover:bg-[#c9ff57] group-hover:text-[#173b31]">
            <AppIcon :name="module.icon" />
          </span>
          <span class="text-lg text-[#9aa69f] transition group-hover:translate-x-1 group-hover:text-[#2a5948]">↗</span>
        </div>
        <b class="mt-7 block font-display text-[17px] font-black text-[#22312b]">{{ module.label }}</b>
        <p class="mt-2 text-xs leading-5 text-[#839087]">{{ module.description }}</p>
      </RouterLink>
    </div>

    <div class="grid gap-4 xl:grid-cols-[1.3fr_.7fr]">
      <div class="rounded-3xl border border-[#dce2dc] bg-white/75 p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-[9px] font-black tracking-[.18em] text-[#87958c] uppercase">Architecture</p>
            <h3 class="mt-2 font-display text-lg font-black text-[#25332e]">动态页面装载链路</h3>
          </div>
          <el-tag effect="plain" round>Vue Router</el-tag>
        </div>
        <div class="mt-7 grid gap-3 sm:grid-cols-3">
          <div v-for="(step, index) in steps" :key="step" class="relative rounded-2xl bg-[#f3f4ef] p-4">
            <span class="text-[10px] font-black text-[#619078]">0{{ index + 1 }}</span>
            <b class="mt-5 block text-xs text-[#34443d]">{{ step }}</b>
          </div>
        </div>
      </div>
      <div class="flex min-h-52 flex-col justify-between rounded-3xl bg-[#dfe7df] p-6">
        <div class="flex items-center justify-between">
          <span class="text-[9px] font-black tracking-[.18em] text-[#697970] uppercase">System pulse</span>
          <span class="size-2 rounded-full bg-[#45976e] shadow-[0_0_0_6px_rgba(69,151,110,.12)]" />
        </div>
        <div>
          <strong class="font-display text-5xl font-black tracking-[-.06em] text-[#183b30]">100<span class="text-xl">%</span></strong>
          <p class="mt-2 text-xs text-[#6e7e75]">基础模块已接入统一应用壳</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import AppIcon from '../components/AppIcon.vue'

const modules = [
  { to: '/users', label: '用户管理', description: '维护账号、身份资料与角色归属。', icon: 'users' },
  { to: '/roles', label: '角色管理', description: '定义职责边界和菜单授权范围。', icon: 'shield' },
  { to: '/menus', label: '菜单管理', description: '组织导航结构、路由与展示顺序。', icon: 'menu' },
  { to: '/dictionaries', label: '字典管理', description: '集中维护稳定、复用的枚举数据。', icon: 'book' },
]

const steps = ['侧栏菜单发起导航', '路由懒加载页面组件', '内容区平滑切换视图']
</script>
