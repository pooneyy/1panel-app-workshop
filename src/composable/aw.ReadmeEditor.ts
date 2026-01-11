import { storeToRefs } from 'pinia';
import { useReactiveReferenceStore } from '@/stores/aw.store';
import type { ReadmeSection } from '@/composable/aw.defind';
export function useReadmeEditor() {
  const { t } = useI18n();
  const {
    // 卡片展开状态相关
    enabledUpdateReadmeWatch,
    // 自述文件编辑模板卡片表单相关
    defaultUsername, defaultPassword, readmeContentZH, readmeContentEN, readmeSections,
    dragStartIndex, draggedSection, dragOverIndex, isDragging, swapPositions,
    // 自述文件编辑器卡片相关
    descZh, descEn,
    // 应用参数配置及 DockerCompose 卡片表单相关
    appForm,
    // 强制刷新列表
    listRefreshCounter, suppressListRefresh,
  } = storeToRefs(useReactiveReferenceStore())
  const {updateReadmeContent} = useReactiveReferenceStore()
  // 标记 drop 是否已处理，避免重复重排
  let dropHandled = false;
  // 修改公用段落配置，初始化时设置默认内容
  const cleanContent = (content: string): string => {
    if (!content.trim()) return content;
    const lines = content.split('\n');
    const cleanedLines: string[] = [];
    let lastLineWasEmpty = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isEmpty = line.trim() === '';
      // 避免连续的空行
      if (isEmpty && lastLineWasEmpty) {
        continue;
      }
      cleanedLines.push(line);
      lastLineWasEmpty = isEmpty;
    }
    // 移除开头和结尾的空行
    while (cleanedLines.length > 0 && cleanedLines[0].trim() === '') {
      cleanedLines.shift();
    }
    while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1].trim() === '') {
      cleanedLines.pop();
    }
    return cleanedLines.join('\n');
  };
  // 将编辑器内容分配到各个段落
  const distributeContentToSections = () => {
    const zhContent = readmeContentZH.value;
    const enContent = readmeContentEN.value;
    // 重置所有段落的内容标记
    const sectionsCopy = [...readmeSections.value];
    // 分配中文内容
    distributeContentByLanguage(zhContent, 'zh', sectionsCopy);
    // 分配英文内容
    distributeContentByLanguage(enContent, 'en', sectionsCopy);
    // 更新段落数组
    readmeSections.value = sectionsCopy;
  };
  // 按语言分配内容到段落
  const distributeContentByLanguage = (content: string, lang: 'zh' | 'en', sections: ReadmeSection[]) => {
    if (!content.trim()) return;
    const lines = content.split('\n');
    let currentSection: ReadmeSection | null = null;
    let currentContent: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // 检查是否是标题行
      if (line.startsWith('## ')) {
        // 保存上一个段落的内容
        if (currentSection && currentContent.length > 0) {
          // 移除末尾的连续空行
          while (currentContent.length > 0 && currentContent[currentContent.length - 1].trim() === '') {
            currentContent.pop();
          }
          const contentStr = currentContent.join('\n');
          if (contentStr.trim()) {
            if (lang === 'zh') {
              currentSection.contentZH = contentStr;
            } else {
              currentSection.contentEN = contentStr;
            }
            currentSection.hasCustomContent = true;
          }
          currentContent = [];
        }
        // 开始新的段落
        const titleText = line.replace('## ', '').trim();
        // 根据标题找到对应的段落
        currentSection = sections.find(section => {
          const sectionTitle = t(section.title, {}, { locale: lang });
          return sectionTitle === titleText || titleText.includes(sectionTitle) || sectionTitle.includes(titleText);
        }) || null;
        if (!currentSection) {
          currentSection = sections.find(section => {
            const expectedTitle = t(section.title, {}, { locale: lang });
            return expectedTitle === titleText;
          }) || null;
        }
      } else if (currentSection) {
        // 将内容添加到当前段落（包括空行）
        currentContent.push(line);
      }
    }
    // 最后一个段落
    if (currentSection && currentContent.length > 0) {
      // 移除末尾的连续空行
      while (currentContent.length > 0 && currentContent[currentContent.length - 1].trim() === '') {
        currentContent.pop();
      }
      const contentStr = currentContent.join('\n');
      if (contentStr.trim()) {
        if (lang === 'zh') {
          currentSection.contentZH = contentStr;
        } else {
          currentSection.contentEN = contentStr;
        }
        currentSection.hasCustomContent = true;
      }
    }
  };
  // 拖拽处理
  let floatingClone: HTMLElement | null = null;
  let cloneOffsetX = 0;
  let cloneOffsetY = 0;
  
  /**
   * 处理拖拽开始事件的函数
   * @param event - 拖拽事件对象
   * @param index - 当前拖拽元素的索引位置
   */
  const handleDragStart = (event: DragEvent, index: number) => {
    dragStartIndex.value = index;
    draggedSection.value = readmeSections.value[index];
    isDragging.value = true;
    const target = event.currentTarget as HTMLElement;
    // 创建一个跟随鼠标的克隆元素
    const rect = target.getBoundingClientRect();
    cloneOffsetX = event.clientX - rect.left;
    cloneOffsetY = event.clientY - rect.top;
    floatingClone = target.cloneNode(true) as HTMLElement;
    floatingClone.style.position = 'fixed';
    floatingClone.style.left = `${event.clientX - cloneOffsetX}px`;
    floatingClone.style.top = `${event.clientY - cloneOffsetY}px`;
    floatingClone.style.width = `${rect.width}px`;
    floatingClone.style.height = `${rect.height}px`;
    floatingClone.style.margin = '0';
    floatingClone.style.padding = getComputedStyle(target).padding;
    floatingClone.style.display = getComputedStyle(target).display;
    floatingClone.style.flexDirection = getComputedStyle(target).flexDirection;
    floatingClone.style.alignItems = getComputedStyle(target).alignItems;
    floatingClone.style.justifyContent = getComputedStyle(target).justifyContent;
    floatingClone.style.gap = getComputedStyle(target).gap;
    floatingClone.style.flexWrap = getComputedStyle(target).flexWrap;
    floatingClone.style.zIndex = '10000';
    floatingClone.style.pointerEvents = 'none';
    floatingClone.style.opacity = '0.95';
    floatingClone.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    floatingClone.style.transform = 'none';
    floatingClone.style.transition = 'none';
    floatingClone.classList.remove('dragging-active');
    floatingClone.classList.add('clone-being-dragged');
    const prefixElement = floatingClone.querySelector('.n-list-item__prefix') as HTMLElement;
      if (prefixElement) {
        const originalPrefixElement = target.querySelector('.n-list-item__prefix') as HTMLElement;
        if (originalPrefixElement) {
          prefixElement.style.marginRight = getComputedStyle(originalPrefixElement).marginRight;
        }
      }
    const sectionHeader = floatingClone.querySelector('.section-header') as HTMLElement;
    if (sectionHeader) {
      const originalSectionHeader = target.querySelector('.section-header') as HTMLElement;
      if (originalSectionHeader) {
        sectionHeader.style.display = getComputedStyle(originalSectionHeader).display;
        sectionHeader.style.alignItems = getComputedStyle(originalSectionHeader).alignItems;
        sectionHeader.style.justifyContent = getComputedStyle(originalSectionHeader).justifyContent;
        sectionHeader.style.width = getComputedStyle(originalSectionHeader).width;
        sectionHeader.style.gap = getComputedStyle(originalSectionHeader).gap;
      }
    }
    const credentialsInputs = floatingClone.querySelector('.credentials-inputs') as HTMLElement;
    if (credentialsInputs) {
      const originalCredentialsHeader = target.querySelector('.credentials-inputs') as HTMLElement;
      if (originalCredentialsHeader) {
        credentialsInputs.style.display = getComputedStyle(originalCredentialsHeader).display;
        credentialsInputs.style.alignItems = getComputedStyle(originalCredentialsHeader).alignItems;
        credentialsInputs.style.justifyContent = getComputedStyle(originalCredentialsHeader).justifyContent;
        credentialsInputs.style.width = getComputedStyle(originalCredentialsHeader).width;
        credentialsInputs.style.gap = getComputedStyle(originalCredentialsHeader).gap;
      }
      const inputElements = credentialsInputs.querySelectorAll('.n-input');
      const originalInputElements = target.querySelectorAll('.credentials-inputs .n-input');
      inputElements.forEach((input, index) => {
        if (originalInputElements[index]) {
          const inputEl = input as HTMLElement;
          const originalInputEl = originalInputElements[index] as HTMLElement;
          inputEl.style.minWidth = getComputedStyle(originalInputEl).minWidth;
        }
      });
    }
    document.body.appendChild(floatingClone);
    // 原始元素添加拖拽中的样式
    target.classList.add('dragging-active');
    // 添加全局拖拽样式
    document.body.classList.add('drag-in-progress');
    // 监听 document 的 dragover 事件来更新克隆元素位置
    document.addEventListener('dragover', updateClonePosition);
  };
  
  /**
   * 更新克隆元素位置跟随鼠标
   */
  const updateClonePosition = (event: DragEvent) => {
    if (!floatingClone) return;
    event.preventDefault();
    floatingClone.style.left = `${event.clientX - cloneOffsetX}px`;
    floatingClone.style.top = `${event.clientY - cloneOffsetY}px`;
  };
  /**
   * 处理拖拽悬停事件的函数
   * @param {DragEvent} event - 拖拽事件对象
   * @param {number} index - 当前悬停元素的索引
   */
  const handleDragOver = (event: DragEvent, index: number) => {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (dragStartIndex.value === null) {
      return;
    }
    // 允许拖拽回到原位置（取消之前的交换）
    // 只记录目标位置，不修改数组
    const fromIndex = dragStartIndex.value;
    const toIndex = index;
    
    // 如果拖回到原位置，重置交换位置
    if (fromIndex === toIndex) {
      swapPositions.value = null;
      dragOverIndex.value = null;
      return;
    }
    
    // 记录交换位置用于视觉反馈
    swapPositions.value = { from: fromIndex, to: toIndex };
    // 不修改实际数组，只更新视觉位置
    dragOverIndex.value = toIndex;
  };
  /**
   * 处理拖拽离开事件的函数
   * 
   * 当用户将拖拽的元素离开目标区域时触发
   * @param event - DragEvent 拖拽事件对象
   */
  const handleDragLeave = (event: DragEvent) => {
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('drag-over');
    }
  };
  /**
   * 处理拖拽放置事件的函数
   * @param event - 拖拽事件对象，包含拖拽相关信息
   * @param dropIndex - 放置目标位置的索引
   */
  const handleDrop = (event: DragEvent, dropIndex: number) => {
    event.preventDefault();
    const target = event.currentTarget as HTMLElement;
    if (target) {
      target.classList.remove('drag-over');
    }
    // 只在拖拽结束时实际修改数组
    if (dragStartIndex.value !== null && swapPositions.value !== null) {
      const from = dragStartIndex.value;
      const to = swapPositions.value.to;
      
      // 只有当位置真的发生变化时才进行数组操作
      if (from !== to && to >= 0 && to < readmeSections.value.length) {
        const sections = [...readmeSections.value];
        const [movedItem] = sections.splice(from, 1);
        sections.splice(to, 0, movedItem);
        readmeSections.value = sections;
        // 在下一个事件循环中更新内容，避免影响拖放事件流
        setTimeout(() => {
          updateReadmeContent();
        }, 0);
        dropHandled = true;
      }
    }
    resetDragState();
  };
  /**
   * 处理拖拽结束后的操作
   * 
   * 在完成拖拽动作后被调用
   * 
   * 负责更新内容和重置拖拽状态
   */
  const handleDragEnd = () => {
    // 移除 dragover 监听器
    document.removeEventListener('dragover', updateClonePosition);
    // 移除浮动克隆
    if (floatingClone && floatingClone.parentNode) {
      floatingClone.parentNode.removeChild(floatingClone);
      floatingClone = null;
    }
    // 如果 drop 未触发且有有效的交换位置，使用最后的悬停位置进行重排
    if (!dropHandled && dragStartIndex.value !== null && swapPositions.value !== null) {
      const from = dragStartIndex.value;
      const to = swapPositions.value.to;
      
      // 只有当位置真的发生变化时才进行数组操作
      if (from !== to && to >= 0 && to < readmeSections.value.length) {
        const sections = [...readmeSections.value];
        const [movedItem] = sections.splice(from, 1);
        sections.splice(to, 0, movedItem);
        readmeSections.value = sections;
        // 在下一个事件循环中更新内容，避免影响拖放事件流
        setTimeout(() => {
          updateReadmeContent();
        }, 0);
      }
    }
    // 拖拽结束后确保内容正确更新
    resetDragState();
  };
  // 重置拖拽状态
  const resetDragState = () => {
    // 移除 dragover 监听器
    document.removeEventListener('dragover', updateClonePosition);
    // 移除浮动克隆
    if (floatingClone && floatingClone.parentNode) {
      floatingClone.parentNode.removeChild(floatingClone);
      floatingClone = null;
    }
    document.querySelectorAll('.section-item').forEach(el => {
      el.classList.remove('dragging-active', 'drag-over', 'swap-animation');
    });
    document.body.classList.remove('drag-in-progress');
    // 重置状态
    dragStartIndex.value = null;
    dragOverIndex.value = null;
    draggedSection.value = null;
    isDragging.value = false;
    swapPositions.value = null;
    dropHandled = false;
  };
  // 计算项目是否应该显示交换动画
  /**
   * 判断指定索引位置是否应该显示交换动画
   * @param index - 需要检查的索引位置
   * @returns 如果该位置是交换动画的起始或目标位置则返回true，否则返回false
   */
  const shouldShowSwapAnimation = (index: number) => {
    if (!swapPositions.value || !isDragging.value) return false;
    const { from, to } = swapPositions.value;
    // 只给需要移动的元素添加动画类
    return index !== from && ((from < to && index > from && index <= to) || (from > to && index >= to && index < from));
  };
  // 计算项目的变换位置
  /**
   * 根据拖拽位置计算项目元素的变换样式
   * @param {number} index - 当前项目的索引
   * @returns {string} - 返回变换样式字符串，如'translateY(-100%)'表示向上移动一个项目高度
   */
  const getItemTransform = (index: number) => {
    if (!swapPositions.value || !isDragging.value || dragStartIndex.value === null) return '';
    const { from, to } = swapPositions.value;
    if (index === from) {
      return '';
    }
    // 计算其他项目的移动方向
    if (from < to) {
      // 向下拖拽，from到to之间的项目向上移动
      if (index > from && index <= to) {
        return 'translateY(-100%)';
      }
    } else {
      // 向上拖拽，to到from之间的项目向下移动
      if (index >= to && index < from) {
        return 'translateY(100%)';
      }
    }
    return '';
  };
  /**
   * 切换段落启用状态
   * @param index - 要切换的章节索引
   */
  const toggleSection = (index: number) => {
    const section = readmeSections.value[index];
    // 在切换状态前，确保当前编辑器内容已经分配到各个段落
    distributeContentToSections();
    section.enabled = !section.enabled;
    // 更新显示的内容
    if (enabledUpdateReadmeWatch.value) {
      updateReadmeContent();
    }
  };
  /**
   * 初始化自述文件编辑器的监听器
   */
  const initReadmeEditorWatchListeners = () => {
    watch([readmeContentZH, readmeContentEN], () => {
      if (!enabledUpdateReadmeWatch.value) return;
      // 清理内容中的多余空行
      readmeContentZH.value = cleanContent(readmeContentZH.value);
      readmeContentEN.value = cleanContent(readmeContentEN.value);
      // 然后将内容分配到各个段落
      distributeContentToSections();
    }, { deep: true });
    // 监听应用描述变化，更新介绍段落的默认内容
    watch([descZh, descEn], () => {
      const introSection = readmeSections.value.find(section => section.type === 'introduction');
      if (introSection) {
        // 强制更新介绍段落的内容
        introSection.contentZH = descZh.value;
        introSection.contentEN = descEn.value;
        // 重置自定义内容标记
        introSection.hasCustomContent = false;
        // 立即更新自述文件内容
        if (enabledUpdateReadmeWatch.value && introSection.enabled) {
          updateReadmeContent();
        }
      }
    }, { deep: true, immediate: true });
    // 添加对应用表单的监听
    watch([
        () => appForm.value.description.zh,
        () => appForm.value.description.en
      ], () => {
      const introSection = readmeSections.value.find(section => section.type === 'introduction');
      if (introSection) {
        // 原始表单数据
        introSection.contentZH = appForm.value.description.zh.trim();
        introSection.contentEN = appForm.value.description.en.trim();
        // 重置自定义内容标记
        introSection.hasCustomContent = false;
        if (enabledUpdateReadmeWatch.value && introSection.enabled) {
          updateReadmeContent();
        }
      }
    }, { deep: true });
    // 监听默认凭据变化，更新凭据段落的默认内容（防抖避免频繁重渲染影响输入体验）
    let credentialsUpdateTimer: number | null = null;
    watch([defaultUsername, defaultPassword], () => {
      if (credentialsUpdateTimer) window.clearTimeout(credentialsUpdateTimer);
      credentialsUpdateTimer = window.setTimeout(() => {
        const credentialsSection = readmeSections.value.find(section => section.type === 'credentials');
        if (credentialsSection) {
          credentialsSection.contentZH = `${t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-user', {}, { locale: 'zh' })}: \`${defaultUsername.value}\`\n\n${t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-pass', {}, { locale: 'zh' })}: \`${defaultPassword.value}\``;
          credentialsSection.contentEN = `username: \`${defaultUsername.value}\`\n\npassword: \`${defaultPassword.value}\``;
          if (enabledUpdateReadmeWatch.value && credentialsSection.enabled) {
            // 在更新 Readme 内容时暂时抑制列表强制刷新，避免输入框被重建
            suppressListRefresh.value = true;
            try {
              updateReadmeContent();
            } finally {
              suppressListRefresh.value = false;
            }
          }
        }
      }, 250);
    });
  };
    return {
      shouldShowSwapAnimation, getItemTransform,
      // 拖拽处理
      handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
      // 段落操作
      toggleSection,
      // 监视器
      initReadmeEditorWatchListeners,
      // 强制刷新列表
      listRefreshCounter,
    }
}