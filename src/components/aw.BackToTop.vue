<script setup lang="ts">
interface Props {
  showBackToTop?: boolean;
  scrollToTop?: () => void;
}
withDefaults(defineProps<Props>(), {
  showBackToTop: false,
});
defineEmits<{
  'update:showBackToTop': [value: boolean];
  'scrollToTop': [];
}>();
</script>
<template>
  <transition name="fade">
    <div
      v-if="showBackToTop"
      class="back-to-top-btn"
      @click="$emit('scrollToTop')"
    >
      <c-tooltip
        :tooltip="$t('tools.app-workshop.components.backToTop')"
        position="left"
        bgColor="#18a058"
        textColor="#fff"
        fontSize="14px"
      >
        <n-button type="primary" circle size="large">
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </n-icon>
          </template>
        </n-button>
      </c-tooltip>
      <!-- <div class="btn-text" v-html="$t('tools.app-workshop.components.backToTop')" /> -->
    </div>
  </transition>
</template>
<style scoped>
.back-to-top-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.back-to-top-btn:hover {
  transform: translateY(-2px);
}
.btn-text {
  margin-top: 8px;
  font-size: 12px;
  color: #18a058;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>