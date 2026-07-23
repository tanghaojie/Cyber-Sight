<template>
  <main class="login-page">
    <section class="visual-panel">
      <div class="orb orb-one"></div><div class="orb orb-two"></div>
      <div class="visual-content">
        <div class="visual-brand"><span class="logo-mark">N</span><span>NOVA</span></div>
        <div class="visual-message">
          <div class="kicker">MANAGEMENT, REFINED</div>
          <h1>让每一次管理<br><em>清晰而从容</em></h1>
          <p>统一身份、角色、菜单与基础数据，以简洁可靠的方式支撑业务持续成长。</p>
          <div class="feature-row"><span><b>01</b>安全会话</span><span><b>02</b>权限基线</span><span><b>03</b>审计追踪</span></div>
        </div>
        <small class="copyright">© 2026 NOVA SYSTEMS</small>
      </div>
    </section>
    <section class="form-panel">
      <form class="login-card" @submit.prevent="handleSubmit">
        <div class="mobile-brand"><span class="logo-mark">N</span><span>NOVA</span></div>
        <div class="form-head"><span>欢迎回来</span><h2>登录管理控制台</h2><p>请输入您的管理员账号和密码</p></div>
        <div class="field"><label for="username">用户名</label><input id="username" v-model.trim="username" class="control" autocomplete="username" placeholder="请输入用户名" required /></div>
        <div class="field"><div class="password-label"><label for="password">密码</label><small>至少 8 个字符</small></div><input id="password" v-model="password" class="control" type="password" autocomplete="current-password" placeholder="请输入密码" minlength="8" required /></div>
        <div v-if="error" class="login-error">{{ error }}</div>
        <button class="login-button" :disabled="auth.busy"><span>{{ auth.busy ? '正在验证...' : '登录' }}</span><span aria-hidden="true">→</span></button>
        <p class="login-hint">本地初始账号：<b>admin</b> / <b>Admin@123456</b></p>
      </form>
    </section>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const username = ref('admin')
const password = ref('Admin@123456')
const error = ref('')

async function handleSubmit() {
  error.value = ''
  const message = await auth.login(username.value, password.value)
  if (message) { error.value = message; return }
  const destination = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
  await router.replace(destination)
}
</script>

<style scoped>
.login-page { min-height: 100vh; display: grid; grid-template-columns: minmax(430px, 1.05fr) minmax(430px, .95fr); background: #fff; }
.visual-panel { position: relative; overflow: hidden; min-height: 100vh; color: #fff; background: radial-gradient(circle at 15% 10%, #285848 0, transparent 36%), linear-gradient(145deg, #173b31 0%, #0d211b 72%); }
.visual-panel::after { position: absolute; inset: 0; opacity: .13; background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px); background-size: 54px 54px; content: ""; mask-image: linear-gradient(to bottom right, #000, transparent 72%); }
.visual-content { position: relative; z-index: 2; min-height: 100vh; display: flex; flex-direction: column; padding: 54px 9%; }
.visual-brand, .mobile-brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: .14em; }
.logo-mark { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 10px; color: #173b31; background: linear-gradient(145deg, #d8ff83, #a8dd3b); font-size: 15px; font-weight: 850; box-shadow: 0 10px 25px rgba(9,30,23,.33); }
.visual-message { max-width: 610px; margin: auto 0; padding: 50px 0; }
.kicker { margin-bottom: 24px; color: #c9ff57; font-size: 11px; font-weight: 800; letter-spacing: .22em; }
.visual-message h1 { margin: 0; color: #f3f4fa; font-size: clamp(45px, 5vw, 72px); font-weight: 680; letter-spacing: -.04em; line-height: 1.18; }
.visual-message h1 em { color: #c9ff57; font-style: normal; }
.visual-message p { max-width: 480px; margin: 28px 0 0; color: #858b9e; font-size: 15px; line-height: 1.85; }
.feature-row { display: flex; gap: 28px; margin-top: 45px; color: #a7abba; font-size: 11px; }.feature-row span { display: grid; gap: 7px; }.feature-row b { color: #82a794; font-size: 10px; letter-spacing: .12em; }
.copyright { color: #464b5e; font-size: 9px; letter-spacing: .13em; }
.orb { position: absolute; z-index: 1; border-radius: 50%; filter: blur(1px); }.orb-one { right: -120px; top: 18%; width: 310px; height: 310px; border: 1px solid rgba(201,255,87,.16); box-shadow: inset 0 0 70px rgba(201,255,87,.05); }.orb-two { left: 44%; bottom: -150px; width: 390px; height: 390px; background: radial-gradient(circle, rgba(68,139,105,.18), transparent 68%); }
.form-panel { display: grid; place-items: center; padding: 56px 9%; background: radial-gradient(circle at 90% 0, #eef4ed, transparent 40%), #fff; }
.login-card { width: min(100%, 410px); display: grid; gap: 22px; }
.form-head { margin-bottom: 13px; }.form-head > span { color: var(--primary); font-size: 12px; font-weight: 750; letter-spacing: .08em; }.form-head h2 { margin: 12px 0 8px; color: #1d2435; font-size: 31px; letter-spacing: -.03em; }.form-head p { margin: 0; color: #8a91a1; font-size: 13px; }
.password-label { display: flex; justify-content: space-between; }.password-label small { color: #a1a7b4; font-size: 10px; }
.control { min-height: 50px; border-radius: 12px; background: #fbfbfd; }
.login-button { min-height: 52px; display: flex; align-items: center; justify-content: space-between; margin-top: 5px; padding: 0 18px 0 22px; border: 0; border-radius: 12px; color: #173b31; background: linear-gradient(135deg, #d2ff72, #addf45); font-weight: 800; box-shadow: 0 13px 30px rgba(70,112,51,.2); transition: 170ms; }.login-button:hover { transform: translateY(-1px); box-shadow: 0 16px 34px rgba(70,112,51,.28); }.login-button:disabled { opacity: .65; transform: none; }
.login-error { padding: 11px 13px; border: 1px solid #f3cdd2; border-radius: 10px; color: #bb3547; background: #fff5f6; font-size: 12px; }
.login-hint { margin: -7px 0 0; color: #a0a6b2; font-size: 11px; text-align: center; }.login-hint b { color: #747b8b; }.mobile-brand { display: none; color: #2a3144; }
@media (max-width: 860px) { .login-page { grid-template-columns: 1fr; }.visual-panel { display: none; }.form-panel { min-height: 100vh; padding: 42px 24px; }.mobile-brand { display: flex; margin-bottom: 32px; } }
</style>
