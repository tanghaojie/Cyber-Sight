<template>
  <section class="login-interaction">
    <div class="login-toolbar">
      <LanguageSwitcher />
      <LoginAppearanceControls />
    </div>
    <div class="login-shell">
      <div class="mobile-brand">
        <CyberLogo :show-descriptor="false" tone="dark" />
      </div>
      <div class="login-context">
        <span><i />{{ t('auth.login.accessMode') }}</span>
        <b>{{ t('auth.login.environment') }}</b>
      </div>
      <form class="login-card" @submit.prevent="handleSubmit">
        <div class="form-head">
          <p>{{ t('auth.login.kicker') }}</p>
          <h2>{{ t('auth.login.title', { name: appConfig.name }) }}</h2>
          <span>{{ t('auth.login.subtitle', { name: appConfig.fullName }) }}</span>
        </div>
        <div class="login-fields">
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
              >{{ t('auth.login.password') }}
              <small>{{ t('auth.login.passwordHint') }}</small></span
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
        </div>
        <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
        <el-button
          native-type="submit"
          type="primary"
          size="large"
          :loading="auth.busy"
          class="login-submit"
        >
          {{ t('auth.login.submit') }} <span aria-hidden="true">↗</span>
        </el-button>
        <div class="login-card__footer">
          <p class="login-hint">
            <span>{{ t('auth.login.initialAccount') }}</span>
            <b>admin</b><i>/</i><b>Admin@123456</b>
            <small>{{ t('auth.login.initialAccountNote') }}</small>
          </p>
          <p class="security-note"><i />{{ t('auth.login.securityNote') }}</p>
        </div>
      </form>
      <CreatorCredit class="mobile-credit" tone="dark" />
    </div>
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
import LoginAppearanceControls from './LoginAppearanceControls.vue'

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
  padding: 88px 8% 56px;
  background:
    radial-gradient(
      circle at 92% 4%,
      color-mix(in srgb, var(--primary), transparent 87%),
      transparent 34%
    ),
    var(--canvas);
}

.login-shell {
  width: min(100%, 470px);
  display: grid;
  gap: 17px;
}

.login-toolbar {
  position: absolute;
  top: 28px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-context {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 5px;
  color: var(--muted);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.login-context span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.login-context span i,
.security-note i {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 4px var(--primary-mist);
}

.login-context b {
  color: var(--primary-deep);
  font-size: 8px;
  font-weight: 900;
}

.login-card {
  width: min(100%, 420px);
  width: 100%;
  display: grid;
  gap: 24px;
  padding: 36px;
  border: 1px solid var(--line);
  border-radius: 26px;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--surface), transparent 7%), transparent),
    color-mix(in srgb, var(--surface), transparent 6%);
  box-shadow: 0 24px 80px color-mix(in srgb, var(--ink), transparent 91%);
  backdrop-filter: blur(18px);
}

.form-head {
  display: grid;
  gap: 10px;
  padding-bottom: 22px;
  border-bottom: 1px solid var(--line);
}

.form-head p {
  margin: 0;
  color: var(--primary-deep);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.22em;
}

.form-head h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(30px, 4vw, 38px);
  letter-spacing: -0.04em;
  line-height: 1.05;
}

.form-head span {
  color: var(--muted);
  font-size: 12px;
  line-height: 1.65;
}

.login-fields {
  display: grid;
  gap: 18px;
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
  margin-top: -2px;
  justify-content: space-between !important;
  padding: 0 18px !important;
  font-weight: 800;
}

.login-card__footer {
  display: grid;
  gap: 15px;
  margin-top: -2px;
}

.login-hint {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: var(--muted);
  font-size: 10px;
}

.login-hint b {
  color: var(--ink-soft);
  font-family: var(--font-display);
  font-size: 11px;
}

.login-hint i {
  color: var(--line);
  font-style: normal;
}

.login-hint small {
  grid-column: 1/-1;
  color: var(--muted);
  font-size: 9px;
}

.security-note {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding-top: 13px;
  border-top: 1px solid var(--line);
  color: var(--muted);
  font-size: 9px;
  line-height: 1.5;
}

.security-note i {
  flex: 0 0 auto;
  width: 5px;
  height: 5px;
  box-shadow: none;
}

.mobile-brand,
.mobile-credit {
  display: none;
}

@media (max-width: 900px) {
  .login-interaction {
    align-content: center;
    gap: 30px;
    padding: 44px 24px 32px;
  }

  .login-toolbar {
    top: 20px;
    right: 20px;
  }

  .login-card {
    padding: 30px 26px;
  }

  .mobile-brand {
    display: block;
    margin: 0 0 10px 2px;
  }

  .mobile-brand :deep(.cyber-logo) {
    --cyber-logo-mark-size: 42px;
    --cyber-logo-wordmark-size: 15px;
  }

  .mobile-credit {
    display: inline-grid;
    justify-self: center;
  }
}

@media (max-width: 520px) {
  .login-context {
    padding: 0 2px;
  }

  .login-context b {
    font-size: 7px;
  }

  .login-card {
    padding: 26px 21px;
    border-radius: 22px;
  }

  .login-hint {
    grid-template-columns: 1fr auto auto auto;
  }
}
</style>
