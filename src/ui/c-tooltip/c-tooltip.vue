<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    tooltip?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
    bgColor?: string;
    textColor?: string;
    fontSize?: string;
    padding?: string;
    borderRadius?: string;
  }>(), {
  tooltip: undefined,
  position: 'top',
  bgColor: '#000000',
  textColor: '#FFFFFF',
  fontSize: '14px',
  padding: '6px 12px',
  borderRadius: '4px',
});
const { tooltip, position, bgColor, textColor, fontSize, padding, borderRadius } = toRefs(props);

const targetRef = ref();
const isTargetHovered = useElementHover(targetRef);
const tooltipStyle = computed(() => ({
  backgroundColor: bgColor.value,
  color: textColor.value,
  fontSize: fontSize.value,
  padding: padding.value,
  borderRadius: borderRadius.value,
}));
</script>

<template>
  <div relative inline-block>
    <div ref="targetRef">
      <slot />
    </div>
<!-- class="absolute z-10 whitespace-nowrap rounded bg-black px-12px py-6px text-sm text-white shadow-lg transition transition transition-duration-0.2s" -->
    <div
      v-if="tooltip || $slots.tooltip"
      class="absolute z-10 whitespace-nowrap shadow-lg transition transition-duration-0.2s"
      :class="{
        'op-0 scale-0': isTargetHovered === false,
        'op-100 scale-100': isTargetHovered,
        'bottom-100% left-50% -translate-x-1/2 mb-5px': position === 'top',
        'top-100% left-50% -translate-x-1/2 mt-5px': position === 'bottom',
        'right-100% top-50% -translate-y-1/2 mr-5px': position === 'left',
        'left-100% top-50% -translate-y-1/2 ml-5px': position === 'right',
      }"
      :style="tooltipStyle"
    >
      <slot
        v-if="isTargetHovered"
        name="tooltip"
      >
        {{ tooltip }}
      </slot>
    </div>
  </div>
</template>
