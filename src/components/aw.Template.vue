<script setup lang="ts">

import ExpandCollapseCard from '@/components/aw.ExpandCollapseCard.vue';


interface Props {
    title?: string;
    expanded?: boolean;
}
  
const props = withDefaults(defineProps<Props>(), {
    expanded: false,
});
  
const emit = defineEmits<{
  'update:expanded': [value: boolean];
}>();

const expanded = computed({
  get: () => props.expanded,
  set: (value) => {
    emit('update:expanded', value);
  }
});
</script>
<template>
  <ExpandCollapseCard
    v-model:expanded="expanded"
    :title="$t('tools.app-workshop.title')"
  >
  
  </ExpandCollapseCard>
</template>
<style scoped></style>