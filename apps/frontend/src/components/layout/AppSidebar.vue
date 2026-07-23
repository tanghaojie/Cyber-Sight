<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-[280px] flex-col overflow-hidden bg-[#10241f] text-[#dce8e1] shadow-2xl shadow-emerald-950/25 transition-transform duration-300 lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_25%_0%,rgba(199,255,83,.16),transparent_32%),linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:auto,100%_48px]" />

    <div class="relative flex h-24 items-center gap-3 border-b border-white/8 px-7">
      <div class="grid size-11 rotate-[-6deg] place-items-center rounded-2xl bg-[#c9ff57] text-[#10241f] shadow-[0_12px_32px_rgba(201,255,87,.18)]">
        <span class="font-display text-lg font-black tracking-[-.08em]">N</span>
      </div>
      <div>
        <strong class="block text-[15px] font-extrabold tracking-[.2em] text-white">NOVA</strong>
        <small class="mt-1 block text-[9px] font-semibold tracking-[.18em] text-white/35">CONTROL DESK</small>
      </div>
      <button
        class="ml-auto grid size-9 place-items-center rounded-xl text-white/45 transition hover:bg-white/8 hover:text-white lg:hidden"
        type="button"
        aria-label="关闭菜单"
        @click="$emit('close')"
      >
        <AppIcon name="close" />
      </button>
    </div>

    <nav class="relative flex-1 overflow-y-auto px-4 py-6" aria-label="主导航">
      <section v-for="group in groups" :key="group.label" class="mb-7">
        <h2 class="mb-2 px-3 text-[10px] font-extrabold tracking-[.18em] text-white/30 uppercase">
          {{ group.label }}
        </h2>
        <div class="grid gap-1.5">
          <RouterLink
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="group relative flex min-h-14 items-center gap-3 rounded-2xl px-3.5 text-white/52 transition duration-200 hover:bg-white/6 hover:text-white"
            active-class="!bg-[#c9ff57] !text-[#10241f] shadow-[0_12px_34px_rgba(0,0,0,.18)]"
            exact-active-class="!bg-[#c9ff57] !text-[#10241f]"
            @click="$emit('navigate')"
          >
            <span class="grid size-9 shrink-0 place-items-center rounded-xl bg-white/6 transition group-hover:bg-white/10 group-[.router-link-active]:bg-[#10241f]/8">
              <AppIcon :name="item.icon" />
            </span>
            <span class="min-w-0">
              <b class="block truncate text-[13px] font-bold">{{ item.label }}</b>
              <small class="mt-0.5 block truncate text-[10px] opacity-55">{{ item.description }}</small>
            </span>
            <span class="ml-auto text-base opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-50">›</span>
          </RouterLink>
        </div>
      </section>
    </nav>

    <div class="relative m-4 rounded-2xl border border-white/8 bg-white/[.035] p-4">
      <div class="flex items-center gap-3">
        <span class="relative flex size-2.5">
          <span class="absolute inline-flex size-full animate-ping rounded-full bg-[#c9ff57] opacity-40" />
          <span class="relative inline-flex size-2.5 rounded-full bg-[#c9ff57]" />
        </span>
        <div>
          <b class="block text-[11px] font-bold text-white/75">系统运行正常</b>
          <small class="mt-0.5 block text-[9px] tracking-wide text-white/30">ALL SERVICES OPERATIONAL</small>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import AppIcon from '../AppIcon.vue'
import type { NavigationGroup } from '../../router/navigation.js'

defineProps<{
  groups: NavigationGroup[]
  open: boolean
}>()

defineEmits<{
  close: []
  navigate: []
}>()
</script>
