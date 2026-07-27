<template>
  <main class="login-page">
    <section class="login-atmosphere" aria-hidden="true">
      <div class="lab-grid" />
      <div class="specimen-ring ring-one" />
      <div class="specimen-ring ring-two" />
      <div class="atmosphere-content">
        <div class="brand-lockup">
          <span class="brand-mark">{{ brandInitials() }}</span>
          <div>
            <b>{{ appConfig.name }}</b
            ><small>{{ appConfig.fullName }}</small>
          </div>
        </div>
        <div class="manifesto">
          <p>RESEARCH · BUILD · EVOLVE</p>
          <h1>把复杂系统，<br /><em>做成清晰实验。</em></h1>
          <span>身份、权限、导航与基础数据，在一套可追踪、可演进的工作台中有序发生。</span>
          <ol>
            <li><b>01</b>模块边界</li>
            <li><b>02</b>运行时契约</li>
            <li><b>03</b>审计脉络</li>
          </ol>
        </div>
        <small class="signature">{{ appConfig.tagline }} · 2026</small>
      </div>
    </section>
    <section class="login-form-panel">
      <form class="login-card" @submit.prevent="handleSubmit">
        <div class="mobile-brand">
          <span class="brand-mark">{{ brandInitials() }}</span
          ><b>{{ appConfig.name }}</b>
        </div>
        <div class="form-head">
          <p>SECURE ENTRY</p>
          <h2>欢迎回到实验室</h2>
          <span>使用管理员身份进入 {{ appConfig.productLabel }}</span>
        </div>
        <label class="login-field"
          ><span>用户名</span
          ><el-input
            v-model.trim="username"
            size="large"
            autocomplete="username"
            placeholder="请输入用户名"
        /></label>
        <label class="login-field"
          ><span>密码 <small>至少 8 个字符</small></span
          ><el-input
            v-model="password"
            size="large"
            type="password"
            show-password
            autocomplete="current-password"
            placeholder="请输入密码"
        /></label>
        <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" />
        <el-button
          native-type="submit"
          type="primary"
          size="large"
          :loading="auth.busy"
          class="login-submit"
          >进入控制台 <span aria-hidden="true">→</span></el-button
        >
        <p class="login-hint">本地初始账号：<b>admin</b> / <b>Admin@123456</b></p>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { appConfig, brandInitials } from '../../../config/app.config.js'
import { useAuthStore } from '../auth.store.js'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
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
  const destination = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  await router.replace(destination)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(480px, 1.08fr) minmax(430px, 0.92fr);
  background: var(--surface);
}
.login-atmosphere {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  color: #effbf5;
  background:
    radial-gradient(circle at 18% 12%, rgba(112, 207, 162, 0.24), transparent 31%),
    radial-gradient(circle at 85% 76%, rgba(72, 159, 119, 0.18), transparent 28%),
    linear-gradient(145deg, #143f34, #09261f 72%);
}
.lab-grid {
  position: absolute;
  inset: 0;
  opacity: 0.13;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 62px 62px;
  mask-image: linear-gradient(135deg, #000, transparent 80%);
}
.atmosphere-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 52px 8.5%;
}
.brand-lockup,
.mobile-brand {
  display: flex;
  align-items: center;
  gap: 13px;
}
.brand-mark {
  display: grid;
  width: 43px;
  height: 43px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 14px;
  color: #123c31;
  background: var(--primary);
  box-shadow: 0 15px 34px rgba(3, 20, 15, 0.28);
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 900;
  letter-spacing: -0.04em;
}
.brand-lockup b {
  display: block;
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: 0.13em;
}
.brand-lockup small {
  display: block;
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.38);
  font-size: 9px;
  letter-spacing: 0.18em;
}
.manifesto {
  max-width: 650px;
  margin: auto 0;
  padding: 46px 0;
}
.manifesto > p {
  margin: 0 0 25px;
  color: var(--primary);
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.25em;
}
.manifesto h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(44px, 5vw, 72px);
  font-weight: 800;
  letter-spacing: -0.055em;
  line-height: 1.12;
}
.manifesto h1 em {
  color: var(--primary);
  font-style: normal;
}
.manifesto > span {
  display: block;
  max-width: 510px;
  margin-top: 28px;
  color: rgba(232, 249, 240, 0.52);
  font-size: 14px;
  line-height: 1.9;
}
.manifesto ol {
  display: flex;
  gap: 36px;
  margin: 44px 0 0;
  padding: 0;
  list-style: none;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
}
.manifesto li {
  display: grid;
  gap: 8px;
}
.manifesto li b {
  color: var(--primary);
  font-size: 9px;
  letter-spacing: 0.12em;
}
.signature {
  color: rgba(255, 255, 255, 0.28);
  font-size: 9px;
  letter-spacing: 0.18em;
}
.specimen-ring {
  position: absolute;
  border: 1px solid rgba(112, 207, 162, 0.16);
  border-radius: 50%;
}
.ring-one {
  top: 14%;
  right: -150px;
  width: 380px;
  height: 380px;
  box-shadow: inset 0 0 90px rgba(112, 207, 162, 0.04);
}
.ring-two {
  bottom: -220px;
  left: 38%;
  width: 480px;
  height: 480px;
}
.login-form-panel {
  display: grid;
  place-items: center;
  padding: 60px 10%;
  background: radial-gradient(circle at 92% 4%, var(--primary-mist), transparent 36%), #fbfdfb;
}
.login-card {
  width: min(100%, 420px);
  display: grid;
  gap: 22px;
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
.mobile-brand {
  display: none;
  color: var(--ink);
}
@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }
  .login-atmosphere {
    display: none;
  }
  .login-form-panel {
    min-height: 100vh;
    padding: 44px 24px;
  }
  .mobile-brand {
    display: flex;
    margin-bottom: 28px;
  }
  .mobile-brand .brand-mark {
    color: #123c31;
  }
  .mobile-brand b {
    letter-spacing: 0.12em;
  }
}
</style>
