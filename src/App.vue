<template>
  <div id="app" :class="{ 'has-player': playerStore.hasTrack }">
    <RouterView v-if="isAuthRoute" />

    <template v-else>
      <AppHeader />

      <main class="app-main">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>

      <AppPlayer v-if="playerStore.hasTrack" />
      <FullscreenPlayer v-if="playerStore.isFullscreenPlayer" />

      <ConsentModal v-if="authStore.needsConsent" />
      <Walkthrough v-if="authStore.isAuthenticated" />

      <CreateCollectionModal v-if="uiStore.activeModal === 'create'" />
      <EditCollectionModal v-if="uiStore.activeModal === 'edit-collection'" />
      <EditAudioFileModal v-if="uiStore.activeModal === 'edit-audio'" />
      <AddTracksModal v-if="uiStore.activeModal === 'add-tracks'" />
      <ManageSongsModal v-if="uiStore.activeModal === 'manage-songs'" />
      <ConfirmModal
        v-if="uiStore.activeModal === 'confirm'"
        v-bind="uiStore.modalData"
        @confirm="handleConfirmModalConfirm"
        @cancel="handleConfirmModalCancel"
      />
    </template>

    <div v-if="uiStore.isGlobalLoading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>{{ uiStore.loadingMessage }}</p>
    </div>

    <div class="notifications">
      <TransitionGroup name="notification">
        <div
          v-for="notification in uiStore.notifications"
          :key="notification.id"
          :class="['notification', `notification-${notification.type}`]"
          @click="uiStore.removeNotification(notification.id)"
        >
          <div class="notification-icon">
            <svg v-if="notification.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            <svg v-else-if="notification.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            <svg v-else-if="notification.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          </div>
          <span class="notification-message">{{ notification.message }}</span>
          <div v-if="notification.duration > 0" class="notification-progress" :style="{ animationDuration: notification.duration + 'ms' }"></div>
        </div>
      </TransitionGroup>
    </div>

    <audio ref="audioElement" />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { usePlayerStore } from '@/stores/player'
import { useUIStore } from '@/stores/ui'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppPlayer from '@/components/layout/AppPlayer.vue'
import FullscreenPlayer from '@/components/layout/FullscreenPlayer.vue'
import ConsentModal from '@/components/modals/ConsentModal.vue'
import Walkthrough from '@/components/walkthrough/Walkthrough.vue'
import CreateCollectionModal from '@/components/modals/CreateCollectionModal.vue'
import EditCollectionModal from '@/components/modals/EditCollectionModal.vue'
import EditAudioFileModal from '@/components/modals/EditAudioFileModal.vue'
import AddTracksModal from '@/components/modals/AddTracksModal.vue'
import ManageSongsModal from '@/components/modals/ManageSongsModal.vue'
import ConfirmModal from '@/components/modals/ConfirmModal.vue'

const route = useRoute()
const authStore = useAuthStore()
const playerStore = usePlayerStore()
const uiStore = useUIStore()

const audioElement = ref(null)

const isAuthRoute = computed(() => {
  return route.meta.requiresGuest === true
})

onMounted(() => {
  //"start" audio player
  if (audioElement.value) {
    playerStore.setAudioElement(audioElement.value)
  }
})

function handleConfirmModalConfirm() {
  const callback = uiStore.modalData?.onConfirm
  uiStore.closeModal()
  if (callback && typeof callback === 'function') {
    callback()
  }
}

function handleConfirmModalCancel() {
  const { onCancel } = uiStore.modalData || {}
  if (onCancel && typeof onCancel === 'function') {
    onCancel()
  }
  uiStore.closeModal()
}
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: var(--header-height);
}

#app.has-player .app-main {
  padding-bottom: 112px;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 9999;
  backdrop-filter: blur(4px);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--border-light-10);
  border-top-color: var(--text-light);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.notifications {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
}

.notification {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: var(--border-radius);
  background: rgba(30, 30, 30, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border-light-10);
  box-shadow: var(--shadow-xl);
  cursor: pointer;
  font-size: 13px;
  line-height: 1.45;
  color: var(--text-primary);
  overflow: hidden;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.notification:hover {
  background: rgba(40, 40, 40, 0.9);
  border-color: var(--border-light-20);
}

.notification-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.notification-message {
  flex: 1;
  min-width: 0;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  animation: notificationTimer linear forwards;
}

@keyframes notificationTimer {
  from { width: 100%; }
  to { width: 0%; }
}

.notification-success .notification-icon {
  background: rgba(40, 167, 69, 0.15);
  color: #98ea83;
}
.notification-success .notification-progress {
  background: #98ea83;
}

.notification-error .notification-icon {
  background: rgba(220, 53, 69, 0.15);
  color: #cc5f5f;
}
.notification-error .notification-progress {
  background: #cc5f5f;
}

.notification-warning .notification-icon {
  background: rgba(255, 193, 7, 0.15);
  color: #ffd454;
}
.notification-warning .notification-progress {
  background: #ffd454;
}

.notification-info .notification-icon {
  background: rgba(13, 110, 253, 0.15);
  color: #7db8f5;
}
.notification-info .notification-progress {
  background: #7db8f5;
}

.notification-enter-active,
.notification-leave-active {
  transition: all var(--transition-normal);
}

.notification-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

@media (max-width: 768px) {
  .notifications {
    left: 12px;
    right: 12px;
    bottom: 12px;
    max-width: none;
  }
}
</style>