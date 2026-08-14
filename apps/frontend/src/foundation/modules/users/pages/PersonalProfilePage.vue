<template>
  <section class="profile-page" :aria-label="t('users.profile.ariaLabel')">
    <header class="profile-page__hero">
      <div class="profile-page__identity-mark">{{ initials }}</div>
      <div>
        <p>{{ t('users.profile.kicker') }}</p>
        <h2>{{ t('users.profile.title') }}</h2>
        <span>{{ t('users.profile.description') }}</span>
      </div>
      <div class="profile-page__account">
        <small>{{ t('users.fields.username') }}</small>
        <b>{{ profile.username || '—' }}</b>
      </div>
    </header>

    <div class="profile-page__grid">
      <article class="profile-card">
        <div class="profile-card__heading">
          <div>
            <p>{{ t('users.profile.identityKicker') }}</p>
            <h3>{{ t('users.profile.identityTitle') }}</h3>
          </div>
          <span class="profile-card__signal" />
        </div>
        <el-form label-position="top" @submit.prevent="saveProfile">
          <el-form-item :label="t('users.fields.displayName')" required>
            <el-input
              v-model.trim="profile.displayName"
              :placeholder="t('users.dialog.displayNamePlaceholder')"
              maxlength="80"
              show-word-limit
            />
          </el-form-item>
          <el-form-item :label="t('users.fields.email')" required>
            <el-input
              v-model.trim="profile.email"
              type="email"
              :placeholder="t('users.dialog.emailPlaceholder')"
              maxlength="160"
            />
          </el-form-item>
          <el-button type="primary" native-type="submit" :loading="savingProfile">
            {{ t('users.profile.saveProfile') }}
          </el-button>
        </el-form>
      </article>

      <article class="profile-card profile-card--security">
        <div class="profile-card__heading">
          <div>
            <p>{{ t('users.profile.securityKicker') }}</p>
            <h3>{{ t('users.profile.securityTitle') }}</h3>
          </div>
          <span class="profile-card__lock">#</span>
        </div>
        <p class="profile-card__hint">{{ t('users.profile.passwordHint') }}</p>
        <el-form label-position="top" @submit.prevent="savePassword">
          <el-form-item :label="t('users.profile.currentPassword')" required>
            <el-input
              v-model="password.currentPassword"
              type="password"
              show-password
              autocomplete="current-password"
              :placeholder="t('users.profile.currentPasswordPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="t('users.profile.newPassword')" required>
            <el-input
              v-model="password.newPassword"
              type="password"
              show-password
              autocomplete="new-password"
              :placeholder="t('users.dialog.passwordPlaceholder')"
            />
          </el-form-item>
          <el-form-item :label="t('users.profile.confirmPassword')" required>
            <el-input
              v-model="password.confirmPassword"
              type="password"
              show-password
              autocomplete="new-password"
              :placeholder="t('users.profile.confirmPasswordPlaceholder')"
            />
          </el-form-item>
          <el-button type="primary" native-type="submit" :loading="savingPassword">
            {{ t('users.profile.changePassword') }}
          </el-button>
        </el-form>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { clearDynamicRoutes } from '@/foundation/router/dynamicRoutes'
import { useAuthStore } from '@/foundation/modules/auth/auth.store'
import { useNavigationStore } from '@/foundation/modules/navigation/navigation.store'
import { useTagViewStore } from '@/foundation/modules/tag-view/tag-view.store'
import { useLocalization } from '@/foundation/modules/localization/localization'
import { getPersonalProfile, updatePersonalPassword, updatePersonalProfile } from '../users.api'

const router = useRouter()
const auth = useAuthStore()
const navigation = useNavigationStore()
const tagView = useTagViewStore()
const { t } = useLocalization()
const profile = reactive({ username: '', displayName: '', email: '' })
const password = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const savingProfile = ref(false)
const savingPassword = ref(false)
const initials = computed(() => profile.displayName.slice(0, 1).toUpperCase() || 'A')

onMounted(function loadProfile() {
  void loadPersonalProfile()
})

async function loadPersonalProfile(): Promise<void> {
  const response = await getPersonalProfile()
  if (response.status !== 0 || !response.data) {
    ElMessage.error(response.err ?? t('users.profile.errors.loadFailed'))
    return
  }
  profile.username = response.data.username
  profile.displayName = response.data.displayName
  profile.email = response.data.email
}

async function saveProfile(): Promise<void> {
  if (!profile.displayName || !profile.email) {
    ElMessage.error(t('users.profile.errors.invalidProfile'))
    return
  }
  savingProfile.value = true
  try {
    const response = await updatePersonalProfile({
      displayName: profile.displayName,
      email: profile.email,
    })
    if (response.status !== 0 || !response.data) {
      ElMessage.error(response.err ?? t('users.profile.errors.saveFailed'))
      return
    }
    profile.displayName = response.data.displayName
    profile.email = response.data.email
    auth.updateDisplayName(response.data.displayName)
    ElMessage.success(t('users.profile.messages.profileSaved'))
  } finally {
    savingProfile.value = false
  }
}

async function savePassword(): Promise<void> {
  if (password.newPassword.length < 8) {
    ElMessage.error(t('users.profile.errors.invalidPassword'))
    return
  }
  if (password.newPassword !== password.confirmPassword) {
    ElMessage.error(t('users.profile.errors.passwordMismatch'))
    return
  }
  savingPassword.value = true
  try {
    const response = await updatePersonalPassword({
      currentPassword: password.currentPassword,
      newPassword: password.newPassword,
    })
    if ('err' in response) {
      ElMessage.error(
        response.status === 2000 ? t('users.profile.errors.invalidCurrentPassword') : response.err,
      )
      return
    }
    auth.clearSession()
    navigation.clear()
    tagView.deactivate()
    clearDynamicRoutes()
    ElMessage.success(t('users.profile.messages.passwordSaved'))
    await router.replace({ name: 'login' })
  } finally {
    savingPassword.value = false
  }
}
</script>

<style scoped>
.profile-page {
  width: min(100%, 1120px);
  margin: 0 auto;
}

.profile-page__hero {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 24px;
  align-items: center;
  overflow: hidden;
  padding: 30px;
  border-radius: 28px;
  color: var(--hero-foreground);
  background:
    linear-gradient(125deg, var(--hero-start), var(--hero-end)),
    repeating-linear-gradient(
      90deg,
      transparent 0 34px,
      color-mix(in srgb, var(--hero-foreground), transparent 96%) 34px 35px
    );
  box-shadow: 0 22px 58px color-mix(in srgb, var(--hero-start), transparent 72%);
}

.profile-page__hero::after {
  position: absolute;
  top: -80px;
  right: 21%;
  width: 230px;
  height: 230px;
  border: 1px solid color-mix(in srgb, var(--brand-accent), transparent 52%);
  border-radius: 50%;
  box-shadow: 0 0 0 28px color-mix(in srgb, var(--brand-accent), transparent 94%);
  content: '';
}

.profile-page__identity-mark,
.profile-page__hero > div,
.profile-page__account {
  position: relative;
  z-index: 1;
}

.profile-page__identity-mark {
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--brand-accent), transparent 30%);
  border-radius: 22px;
  color: var(--brand-accent);
  background: color-mix(in srgb, var(--ink), transparent 20%);
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
}

.profile-page__hero p,
.profile-card__heading p {
  margin: 0;
  color: var(--brand-accent);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.profile-page__hero h2 {
  margin: 8px 0 7px;
  font-family: var(--font-display);
  font-size: clamp(27px, 4vw, 38px);
  letter-spacing: -0.045em;
}

.profile-page__hero span {
  color: var(--hero-muted);
  font-size: 13px;
}

.profile-page__account {
  display: grid;
  min-width: 150px;
  gap: 6px;
  padding-left: 24px;
  border-left: 1px solid color-mix(in srgb, var(--hero-muted), transparent 68%);
}

.profile-page__account small {
  color: var(--hero-meta);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.profile-page__account b {
  overflow: hidden;
  font-size: 14px;
  text-overflow: ellipsis;
}

.profile-page__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  margin-top: 18px;
}

.profile-card {
  min-height: 390px;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 26px;
  background: color-mix(in srgb, var(--surface), transparent 8%);
  box-shadow: 0 16px 42px color-mix(in srgb, var(--ink), transparent 96%);
}

.profile-card--security {
  background:
    linear-gradient(
      148deg,
      color-mix(in srgb, var(--primary-mist), transparent 38%),
      transparent 56%
    ),
    var(--surface);
}

.profile-card__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.profile-card__heading h3 {
  margin: 8px 0 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 21px;
  letter-spacing: -0.035em;
}

.profile-card__signal {
  width: 10px;
  height: 10px;
  margin-top: 7px;
  border-radius: 50%;
  background: var(--primary-deep);
  box-shadow: 0 0 0 7px var(--primary-mist);
}

.profile-card__lock {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 11px;
  color: var(--primary-deep);
  background: var(--primary-mist);
  font-family: var(--font-display);
  font-weight: 900;
}

.profile-card__hint {
  min-height: 36px;
  margin: -7px 0 18px;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.55;
}

@media (max-width: 760px) {
  .profile-page__hero {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 24px;
  }

  .profile-page__account {
    grid-column: 1 / -1;
    padding-top: 14px;
    padding-left: 0;
    border-top: 1px solid color-mix(in srgb, var(--hero-muted), transparent 68%);
    border-left: 0;
  }

  .profile-page__grid {
    grid-template-columns: 1fr;
  }
}
</style>
