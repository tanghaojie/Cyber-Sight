<template>
  <main class="login-page">
    <!-- 左侧承载 CYBER 品牌、系统定位和独立的创作者署名，移动端会隐藏。 -->
    <section class="login-atmosphere" aria-label="CYBER 品牌介绍">
      <div class="cyber-grid" />
      <div class="signal-rail signal-rail--horizontal" />
      <div class="signal-rail signal-rail--vertical" />
      <div class="core-orbit orbit-one" />
      <div class="core-orbit orbit-two" />
      <span class="data-node" />
      <div class="atmosphere-content">
        <CyberLogo class="login-logo" tone="light" />
        <div class="manifesto">
          <p>BUILD · CONNECT · EVOLVE</p>
          <h1>让复杂系统，<br /><em>清晰生长。</em></h1>
          <span>身份、权限、导航与基础数据，在模块边界和运行时契约中稳定连接、持续演进。</span>
          <ol>
            <li><b>01</b>模块边界</li>
            <li><b>02</b>运行时契约</li>
            <li><b>03</b>受控演进</li>
          </ol>
        </div>
        <footer class="atmosphere-footer">
          <small class="signature">{{ appConfig.tagline }}</small>
          <CreatorCredit tone="light" />
        </footer>
      </div>
    </section>
    <!-- 右侧是实际登录交互区。 -->
    <section class="login-form-panel">
      <form class="login-card" @submit.prevent="handleSubmit">
        <div class="mobile-brand">
          <CyberLogo :show-descriptor="false" tone="dark" />
        </div>
        <div class="form-head">
          <p>SECURE ENTRY</p>
          <h2>欢迎进入 {{ appConfig.name }}</h2>
          <span>使用管理员身份登录 {{ appConfig.fullName }}</span>
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
      <CreatorCredit class="mobile-credit" tone="dark" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CreatorCredit from '@/components/brand/CreatorCredit.vue'
import CyberLogo from '@/components/brand/CyberLogo.vue'
import { appConfig } from '@/config/app.config'
import { useAuthStore } from '@/modules/system/auth/auth.store'

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
  // 守卫把原目标写入 redirect，登录成功后回到用户最初请求的页面。
  const destination = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  await router.replace(destination)
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(480px, 1.08fr) minmax(430px, 0.92fr);
  background: #f6f8f6;
}
.login-atmosphere {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  color: #f6f5ef;
  background:
    radial-gradient(circle at 15% 8%, rgba(112, 207, 162, 0.16), transparent 26%),
    radial-gradient(circle at 80% 68%, rgba(139, 116, 246, 0.09), transparent 24%),
    linear-gradient(145deg, #111614, #0b0e11 72%);
}
.cyber-grid {
  position: absolute;
  inset: 0;
  opacity: 0.24;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.055) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(135deg, #000 18%, transparent 88%);
}
.signal-rail {
  position: absolute;
  opacity: 0.28;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
}
.signal-rail--horizontal {
  top: 34%;
  right: 0;
  width: 56%;
  height: 1px;
}
.signal-rail--vertical {
  right: 22%;
  bottom: 0;
  width: 1px;
  height: 54%;
  background: linear-gradient(transparent, var(--signal), transparent);
}
.data-node {
  position: absolute;
  top: calc(34% - 4px);
  right: calc(22% - 4px);
  width: 9px;
  height: 9px;
  border: 2px solid #151817;
  border-radius: 2px;
  background: var(--signal);
  box-shadow: 0 0 24px rgba(139, 116, 246, 0.5);
}
.atmosphere-content {
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 50px 8.5% 42px;
}
.login-logo {
  --cyber-logo-mark-size: 56px;
  --cyber-logo-wordmark-size: 19px;
  --cyber-logo-descriptor-size: 8px;
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
.atmosphere-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}
.signature {
  color: rgba(255, 255, 255, 0.3);
  font-size: 8px;
  font-weight: 650;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.core-orbit {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}
.orbit-one {
  top: 14%;
  right: -150px;
  width: 380px;
  height: 380px;
  box-shadow: inset 0 0 90px rgba(112, 207, 162, 0.03);
}
.orbit-two {
  bottom: -220px;
  left: 38%;
  width: 480px;
  height: 480px;
}
.login-form-panel {
  position: relative;
  display: grid;
  place-items: center;
  padding: 60px 10%;
  background:
    radial-gradient(circle at 92% 4%, rgba(112, 207, 162, 0.13), transparent 34%), #f7f9f7;
}
.login-card {
  width: min(100%, 420px);
  display: grid;
  gap: 22px;
  padding: 38px;
  border: 1px solid rgba(24, 58, 48, 0.08);
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 26px 80px rgba(18, 60, 49, 0.08);
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
.mobile-brand {
  display: none;
}
.mobile-credit {
  display: none;
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
    align-content: center;
    gap: 30px;
    padding: 44px 24px;
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
