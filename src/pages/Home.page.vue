<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useHead } from '@vueuse/head';
import { NSpin } from 'naive-ui';

const router = useRouter();
const { t } = useI18n();

const title = t('tools.app-workshop.title');
const desc = t('tools.app-workshop.description');

useHead({
  title,
  meta: [
    {
      name: 'description',
      content: desc,
    },
    {
      property: 'og:title',
      content: title,
    },
    {
      property: 'og:description',
      content: desc,
    },
  ],
});

onMounted(() => {
  router.replace('/app-workshop');
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <n-spin size="large" />
      <p class="mt-4 text-lg">{{ $t('homepage.text-center') }}</p>
    </div>
  </div>
</template>

<style scoped lang="less">
.height-enter-active,
.height-leave-active {
  transition: all 0.5s ease-in-out;
  overflow: hidden;
  max-height: 500px;
}

.height-enter-from,
.height-leave-to {
  max-height: 42px;
  overflow: hidden;
  opacity: 0;
  margin-bottom: 0;
}

.ghost-favorites-draggable {
  opacity: 0.4;
  background-color: #ccc;
  border: 2px dashed #666;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  transform: scale(1.1);
  animation: ghost-favorites-draggable-animation 0.2s ease-out;
}

@keyframes ghost-favorites-draggable-animation {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 0.4;
    transform: scale(1.0);
  }
}
</style>
