import { useDark, useMediaQuery, useToggle } from '@vueuse/core';
import { defineStore } from 'pinia';
import { type Ref, watch } from 'vue';
import { useITStorage } from '@/composable/queryParams';

export const useStyleStore = defineStore('style', {
  state: () => {
    const isDarkTheme = useDark();
    const toggleDark = useToggle(isDarkTheme);
    const isSmallScreen = useMediaQuery('(max-width: 700px)');
    // const isMenuCollapsed = useITStorage('isMenuCollapsed', isSmallScreen.value) as Ref<boolean>;
    const isMenuCollapsed = useITStorage('isMenuCollapsed', true) as Ref<boolean>; // 默认隐藏侧边栏

    watch(isSmallScreen, v => (isMenuCollapsed.value = v));

    return {
      isDarkTheme,
      toggleDark,
      isMenuCollapsed,
      isSmallScreen,
    };
  },
});
