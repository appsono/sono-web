<template>
  <div class="maintenance-page">
    <div class="maintenance-container">
      <div class="maintenance-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
        </svg>
      </div>
      <h1 class="maintenance-title">Under Maintenance</h1>
      <p class="maintenance-message">{{ maintenanceMessage }}</p>
      <div class="maintenance-info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <circle cx="12" cy="8" r="0.75" fill="currentColor"/>
        </svg>
        <span>We'll be back soon. Thank you for your patience.</span>
      </div>
      <button @click="checkStatus" class="retry-button" :disabled="checking">
        <svg v-if="!checking" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        <div v-else class="spinner-small"></div>
        {{ checking ? 'Checking...' : 'Check Status' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import * as api from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const maintenanceMessage = ref('Service temporarily unavailable for maintenance')
const checking = ref(false)

onMounted(async () => {
  await loadMaintenanceStatus()
})

async function loadMaintenanceStatus() {
  try {
    const response = await api.getMaintenanceStatus()
    if (response.data.message) {
      maintenanceMessage.value = response.data.message
    }

    //if maintenance is disabled => redirect appropriately
    if (!response.data.enabled) {
      if (authStore.isAuthenticated) {
        router.push('/')
      } else {
        router.push('/login')
      }
    }
  } catch (err) {
    console.error('Failed to load maintenance status:', err)
    //if error => try to use the error message
    if (err.response?.data?.detail) {
      maintenanceMessage.value = err.response.data.detail
    }
  }
}

async function checkStatus() {
  checking.value = true
  try {
    const response = await api.getMaintenanceStatus()

    //if maintenance is disabled => redirect appropriately
    if (!response.data.enabled) {
      if (authStore.isAuthenticated) {
        router.push('/')
      } else {
        router.push('/login')
      }
    }
  } catch (err) {
    console.error('Failed to check maintenance status:', err)
  } finally {
    checking.value = false
  }
}
</script>

<style scoped>
.maintenance-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: var(--bg-primary);
}

.maintenance-container {
  max-width: 500px;
  width: 100%;
  text-align: center;
  padding: 48px 32px;
}

.maintenance-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 24px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(239, 68, 68);
}

.maintenance-title {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-light);
  margin: 0 0 16px 0;
}

.maintenance-message {
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 32px 0;
  padding: 16px;
  background: var(--bg-surface);
  border-radius: var(--border-radius);
}

.maintenance-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
}

.maintenance-info svg {
  flex-shrink: 0;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--text-light);
  color: var(--text-dark);
  border: none;
  border-radius: var(--border-radius);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.retry-button:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.retry-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .maintenance-container {
    padding: 32px 24px;
  }

  .maintenance-icon {
    width: 100px;
    height: 100px;
  }

  .maintenance-icon svg {
    width: 64px;
    height: 64px;
  }

  .maintenance-title {
    font-size: 24px;
  }

  .maintenance-message {
    font-size: 15px;
  }
}
</style>
