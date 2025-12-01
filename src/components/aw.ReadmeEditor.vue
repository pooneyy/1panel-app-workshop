<script setup lang="ts">
import { Download as IconDownload } from '@vicons/tabler';
import ExpandCollapseCard from '@/components/aw.ExpandCollapseCard.vue';
import MarkdownRender from '@/components/MarkdownRender.vue';
import { type ReadmeSection } from '@/composable/aw.defind';
interface Props {
  title?: string;
  expanded?: boolean;
  expandTemplate?: boolean;
  readmeEditorActiveTab?: string;
  resetParagraphOrder?: () => void;
  readmeSections?: ReadmeSection[];
  dragStartIndex?: number | null;
  shouldShowSwapAnimation?: (index: number) => boolean;
  getItemTransform?: (index: number) => string;
  isDragging?: boolean;
  handleDragStart?: (event: DragEvent, index: number) => void;
  handleDragOver?: (event: DragEvent, index: number) => void;
  handleDragLeave?: (event: DragEvent) => void;
  handleDrop?: (event: DragEvent, index: number) => void;
  handleDragEnd?: () => void;
  toggleSection?: (index: number) => void;
  defaultUsername?: string;
  defaultPassword?: string;
  MONACO_EDITOR_OPTIONS?: any;
  readmeContentZH?: string;
  readmeContentEN?: string;
  downloadReadmeZH?: () => void;
  downloadReadmeEN?: () => void;
}
const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  expandTemplate: false,
  readmeEditorActiveTab: 'zh',
  resetParagraphOrder: () => {},
  readmeSections: () => [],
  dragStartIndex: null,
  shouldShowSwapAnimation: () => false,
  getItemTransform: () => '',
  isDragging: false,
  handleDragStart: () => {},
  handleDragOver: () => {},
  handleDragLeave: () => {},
  handleDrop: () => {},
  handleDragEnd: () => {},
  toggleSection: () => {},
  defaultUsername: '',
  defaultPassword: '',
  readmeContentZH: '',
  readmeContentEN: '',
  downloadReadmeZH: () => {},
  downloadReadmeEN: () => {}
});
const emit = defineEmits<{
  'update:expanded': [value: boolean];
  'update:expandTemplate': [value: boolean];
  'update:readmeEditorActiveTab': [value: string];
  'resetParagraphOrder': [value: void];
  'update:readmeSections': [value: ReadmeSection[]];
  'update:dragStartIndex': [value: number | null];
  'update:isDragging': [value: boolean];
  'handleDragStart': [event: DragEvent, index: number];
  'handleDragOver': [event: DragEvent, index: number];
  'handleDragLeave': [event: DragEvent];
  'handleDrop': [event: DragEvent, index: number];
  'handleDragEnd': [value: void];
  'toggleSection': [index: number];
  'update:defaultUsername': [value: string];
  'update:defaultPassword': [value: string];
  'MONACO_EDITOR_OPTIONS': [value: any];
  'update:readmeContentZH': [value: string];
  'update:readmeContentEN': [value: string];
  'downloadReadmeZH': [value: void];
  'downloadReadmeEN': [value: void];
}>();
const expanded = computed({
  get: () => props.expanded,
  set: (value) => {
    emit('update:expanded', value);
  }
});
const expandTemplate = computed({
  get: () => props.expandTemplate,
  set: (value) => {
    emit('update:expandTemplate', value);
  }
});
const readmeEditorActiveTab = computed({
  get: () => props.readmeEditorActiveTab,
  set: (value) => {
    emit('update:readmeEditorActiveTab', value);
  }
});
const readmeSections = computed({
  get: () => props.readmeSections,
  set: (value) => {
    emit('update:readmeSections', value);
  }
});
const dragStartIndex = computed({
  get: () => props.dragStartIndex,
  set: (value) => {
    emit('update:dragStartIndex', value);
  }
});
const isDragging = computed({
  get: () => props.isDragging,
  set: (value) => {
    emit('update:isDragging', value);
  }
});
const defaultUsername = computed({
  get: () => props.defaultUsername,
  set: (value) => {
    emit('update:defaultUsername', value);
  }
});
const defaultPassword = computed({
  get: () => props.defaultPassword,
  set: (value) => {
    emit('update:defaultPassword', value);
  }
});
const readmeContentZH = computed({
  get: () => props.readmeContentZH,
  set: (value) => {
    emit('update:readmeContentZH', value);
  }
});
const readmeContentEN = computed({
  get: () => props.readmeContentEN,
  set: (value) => {
    emit('update:readmeContentEN', value);
  }
});
</script>
<template>
  <ExpandCollapseCard
    v-model:expanded="expanded"
    :title="$t('tools.app-workshop.cards.ReadmeEditor.title')"
  >
    <n-alert type="info" mb-2>
      {{ $t('tools.app-workshop.cards.ReadmeEditor.note') }}
    </n-alert>
    
    <!-- 段落模板卡片 -->
    <ExpandCollapseCard
      v-model:expanded="expandTemplate"
      :title="$t('tools.app-workshop.cards.ReadmeEditor.template.title')"
    >
      <div class="section-template-header">
        <n-button @click="$emit('resetParagraphOrder')" type="error" dashed>
          {{ $t('tools.app-workshop.components.resetParagraphOrder') }}
        </n-button>
      </div>
      
      <n-list class="draggable-list">
        <n-list-item
          v-for="(section, index) in readmeSections"
          :key="section.id"
          class="section-item"
          :class="{
            'dragging-active': dragStartIndex === index,
            'swap-animation': shouldShowSwapAnimation(index)
          }"
          :style="{
            transform: getItemTransform(index),
            transition: isDragging ? 'transform 0.2s ease' : 'none'
          }"
          draggable="true"
          @dragstart="$emit('handleDragStart', $event, index)"
          @dragover="$emit('handleDragOver', $event, index)"
          @dragleave="$emit('handleDragLeave', $event)"
          @drop="$emit('handleDrop', $event, index)"
          @dragend="$emit('handleDragEnd')"
        >
          <template #prefix>
            <div class="drag-handle" @click.stop>
              <n-icon>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="9" cy="5" r="1"/>
                  <circle cx="9" cy="12" r="1"/>
                  <circle cx="9" cy="19" r="1"/>
                  <circle cx="15" cy="5" r="1"/>
                  <circle cx="15" cy="12" r="1"/>
                  <circle cx="15" cy="19" r="1"/>
                </svg>
              </n-icon>
            </div>
          </template>
          
          <div class="section-content">
            <div class="section-header">
              <div class="section-left">
                <n-switch 
                  :value="section.enabled" 
                  @update:value="$emit('toggleSection', index)"
                />
                <div class="section-info">
                  <n-text strong>{{ $t(section.title) }}</n-text>
                </div>
              </div>
              <div v-if="section.type === 'credentials'" class="credentials-inputs">
                <div class="credential-item">
                  <span class="credential-label">{{ $t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-user') }}</span>
                  <n-input 
                    v-model:value="defaultUsername" 
                    :placeholder="$t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.placeholder1')" 
                    size="small"
                    style="width: 150px;"
                  />
                </div>
                <div class="credential-item">
                  <span class="credential-label">{{ $t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.input-pass') }}</span>
                  <n-input 
                    v-model:value="defaultPassword" 
                    :placeholder="$t('tools.app-workshop.cards.ReadmeEditor.template.defaultCredentials.placeholder2')" 
                    size="small"
                    style="width: 150px;"
                  />
                </div>
              </div>
            </div>
          </div>
        </n-list-item>
      </n-list>
    </ExpandCollapseCard>
    
    <!-- 自述文件编辑和预览 -->
    <n-tabs type="line" v-model:value="readmeEditorActiveTab">
      <!-- 中文自述文件标签页 -->
      <n-tab-pane name="zh" :tab="$t('tools.app-workshop.cards.ReadmeEditor.tabs.tab-cn')">
        <n-grid cols="2" x-gap="12" mb-4>
          <n-gi>
            <c-label mb-2>
              <div relative w-full>
                <c-monaco-editor
                  v-model:value="readmeContentZH"
                  language="markdown"
                  height="400px"
                  :options="MONACO_EDITOR_OPTIONS"
                />
              </div>
            </c-label>
          </n-gi>
          <n-gi>
            <MarkdownRender :value="readmeContentZH" />
          </n-gi>
        </n-grid>
        <div mb-4>
          <n-button @click="$emit('downloadReadmeZH')" type="primary" block>
            <template #icon>
              <n-icon><IconDownload /></n-icon>
            </template>
            {{ $t('tools.app-workshop.components.downloadReadme') }} (README.md)
          </n-button>
        </div>
      </n-tab-pane>
      <!-- 英文自述文件标签页 -->
      <n-tab-pane name="en" :tab="$t('tools.app-workshop.cards.ReadmeEditor.tabs.tab-en')">
        <n-grid cols="2" x-gap="12" mb-4>
          <n-gi>
            <c-label mb-2>
              <div relative w-full>
                <c-monaco-editor
                  v-model:value="readmeContentEN"
                  language="markdown"
                  height="400px"
                  :options="MONACO_EDITOR_OPTIONS"
                />
              </div>
            </c-label>
          </n-gi>
          <n-gi>
            <MarkdownRender :value="readmeContentEN" />
          </n-gi>
        </n-grid>
        <div mb-4>
          <n-button @click="downloadReadmeEN" type="primary" block>
            <template #icon>
              <n-icon><IconDownload /></n-icon>
            </template>
            {{ $t('tools.app-workshop.components.downloadReadme') }} (README_en.md)
          </n-button>
        </div>
      </n-tab-pane>
    </n-tabs>
  </ExpandCollapseCard>
</template>
<style scoped>
.n-list-item {
  padding: 12px;
  border-bottom: 1px solid;
  transition: all 0.2s ease;
}
.n-list-item:last-child {
  border-bottom: none;
}
.section-template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.section-info {
  min-width: 120px;
}
/* 拖拽相关样式 */
.draggable-list {
  position: relative;
}
.section-item {
  cursor: grab;
  user-select: none;
  transition: all 0.2s ease;
  position: relative;
  border: 1px solid var(--n-border-color);
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.section-item:last-child {
  margin-bottom: 0;
}
.section-item:active {
  cursor: grabbing;
}
.section-item.dragging-active {
  opacity: 0.9;
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 2px solid #18a058;
  z-index: 1000;
  position: relative;
}
/* 交换动画 */
.section-item.swap-animation {
  transition: transform 0.2s ease, opacity 0.2s ease;
  z-index: 999;
}
/* 拖拽手柄样式 */
.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 8px;
  color: #c0c0c0;
  cursor: grab;
  transition: color 0.2s ease;
  pointer-events: none;
}
.section-item:hover .drag-handle {
  color: #666;
}
.section-item.dragging-active .drag-handle {
  color: #18a058;
}
/* 全局拖拽状态 */
body.drag-in-progress .section-item {
  cursor: grabbing;
}
/* 段落内容布局 */
.section-content {
  width: 100%;
  min-height: 52px;
  flex: 1;
  padding: 12px 0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 16px;
}
.section-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}
.section-info {
  min-width: 120px;
  flex: 1;
}
.credentials-inputs {
  min-width: 550px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
}
.credentials-inputs .n-input {
  min-width: 200px;
}
.credential-item {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.credential-label {
  font-size: 14px;
  font-weight: 500;
  min-width: auto;
}
/* 响应式调整 */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .credentials-inputs {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .credential-item {
    flex: 1;
    min-width: 0;
  }
}
/* 平滑过渡动画 */
.section-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.draggable-list {
  transition: all 0.3s ease;
}
/* 增强拖拽时的视觉反馈 */
.section-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  border-radius: 6px;
  transition: all 0.2s ease;
  pointer-events: none;
}
.section-item.dragging-active::before {
  background: linear-gradient(135deg, rgba(24, 160, 88, 0.05) 0%, rgba(24, 160, 88, 0.1) 100%);
  border: 2px solid #18a058;
}
/* 列表项悬停效果 */
.section-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border-color: #d0d0d0;
}
/* 拖拽过程中的特殊效果 */
.section-item.dragging-active:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.2);
}
/* 确保拖拽项目在最上层 */
.section-item.dragging-active {
  transform: scale(1.02) !important;
}
</style>