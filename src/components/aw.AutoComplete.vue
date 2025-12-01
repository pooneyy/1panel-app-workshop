<script setup lang="ts">
import { computed } from 'vue';
interface Props {
  value?: string;
  options?: any[];
  placeholder?: string;
}
const props = withDefaults(defineProps<Props>(), {
  value: '',
  options: () => [],
  placeholder: ''
});
const emit = defineEmits<{
  'update:value': [value: string];
}>();
const modelValue = computed({
  get: () => props.value,
  set: (value) => {
    emit('update:value', value);
  }
});
</script>
<template>
  <n-auto-complete
    v-model:value="modelValue"
    :options="options"
    :placeholder="placeholder"
    clearable
    :menu-props="{
      class: 'pretty-scrollbar',
      style: {
        maxHeight: `${7 * 34 + 8}px`, // 每项34px，高度限制为7项，加上8px的padding
        '--n-height': 'auto',
        overflowY: 'auto',
      }
    }"
  />
</template>