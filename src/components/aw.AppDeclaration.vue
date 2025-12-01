<script setup lang="ts">
import { Download as IconDownload } from '@vicons/tabler';
import ExpandCollapseCard from '@/components/aw.ExpandCollapseCard.vue';
interface Props {
  title?: string;
  expanded?: boolean;
  downloadAppDeclaration?: () => void;
  appDeclarationYaml?: string;
}
const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  downloadAppDeclaration: () => {},
  appDeclarationYaml: ''
});
const emit = defineEmits<{
  'update:expanded': [value: boolean];
  'downloadAppDeclaration': [value: void];
  'update:appDeclarationYaml': [value: string]
}>();
const expanded = computed({
  get: () => props.expanded,
  set: (value) => {
    emit('update:expanded', value);
  }
});
const appDeclarationYaml = computed({
  get: () => props.appDeclarationYaml,
  set: (value) => {
    emit('update:appDeclarationYaml', value);
  }
});
</script>
<template>
  <ExpandCollapseCard
    v-model:expanded="expanded"
    :title="$t('tools.app-workshop.cards.AppDeclaration.title')"
  >
    <n-alert type="info" mb-2>
      {{ $t('tools.app-workshop.cards.AppDeclaration.note') }}
    </n-alert>
    <div mb-4>
      <n-button @click="$emit('downloadAppDeclaration')" type="primary" block>
        <template #icon>
          <n-icon><IconDownload /></n-icon>
        </template>
        {{ $t('tools.app-workshop.components.downloadAppDeclaration') }} (data.yml)
      </n-button>
    </div>
    <TextareaCopyable :value="appDeclarationYaml" language="yaml" />
  </ExpandCollapseCard>
</template>
<style scoped>
</style>