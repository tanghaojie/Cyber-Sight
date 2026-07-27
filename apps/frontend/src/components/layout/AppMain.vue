<template>
  <main class="app-main">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
</template>

<style lang="scss" scoped>
.app-main {
  min-width: 0;
  min-height: calc(100vh - 96px);
  min-height: calc(100dvh - 96px);
  overflow-x: clip;
  padding: 20px 16px;
}

@media (min-width: 640px) {
  .app-main {
    padding: 28px;
  }
}

@media (min-width: 1024px) {
  .app-main {
    padding: 36px 40px;
  }
}
</style>
