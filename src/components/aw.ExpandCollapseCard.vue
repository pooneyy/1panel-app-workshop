<script setup lang="ts">
  interface Props {
    title?: string;
    expanded?: boolean;
  }
  withDefaults(defineProps<Props>(), {
    expanded: false,
  });
  defineEmits<{
    'update:expanded': [value: boolean];
  }>();
</script>
<template>
  <n-card mb-4>
    <template #header>
      <div 
        class="expand-collapse-card-header"
        @click="$emit('update:expanded', !expanded)"
      >
        <span class="expand-collapse-card-title">
          <slot name="title">{{ title }}</slot>
        </span>
        <n-button 
          type="primary" 
          size="small"
          text
          @click.stop="$emit('update:expanded', !expanded)"
        >
          <template #icon>
            <n-icon>
              <svg v-if="expanded" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m18 15-6-6-6 6"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </n-icon>
          </template>
          {{ expanded ? $t('tools.app-workshop.components.collapse') : $t('tools.app-workshop.components.expand') }}
        </n-button>
      </div>
    </template>
    <div v-show="expanded">
      <slot />
    </div>
  </n-card>
</template>
<style scoped>
  .expand-collapse-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 8px 0;
    cursor: pointer;
  }
  .expand-collapse-card-title {
    font-weight: 500;
    font-size: 16px;
  }
</style>