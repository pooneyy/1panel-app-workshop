<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { onMounted } from 'vue';
import {
  architectureOptions, defaultLogoBase64, memoryUnitOptions, MONACO_EDITOR_OPTIONS,
} from '@/composable/aw.defind';
import { useReactiveReferenceStore } from '@/stores/aw.store';
import { useDownloadFile } from '@/composable/aw.DownloadFile';
import { useLocalStorage } from '@/composable/aw.LocalStorage';
import { useProjectManagement } from '@/composable/aw.ProjectManagement';
import { useReadmeEditor } from '@/composable/aw.ReadmeEditor';
import { useDockerComposeEditor } from '@/composable/aw.DockerComposeEditor';
import { useAppParams } from '@/composable/aw.AppParams';
import { useScrollManagement } from '@/composable/aw.ScrollManagement';
import ProjectManagement from '@/components/aw.ProjectManagement.vue';
import AppForm from '@/components/aw.AppForm.vue';
import ReadmeEditor from '@/components/aw.ReadmeEditor.vue';
import AppDeclaration from '@/components/aw.AppDeclaration.vue';
import DockerComposeEditor from '@/components/aw.DockerComposeEditor.vue';
import AppParams from '@/components/aw.AppParams.vue';
import BackToTop from '@/components/aw.BackToTop.vue';
const {
    // 卡片展开状态相关
    expandProjectManagement, expandAppForm, expandReadmeEditor, expandReadmeEditorTemplate,
    expandAppDeclaration, expandDockerComposeEditor, expandAppParams, newVarsCollapsed,
    existingVarsCollapsed, ignoredVarsCollapsed,
    // 标签页相关
    projectManagementActiveTab, readmeEditorActiveTab,
    // 自述文件编辑模板卡片表单相关
    defaultUsername, defaultPassword, readmeContentZH, readmeContentEN, readmeSections,
    dragStartIndex, isDragging,
    // 应用参数配置及 DockerCompose 卡片表单相关
    appForm, appParams, dockerCompose, appDeclarationYaml, appParamsYaml,
    convertedDockerCompose,
    // 项目管理卡片相关
    appVersion, logoPreview,
    // 滚动监听相关
    showBackToTop,
    // 下拉菜单相关
    availableTags, typeOptions, paramTypes, ruleOptions, editableOptions,
} = storeToRefs(useReactiveReferenceStore())
const { resetParagraphOrder, initializeReadmeSections, updateReadmeContent } = useReactiveReferenceStore()
const {
    downloadReadmeZH, downloadReadmeEN, downloadAppDeclaration, downloadDockerCompose,
    downloadAppParams
} = useDownloadFile()
const { loadFromLocalStorage, initLocalStorageWatchListeners } = useLocalStorage()
const {
    handleLogoUpload, downloadAllAsZip,
    clearAllData, exportProject, handleProjectImportJson, handleProjectImportZip
} = useProjectManagement()
const {
  handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd,
  toggleSection, initReadmeEditorWatchListeners, shouldShowSwapAnimation, getItemTransform,
  listRefreshCounter,
} = useReadmeEditor()
const { extractedVariablesInfo, addDockerComposeParameters } = useDockerComposeEditor()
const {
  getFilteredEnvVarsOptions, addParam, moveParamUp, moveParamDown, handleScrollToParam,
  removeParam, addOption, removeOption
} = useAppParams()
const { handleScroll, manageScrollListeners, scrollToTop } = useScrollManagement()
onMounted(() => {
  logoPreview.value = "data:image/png;base64," + defaultLogoBase64;
  // 尝试从本地存储加载数据
  const loaded = loadFromLocalStorage();
  if (!loaded) {
    initializeReadmeSections();
    updateReadmeContent();
  }
  initLocalStorageWatchListeners();
  initReadmeEditorWatchListeners();
  setTimeout(() => {
    manageScrollListeners();
    setTimeout(handleScroll, 100);
  }, 500);
});
</script>
<template>
  <div>
    <ProjectManagement
      v-model:expanded="expandProjectManagement" v-model:project-management-active-tab="projectManagementActiveTab"
      v-model:logo-preview="logoPreview" v-model:app-form="appForm"
      v-model:app-version="appVersion" @handle-logo-upload="handleLogoUpload"
      @download-all-as-zip="downloadAllAsZip" @clear-all-data="clearAllData" @export-project="exportProject"
      @handle-project-import-json="handleProjectImportJson" @handle-project-import-zip="handleProjectImportZip"
    />
    <AppForm
      v-model:expanded="expandAppForm" v-model:app-form="appForm" :available-tags="availableTags"
      :type-options="typeOptions" :memory-unit-options="memoryUnitOptions" :architecture-options="architectureOptions"
    />
    <ReadmeEditor 
      v-model:expanded="expandReadmeEditor" v-model:expand-template="expandReadmeEditorTemplate"
      v-model:readme-editor-active-tab="readmeEditorActiveTab" @reset-paragraph-order="resetParagraphOrder"
      v-model:readme-sections="readmeSections" v-model:drag-start-index="dragStartIndex"
      :should-show-swap-animation="shouldShowSwapAnimation" :get-item-transform="getItemTransform"
      v-model:is-dragging="isDragging"
      @handle-drag-start="handleDragStart"
      @handle-drag-over="handleDragOver" @handle-drag-leave="handleDragLeave" @handle-drop="handleDrop"
      @handle-drag-end="handleDragEnd" @toggle-section="toggleSection" v-model:default-username="defaultUsername"
      v-model:default-password="defaultPassword" :monaco-editor-options="MONACO_EDITOR_OPTIONS"
      v-model:readme-content-ZH="readmeContentZH" v-model:readme-content-EN="readmeContentEN"
      @download-readme-ZH="downloadReadmeZH" @download-readme-EN="downloadReadmeEN"
      :list-refresh-counter="listRefreshCounter"
    />
    <AppDeclaration
      v-model:expanded="expandAppDeclaration" @download-app-declaration="downloadAppDeclaration"
      v-model:app-declaration-yaml="appDeclarationYaml"
    />
    <DockerComposeEditor
      v-model:expanded="expandDockerComposeEditor" v-model:docker-compose="dockerCompose"
      :monaco-editor-options="MONACO_EDITOR_OPTIONS" v-model:extracted-variables-info="extractedVariablesInfo"
      v-model:new-vars-collapsed="newVarsCollapsed" v-model:existing-vars-collapsed="existingVarsCollapsed"
      v-model:ignored-vars-collapsed="ignoredVarsCollapsed" @add-docker-compose-parameters="addDockerComposeParameters"
      @download-docker-compose="downloadDockerCompose" v-model:converted-docker-compose="convertedDockerCompose"
      @jump-to-param="handleScrollToParam"
    />
    <AppParams app-params-card
      v-model:expanded="expandAppParams" v-model:app-params="appParams" @move-param-up="moveParamUp"
      @move-param-down="moveParamDown" @remove-param="removeParam" :get-filtered-env-vars-options="getFilteredEnvVarsOptions"
      :param-types="paramTypes" @remove-option="removeOption" @add-option="addOption"
      :rule-options="ruleOptions" @add-param="addParam" @download-app-params="downloadAppParams"
      v-model:app-params-yaml="appParamsYaml" :editable-options="editableOptions"
    />
    <BackToTop v-model:show-back-to-top="showBackToTop" @scroll-to-top="scrollToTop" />
  </div>
</template>
