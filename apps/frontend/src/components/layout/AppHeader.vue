<template>
  <header class="sticky top-0 z-30 flex h-24 items-center justify-between border-b border-[#dce2dc] bg-[#f5f4ee]/90 px-5 backdrop-blur-xl sm:px-8 lg:px-10">
    <div class="flex min-w-0 items-center gap-4">
      <button
        class="grid size-11 shrink-0 place-items-center rounded-2xl border border-[#d8ded8] bg-white text-[#53635d] shadow-sm transition hover:-translate-y-0.5 hover:border-[#aab7ae] lg:hidden"
        type="button"
        aria-label="打开菜单"
        @click="$emit('open-menu')"
      >
        <AppIcon name="panel" />
      </button>
      <div class="min-w-0">
        <p class="mb-1 hidden text-[9px] font-extrabold tracking-[.2em] text-[#829087] uppercase sm:block">
          {{ eyebrow }}
        </p>
        <h1 class="truncate font-display text-xl font-black tracking-[-.025em] text-[#17241f] sm:text-2xl">
          {{ title }}
        </h1>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="hidden items-center gap-2 rounded-full border border-[#dce2dc] bg-white/65 px-3 py-2 text-[10px] font-bold tracking-wide text-[#607068] md:flex">
        <span class="size-1.5 rounded-full bg-[#4c9d74]" />
        LIVE · SG
      </div>

      <el-dropdown trigger="click" @command="handleCommand">
        <button class="flex items-center gap-2.5 rounded-2xl p-1.5 pr-2 text-left transition hover:bg-white/75">
          <span class="grid size-10 place-items-center rounded-xl bg-[#173b31] text-sm font-black text-[#c9ff57] shadow-lg shadow-emerald-950/10">
            {{ initials }}
          </span>
          <span class="hidden min-w-0 sm:block">
            <b class="block max-w-32 truncate text-xs font-extrabold text-[#26352f]">{{ displayName }}</b>
            <small class="mt-0.5 block text-[10px] text-[#819087]">{{ role }}</small>
          </span>
          <ArrowDown class="hidden size-3.5 text-[#829087] sm:block" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <SwitchButton class="mr-2 size-4" />
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import AppIcon from '../AppIcon.vue'

const props = defineProps<{
  title: string
  eyebrow: string
  displayName?: string
  role?: string
}>()

const emit = defineEmits<{
  'open-menu': []
  logout: []
}>()

const initials = computed(() => props.displayName?.slice(0, 1).toUpperCase() ?? 'A')

function handleCommand(command: string) {
  if (command === 'logout') emit('logout')
}
</script>
