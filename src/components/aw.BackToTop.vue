<script setup lang="ts">
import { useAppTheme } from '@/ui/theme/themes';  
const theme = useAppTheme();
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
        :bgColor="theme.primary.color"
        fontSize="14px"
      >
        <n-button type="primary" circle size="large">
          <template #icon>
            <n-icon :color="theme.levitationBall.iconColor">
              <icon-mdi-chevron-up />
            </n-icon>
          </template>
        </n-button>
      </c-tooltip>
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