<template>
  <section class="login-interaction">
    <LanguageSwitcher class="login-language" />
    <form class="login-card" @submit.prevent="handleSubmit">
      <div class="mobile-brand">
        <CyberLogo :show-descriptor="false" tone="dark" />
      </div>
      <div class="form-head">
        <p>{{ t('auth.login.kicker') }}</p>
        <h2>{{ t('auth.login.title', { name: appConfig.name }) }}</h2>
        <span>{{ t('auth.login.subtitle', { name: appConfig.fullName }) }}</span>
      </div>
      <label class="login-field">
        <span>{{ t('auth.login.username') }}</span>
        <el-input
          v-model.trim="username"
          size="large"
          autocomplete="username"
          :placeholder="t('auth.login.usernamePlaceholder')"
        />
      </label>
      <label class="login-field">
        <span
          >{{ t('auth.login.password') }} <small>{{ t('auth.login.passwordHint') }}</small></span
        >
        <el-input
          v-model="password"
          size="large"
          type="password"
          show-password
          autocomplete="current-password"
          :placeholder="t('auth.login.passwordPlaceholder')"
        />
      </label>
      <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
      <el-button
        native-type="submit"
        type="primary"
        size="large"
        :loading="auth.busy"
        class="login-submit"
      >
        {{ t('auth.login.submit') }} <span aria-hidden="true">→</span>
      </el-button>
      <p class="login-hint">
        {{ t('auth.login.initialAccount') }} <b>admin</b> / <b>Admin@123456</b>
      </p>
    </form>
    <CreatorCredit class="mobile-credit" tone="dark" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorCredit from '@/components/brand/CreatorCredit.vue'
import CyberLogo from '@/components/brand/CyberLogo.vue'
import { appConfig } from '@/config/app.config'
import { useAuthStore } from '@/modules/system/auth/auth.store'
import LanguageSwitcher from '@/modules/system/localization/LanguageSwitcher.vue'
import { useLocalization } from '@/modules/system/localization/localization'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const { t } = useLocalization()
const username = ref('admin')
const password = ref('Admin@123456')
const error = ref('')

async function handleSubmit(): Promise<void> {
  error.value = ''
  const message = await auth.login(username.value, password.value)
  if (message) {
    error.value = message
    return
  }

  // 守卫把原目标写入 redirect，登录成功后回到用户最初请求的页面。
  const destination = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  await router.replace(destination)
}
</script>

<style scoped>
.login-interaction {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 60px 10%;
  background:
    radial-gradient(
      circle at 92% 4%,
      color-mix(in srgb, var(--primary), transparent 87%),
      transparent 34%
    ),
    var(--canvas);
}

.login-language {
  position: absolute;
  top: 28px;
  right: 32px;
}

.login-card {
  width: min(100%, 420px);
  display: grid;
  gap: 22px;
  padding: 38px;
  border: 1px solid var(--line);
  border-radius: 30px;
  background: color-mix(in srgb, var(--surface), transparent 14%);
  box-shadow: var(--shadow);
  backdrop-filter: blur(18px);
}

.form-head {
  margin-bottom: 12px;
}

.form-head p {
  margin: 0;
  color: var(--primary-deep);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.22em;
}

.form-head h2 {
  margin: 12px 0 8px;
  font-family: var(--font-display);
  font-size: 32px;
  letter-spacing: -0.04em;
}

.form-head span {
  color: var(--muted);
  font-size: 12px;
}

.login-field {
  display: grid;
  gap: 9px;
}

.login-field > span {
  display: flex;
  justify-content: space-between;
  color: var(--ink-soft);
  font-size: 12px;
  font-weight: 750;
}

.login-field small {
  color: var(--muted);
  font-size: 10px;
  font-weight: 500;
}

.login-submit {
  width: 100%;
  height: 52px !important;
  margin-top: 4px;
  justify-content: space-between !important;
  padding: 0 20px !important;
  font-weight: 800;
}

.login-hint {
  margin: -8px 0 0;
  color: var(--muted);
  font-size: 10px;
  text-align: center;
}

.login-hint b {
  color: var(--ink-soft);
}

.mobile-brand,
.mobile-credit {
  display: none;
}

@media (max-width: 900px) {
  .login-interaction {
    align-content: center;
    gap: 30px;
    padding: 44px 24px;
  }

  .login-language {
    top: 20px;
    right: 20px;
  }

  .login-card {
    padding: 30px 26px;
  }

  .mobile-brand {
    display: block;
    margin-bottom: 28px;
  }

  .mobile-brand :deep(.cyber-logo) {
    --cyber-logo-mark-size: 42px;
    --cyber-logo-wordmark-size: 15px;
  }

  .mobile-credit {
    display: inline-grid;
  }
}
</style>
