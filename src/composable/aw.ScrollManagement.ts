import { storeToRefs } from 'pinia';
import { useReactiveReferenceStore } from '@/stores/aw.store';
export interface ScrollManagement {
  /**
   * 滚动到页面顶部的函数
   * 
   * 查找页面中所有类名为'n-layout-scroll-container'的元素，
   * 然后将最后一个元素的滚动位置设置到顶部，并使用平滑滚动效果
   */
  scrollToTop: () => void;
  /**
   * 处理滚动事件的函数
   * 
   * 用于检测页面滚动位置，并据此显示或隐藏返回顶部按钮，同时记录当前滚动位置
   */
  handleScroll: () => void;
  /**
   * 设置滚动位置的函数
   * 
   * 在DOM更新后，延迟执行滚动操作
   */
  setScrollPosition: () => void;
  /**
   * 管理滚动事件监听器的函数
   * 
   * 查找所有具有'n-layout-scroll-container'类的元素，
   * 并为这些元素添加滚动事件监听器（当内容超出可视区域时）
   */
  manageScrollListeners: () => void;
}
export function useScrollManagement(): ScrollManagement {
  const { showBackToTop, scrollPosition } = storeToRefs(useReactiveReferenceStore())
  // 回到顶部
  const scrollToTop = () => {
    const elements = document.querySelectorAll('.n-layout-scroll-container');
    const lastElement = elements[elements.length - 1] as HTMLElement;
    lastElement.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleScroll = () => {
    const elements = document.querySelectorAll('.n-layout-scroll-container');
    const lastElement = elements[elements.length - 1] as HTMLElement;
    if (lastElement) {
      const currentScroll = lastElement.scrollTop;
      showBackToTop.value = currentScroll > 650;
      scrollPosition.value = currentScroll;
    }
  };
  // 恢复滚动位置
  const setScrollPosition = () => {
    nextTick(() => {
      setTimeout(() => {
        const elements = document.querySelectorAll('.n-layout-scroll-container');
        const lastElement = elements[elements.length - 1] as HTMLElement;
        if (lastElement && scrollPosition.value > 0) {
          lastElement.scrollTo({ top: scrollPosition.value, behavior: 'smooth' });
        }
      }, 100);
    });
  };
  // 添加滚动事件监听器
  const manageScrollListeners = () => {
    const elements = document.querySelectorAll('.n-layout-scroll-container');
    elements.forEach(el => {
      const element = el as HTMLElement;
      if (element.scrollHeight > element.clientHeight) {
        element.addEventListener('scroll', handleScroll, { passive: true });
      }
    });
  };
  return { scrollToTop, handleScroll, manageScrollListeners, setScrollPosition };
}