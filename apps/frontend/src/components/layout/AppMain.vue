<template>
  <main class="min-h-[calc(100vh-6rem)] overflow-hidden px-4 py-5 sm:px-7 sm:py-7 lg:px-10 lg:py-9">
    <RouterView v-slot="{ Component, route }">
      <Transition name="page" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </main>
</template>
