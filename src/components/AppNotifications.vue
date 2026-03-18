<template>
  <div class="notice-stack" aria-live="polite" aria-atomic="true">
    <transition-group name="notice-fade" tag="div">
      <div
        v-for="item in notifications"
        :key="item.id"
        class="notice-item"
        :class="`notice-${item.type}`"
      >
        <span class="notice-dot"></span>
        <span>{{ item.message }}</span>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { notifications } from '../utils/notify'
</script>

<style scoped>
.notice-stack {
  position: fixed;
  top: 96px;
  right: 5%;
  z-index: 1200;
  display: grid;
  gap: 10px;
  width: min(92vw, 340px);
  pointer-events: none;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 10px;
  border-radius: 14px;
  padding: 12px 14px;
  font-size: 0.92rem;
  font-weight: 600;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.95);
  color: #0f172a;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.09);
}

.notice-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #0f172a;
  flex-shrink: 0;
}

.notice-success {
  border-color: #bbf7d0;
}

.notice-success .notice-dot {
  background: #15803d;
}

.notice-error {
  border-color: #fecaca;
}

.notice-error .notice-dot {
  background: #dc2626;
}

.notice-info {
  border-color: #cbd5e1;
}

.notice-info .notice-dot {
  background: #0f172a;
}

.notice-fade-enter-active,
.notice-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.notice-fade-enter-from,
.notice-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 640px) {
  .notice-stack {
    top: 82px;
    right: 16px;
    left: 16px;
    width: auto;
  }
}
</style>