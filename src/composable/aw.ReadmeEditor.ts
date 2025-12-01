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
  } = storeToRefs(useReactiveReferenceStore())
  const {updateReadmeContent} = useReactiveReferenceStore()
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
  /**
   * 处理拖拽开始事件的函数
   * @param event - 拖拽事件对象
   * @param index - 当前拖拽元素的索引位置
   */
  const handleDragStart = (event: DragEvent, index: number) => {
    dragStartIndex.value = index;
    draggedSection.value = readmeSections.value[index];
    isDragging.value = true;
    // 在拖拽开始前，确保当前编辑器内容已经分配到各个段落
    distributeContentToSections();
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      // 创建一个透明的拖拽图像
      const dragImage = document.createElement('div');
      dragImage.style.width = '1px';
      dragImage.style.height = '1px';
      dragImage.style.opacity = '0';
      document.body.appendChild(dragImage);
      event.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
    // 添加拖拽中的样式
    const target = event.currentTarget as HTMLElement;
    target.classList.add('dragging-active');
    // 添加全局拖拽样式
    document.body.classList.add('drag-in-progress');
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
    if (dragStartIndex.value === null || dragStartIndex.value === index) {
      return;
    }
    // 实时交换位置
    const sections = [...readmeSections.value];
    const fromIndex = dragStartIndex.value;
    const toIndex = index;
    // 记录交换位置用于视觉反馈
    swapPositions.value = { from: fromIndex, to: toIndex };
    // 执行交换
    const [movedItem] = sections.splice(fromIndex, 1);
    sections.splice(toIndex, 0, movedItem);
    // 更新数组
    readmeSections.value = sections;
    // 更新起始索引为新的位置
    dragStartIndex.value = toIndex;
    dragOverIndex.value = toIndex;
    // 拖拽过程中实时更新显示的内容
    updateReadmeContent();
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
    // 重置状态
    resetDragState();
    // 拖拽结束后确保内容正确更新
    updateReadmeContent();
  };
  /**
   * 处理拖拽结束后的操作
   * 
   * 在完成拖拽动作后被调用
   * 
   * 负责更新内容和重置拖拽状态
   */
  const handleDragEnd = () => {
    // 拖拽结束后确保内容正确更新
    updateReadmeContent();
    resetDragState();
  };
  // 重置拖拽状态
  const resetDragState = () => {
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
  };
  // 计算项目是否应该显示交换动画
  /**
   * 判断指定索引位置是否应该显示交换动画
   * @param index - 需要检查的索引位置
   * @returns 如果该位置是交换动画的起始或目标位置则返回true，否则返回false
   */
  const shouldShowSwapAnimation = (index: number) => {
    if (!swapPositions.value) return false;
    const { from, to } = swapPositions.value;
    return index === from || index === to;
  };
  // 计算项目的变换位置
  /**
   * 根据拖拽位置计算项目元素的变换样式
   * @param {number} index - 当前项目的索引
   * @returns {string} - 返回变换样式字符串，如'translateY(-100%)'表示向上移动一个项目高度
   */
  const getItemTransform = (index: number) => {
    if (!swapPositions.value || !isDragging.value) return '';
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
    // 监听默认凭据变化，更新凭据段落的默认内容
    watch([defaultUsername, defaultPassword], () => {
      const credentialsSection = readmeSections.value.find(section => section.type === 'credentials');
      if (credentialsSection) {
        credentialsSection.contentZH = `${t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-user', {}, { locale: 'zh' })}: \`${defaultUsername.value}\`\n\n${t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-pass', {}, { locale: 'zh' })}: \`${defaultPassword.value}\``;
        credentialsSection.contentEN = `username: \`${defaultUsername.value}\`\n\npassword: \`${defaultPassword.value}\``;
        if (enabledUpdateReadmeWatch.value && credentialsSection.enabled) {
          updateReadmeContent();
        }
      }
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
    }
}