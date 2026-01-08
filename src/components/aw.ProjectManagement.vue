<script setup lang="ts">
import { Download as IconDownload, Upload as IconUpload, Trash as IconDelete } from '@vicons/tabler';
import ExpandCollapseCard from '@/components/aw.ExpandCollapseCard.vue';
interface Props {
  title?: string;
  expanded?: boolean;
  projectManagementActiveTab?: string;
  logoPreview?: string;
  appForm?: {
    key: string;
    [key: string]: any;
  };
  appVersion?: string;
  handleLogoUpload?: (file: File) => void;
  downloadAllAsZip?: () => void;
  clearAllData?: () => void;
  exportProject?: () => void;
  handleProjectImportJson?: (file: File) => void;
  handleProjectImportZip?: (file: File) => void;
}
const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  projectManagementActiveTab: 'package-project',
  logoPreview: '',
  appForm: () => ({ key: 'undefined-app' }),
  appVersion: '1.0.0',
  handleLogoUpload: () => {},
  downloadAllAsZip: () => {},
  clearAllData: () => {},
  exportProject: () => {},
  handleProjectImportJson: () => {},
  handleProjectImportZip: () => {},
});
const emit = defineEmits<{
  'update:expanded': [value: boolean];
  'update:projectManagementActiveTab': [value: string];
  'update:logoPreview': [value: string];
  'update:appForm': [value: any];
  'update:appVersion': [value: string];
  'handleLogoUpload': [options: { file: any }]
  'downloadAllAsZip': [];
  'clearAllData': [];
  'exportProject': [];
  'handleProjectImportJson': [options: { file: any }];
  'handleProjectImportZip': [options: { file: any }];
}>();
const expanded = computed({
  get: () => props.expanded,
  set: (value) => {
    emit('update:expanded', value);
  }
});
const projectManagementActiveTab = computed({
  get: () => props.projectManagementActiveTab,
  set: (value) => {
    emit('update:projectManagementActiveTab', value);
  }
});
const logoPreview = computed({
  get: () => props.logoPreview,
  set: (value) => {
    emit('update:logoPreview', value);
  }
});
const appForm = computed({
  get: () => props.appForm,
  set: (value) => {
    emit('update:appForm', value);
  }
});
const appVersion = computed({
  get: () => props.appVersion,
  set: (value) => {
    emit('update:appVersion', value);
  }
});
</script>
<template>
  <ExpandCollapseCard
    v-model:expanded="expanded"
    :title="$t('tools.app-workshop.cards.ProjectManagement.title')"
  >
    <n-tabs type="line" animated v-model:value="projectManagementActiveTab">
      <!-- 打包下载应用配置标签页 -->
      <n-tab-pane name="package-project" :tab="$t('tools.app-workshop.cards.ProjectManagement.PackageProject.title')">
        <n-alert type="info" mb-4>
          {{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.note') }}
        </n-alert>
        <n-grid cols="2" x-gap="12" mb-4>
          <n-gi>
            <!-- 应用Logo上传区域 -->
            <div class="logo-upload-section">
              <n-text>
                {{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.uploadArea.title') }}
              </n-text>
              <n-form-item class="logo-upload-form-item">
                <n-upload accept="image/*" :show-file-list="false" @before-upload="(options: any) => $emit('handleLogoUpload', options)">
                  <n-upload-dragger class="upload-dragger">
                    <div style="margin-bottom: 12px">
                      <n-icon size="48" :depth="3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </n-icon>
                    </div>
                    <n-text style="font-size: 16px">
                      {{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.uploadArea.note1') }}
                    </n-text>
                    <n-p depth="3" style="margin: 8px 0 0 0">
                      {{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.uploadArea.note2') }}
                    </n-p>
                  </n-upload-dragger>
                </n-upload>
              </n-form-item>
            </div>
          </n-gi>
          <n-gi>
            <!-- Logo预览区域 -->
            <div class="logo-preview-section">
              <n-text>{{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.previewArea') }}</n-text>
              <div class="preview-container">
                <img :src="logoPreview" :alt="$t('tools.app-workshop.cards.ProjectManagement.PackageProject.previewArea')" class="logo-image" />
              </div>
            </div>
          </n-gi>
        </n-grid>
        <n-grid cols="3" x-gap="12">
          <n-gi span="2">
            <n-form-item :label="$t('tools.app-workshop.cards.ProjectManagement.PackageProject.appVersionForm.lable')" required>
              <n-input v-model:value="appVersion" :placeholder="$t('tools.app-workshop.cards.ProjectManagement.PackageProject.appVersionForm.placeholder')" />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label=" ">
              <n-button 
                @click="$emit('downloadAllAsZip')" 
                type="primary" 
                block
              >
                <template #icon>
                  <n-icon><IconDownload /></n-icon>
                </template>
                {{ $t('tools.app-workshop.components.downloadAllAsZip') }}
              </n-button>
            </n-form-item>
          </n-gi>
        </n-grid>
        <n-alert type="warning" class="mt-4">
          <div>
            {{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.warning.title') }}
          </div>
          <pre class="file-tree">{{ appForm.key || 'undefined-app' }}/
├── data.yml ({{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.warning.paragraph1') }})
├── logo.png ({{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.warning.paragraph2') }})
├── README.md ({{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.warning.paragraph3') }})
├── README_en.md ({{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.warning.paragraph4') }})
└── {{ appVersion || 'latest' }}/
      ├── data.yml ({{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.warning.paragraph5') }})
      └── docker-compose.yml ({{ $t('tools.app-workshop.cards.ProjectManagement.PackageProject.warning.paragraph6') }})</pre>
        </n-alert>
      </n-tab-pane>
      <!-- 项目导入导出标签页 -->
      <n-tab-pane name="import-export" :tab="$t('tools.app-workshop.cards.ProjectManagement.ImportExport.title')">
        <n-alert type="info" mb-4>
          {{ $t('tools.app-workshop.cards.ProjectManagement.ImportExport.note') }}
        </n-alert>
        <!-- 田字布局 -->
        <n-grid cols="2" x-gap="12" y-gap="12">
          <n-gi>
            <n-button 
              @click="$emit('clearAllData')" 
              type="error" 
              block
              size="large"
              style="height: 80px;"
            >
              <template #icon>
                <n-icon>
                  <IconDelete />
                </n-icon>
              </template>
              <div style="font-size: 14px; line-height: 1.2;">
                {{ $t('tools.app-workshop.components.clearAllData') }}
              </div>
            </n-button>
          </n-gi>
          <n-gi>
            <n-button 
              @click="$emit('exportProject')" 
              type="success" 
              block
              size="large"
              style="height: 80px;"
            >
              <template #icon>
                <n-icon><IconDownload /></n-icon>
              </template>
              <div style="font-size: 14px; line-height: 1.2;">
                {{ $t('tools.app-workshop.components.exportProject') }}
              </div>
            </n-button>
          </n-gi>
          <n-gi>
            <n-upload
              accept=".json"
              :show-file-list="false"
              @before-upload="(options: any) => $emit('handleProjectImportJson', options)"
              class="import-export-upload"
            >
              <n-button 
                type="info" 
                block
                size="large"
                style="height: 80px;"
              >
                <template #icon>
                  <n-icon><IconUpload /></n-icon>
                </template>
                <div style="font-size: 14px; line-height: 1.2;">
                  {{ $t('tools.app-workshop.components.importFromJson') }}
                </div>
              </n-button>
            </n-upload>
          </n-gi>
          <n-gi>
            <n-upload
              accept=".zip"
              :show-file-list="false"
              @before-upload="(options: any) => $emit('handleProjectImportZip', options)"
              class="import-export-upload"
            >
              <n-button 
                type="warning" 
                block
                size="large"
                style="height: 80px;"
              >
                <template #icon>
                  <n-icon><IconUpload /></n-icon>
                </template>
                <div style="font-size: 14px; line-height: 1.2;">
                  {{ $t('tools.app-workshop.components.importFromZip') }}
                </div>
              </n-button>
            </n-upload>
          </n-gi>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </ExpandCollapseCard>
</template>
<style scoped>
:deep(.logo-upload-form-item) {
  --n-label-height: 0 !important;
  --n-feedback-height: 0 !important;
}
.logo-upload-section .n-form-item { margin-bottom: 0; }

.logo-upload-section,
.logo-preview-section {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}
.logo-upload-section .n-text,
.logo-preview-section .n-text {
  margin-bottom: 8px;
  font-weight: 500;
}
.upload-dragger {
  height: 100%;
  min-height: 206px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 0;
}
.preview-container {
  flex: 1;
  margin-top: 0; /* 移除上边距 */
  padding: 12px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 206px;
  height: 100%;
}
.logo-image {
  max-width: 180px;
  max-height: 180px;
}
:deep(.import-export-upload .n-upload-trigger) {
  width: 100%;
  display: block;
}

:deep(.import-export-upload) {
  width: 100%;
  height: 100%;
}
</style>