<template>
  <Teleport to="body">
    <div v-if="show" class="bottom-sheet-overlay" @click.self="$emit('close')">
      <div class="bottom-sheet" :class="{ 'sheet-visible': show }">
        <div class="sheet-handle"></div>
        <h3 v-if="title" class="sheet-title">{{ title }}</h3>
        <div class="sheet-options">
          <button
            v-for="(option, i) in options"
            :key="i"
            class="sheet-option"
            :class="{ 'sheet-option-danger': option.danger, 'sheet-option-disabled': option.disabled }"
            :disabled="option.disabled"
            @click="handleOption(option)"
          >
            <span v-if="option.icon" class="sheet-option-icon" v-html="option.icon"></span>
            <span class="sheet-option-label">{{ option.label }}</span>
          </button>
        </div>
        <button class="sheet-cancel" @click="$emit('close')">Cancel</button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: null
  },
  options: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

function handleOption(option) {
  if (option.disabled) return
  if (option.action) option.action()
  emit('close')
}
</script>

<style scoped>
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 2000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.bottom-sheet {
  background: var(--bg-container);
  border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
  width: 100%;
  max-width: 480px;
  padding: 12px 16px 24px;
  animation: sheetSlideUp 0.3s ease;
}

@keyframes sheetSlideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.sheet-handle {
  width: 36px;
  height: 4px;
  background: var(--bg-surface-hover);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.sheet-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-light);
  margin: 0 0 12px 4px;
}

.sheet-options {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sheet-option {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 12px;
  border-radius: var(--border-radius-sm);
  background: transparent;
  border: none;
  color: var(--text-light);
  font-size: 15px;
  cursor: pointer;
  transition: background var(--transition-fast);
  text-align: left;
  width: 100%;
}

.sheet-option:hover {
  background: var(--bg-surface);
}

.sheet-option-danger {
  color: #ef4444;
}

.sheet-option-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.sheet-option-disabled:hover {
  background: transparent;
}

.sheet-option-icon {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: inherit;
}

.sheet-option-icon :deep(svg) {
  width: 20px;
  height: 20px;
}

.sheet-option-label {
  flex: 1;
}

.sheet-cancel {
  display: block;
  width: 100%;
  margin-top: 8px;
  padding: 14px;
  border-radius: var(--border-radius-sm);
  background: var(--bg-surface);
  border: none;
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.sheet-cancel:hover {
  background: var(--bg-surface-hover);
  color: var(--text-light);
}

@media (min-width: 481px) {
  .bottom-sheet {
    border-radius: var(--border-radius-lg);
    margin-bottom: 24px;
  }
}
</style>