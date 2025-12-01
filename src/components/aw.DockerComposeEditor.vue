<script setup lang="ts">
import { Download as IconDownload } from '@vicons/tabler';
import ExpandCollapseCard from '@/components/aw.ExpandCollapseCard.vue';
interface Props {
  title?: string;
  expanded?: boolean;
  dockerCompose?: string;
  MONACO_EDITOR_OPTIONS?: any;
  extractedVariablesInfo?: any;
  newVarsCollapsed?: boolean;
  existingVarsCollapsed?: boolean;
  ignoredVarsCollapsed?: boolean;
  addDockerComposeParameters?: () => void;
  downloadDockerCompose?: () => void;
  convertedDockerCompose?: string;
}
const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  dockerCompose: '',
  extractedVariablesInfo: () => ({}),
  newVarsCollapsed: false,
  existingVarsCollapsed: false,
  ignoredVarsCollapsed: false,
  addDockerComposeParameters: () => {},
  downloadDockerCompose: () => {},
  convertedDockerCompose: ''
});
const emit = defineEmits<{
  'update:expanded': [value: boolean];
  'update:dockerCompose': [value: string];
  'MONACO_EDITOR_OPTIONS': [value: any];
  'update:extractedVariablesInfo': [value: any];
  'update:newVarsCollapsed': [value: boolean];
  'update:existingVarsCollapsed': [value: boolean];
  'update:ignoredVarsCollapsed': [value: boolean];
  'addDockerComposeParameters': [];
  'downloadDockerCompose': [];
  'update:convertedDockerCompose': [value: string];
}>();
const expanded = computed({
  get: () => props.expanded,
  set: (value) => {
    emit('update:expanded', value);
  }
});
const dockerCompose = computed({
  get: () => props.dockerCompose,
  set: (value) => {
    emit('update:dockerCompose', value);
  }
});
const extractedVariablesInfo = computed({
  get: () => props.extractedVariablesInfo,
  set: (value) => {
    emit('update:extractedVariablesInfo', value);
  }
});
const newVarsCollapsed = computed({
  get: () => props.newVarsCollapsed,
  set: (value) => {
    emit('update:newVarsCollapsed', value);
  }
});
const existingVarsCollapsed = computed({
  get: () => props.existingVarsCollapsed,
  set: (value) => {
    emit('update:existingVarsCollapsed', value);
  }
});
const ignoredVarsCollapsed = computed({
  get: () => props.ignoredVarsCollapsed,
  set: (value) => {
    emit('update:ignoredVarsCollapsed', value);
  }
});
const convertedDockerCompose = computed({
  get: () => props.convertedDockerCompose,
  set: (value) => {
    emit('update:convertedDockerCompose', value);
  }
});
</script>
<template>
  <ExpandCollapseCard
    v-model:expanded="expanded"
    :title="$t('tools.app-workshop.cards.DockerComposeEditor.title')"
  >
    <c-label :label="$t('tools.app-workshop.cards.DockerComposeEditor.label')" mb-2>
      <div relative w-full>
        <c-monaco-editor
          v-model:value="dockerCompose"
          language="yaml"
          height="300px"
          :options="MONACO_EDITOR_OPTIONS"
        />
      </div>
    </c-label>
    <!-- 变量提取信息区域 -->
    <n-alert v-if="extractedVariablesInfo.total > 0" :type="extractedVariablesInfo.new > 0 ? 'info' : 'success'" mb-2>
      <template #header>
        <n-text strong>
          {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.title') }}
        </n-text>
      </template>
      <div>
        <n-text>{{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.subtitle', { count: extractedVariablesInfo.total }) }}</n-text>
        <n-grid cols="3" x-gap="12" class="mt-2">
          <!-- 新变量区域 -->
          <n-gi>
            <n-card size="small" :bordered="false">
              <template #header>
                <div 
                  class="expand-collapse-card-header"
                  @click="newVarsCollapsed = !newVarsCollapsed"
                >
                  <n-text strong>
                    {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.newVars.title') }}
                  </n-text>
                  <n-button type="primary" size="tiny" text>
                    <template #icon>
                      <n-icon>
                        <svg v-if="newVarsCollapsed" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </template>
              <div>
                <n-text v-if="extractedVariablesInfo.new > 0" tag="div">
                  {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.newVars.text1', { count: extractedVariablesInfo.new }) }}
                </n-text>
                <n-text v-else tag="div" depth="3">
                  {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.newVars.text2') }}
                </n-text>
                
                <div v-show="!newVarsCollapsed">
                  <n-space v-if="extractedVariablesInfo.newVariables.length > 0" vertical class="mt-2">
                    <n-tag v-for="variable in extractedVariablesInfo.newVariables" :key="variable" type="info" size="small">
                      {{ variable }}
                    </n-tag>
                  </n-space>
                </div>
              </div>
            </n-card>
          </n-gi>
          <!-- 已存在变量区域 -->
          <n-gi>
            <n-card size="small" :bordered="false">
              <template #header>
                <div 
                  class="expand-collapse-card-header"
                  @click="existingVarsCollapsed = !existingVarsCollapsed"
                >
                  <n-text strong>
                    {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.existingVars.title') }}
                  </n-text>
                  <n-button type="primary" size="tiny" text>
                    <template #icon>
                      <n-icon>
                        <svg v-if="existingVarsCollapsed" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </template>
              <div>
                <n-text v-if="extractedVariablesInfo.existing > 0" tag="div">
                  {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.existingVars.text1', { count: extractedVariablesInfo.existing }) }}
                </n-text>
                <n-text v-else tag="div" depth="3">
                  {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.existingVars.text2') }}
                </n-text>
                
                <div v-show="!existingVarsCollapsed">
                  <n-space v-if="extractedVariablesInfo.existingVariables.length > 0" vertical class="mt-2">
                    <n-tag v-for="variable in extractedVariablesInfo.existingVariables" :key="variable" type="success" size="small">
                      {{ variable }}
                    </n-tag>
                  </n-space>
                </div>
              </div>
            </n-card>
          </n-gi>
          <!-- 被忽略变量区域 -->
          <n-gi>
            <n-card size="small" :bordered="false">
              <template #header>
                <div 
                  class="expand-collapse-card-header"
                  @click="ignoredVarsCollapsed = !ignoredVarsCollapsed"
                >
                  <n-text strong>
                    {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.ignoredVars.title') }}
                  </n-text>
                  <n-button type="primary" size="tiny" text>
                    <template #icon>
                      <n-icon>
                        <svg v-if="ignoredVarsCollapsed" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m6 9 6 6 6-6"/>
                        </svg>
                        <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="m18 15-6-6-6 6"/>
                        </svg>
                      </n-icon>
                    </template>
                  </n-button>
                </div>
              </template>
              <div>
                <n-text v-if="extractedVariablesInfo.ignored > 0" tag="div">
                  {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.ignoredVars.text1', { count: extractedVariablesInfo.ignored }) }}
                </n-text>
                <n-text v-else tag="div" depth="3">
                  {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.ignoredVars.text2') }}
                </n-text>
                
                <div v-show="!ignoredVarsCollapsed">
                  <n-space v-if="extractedVariablesInfo.ignoredVariables.length > 0" vertical class="mt-2">
                    <n-tag v-for="variable in extractedVariablesInfo.ignoredVariables" :key="variable" type="warning" size="small">
                      {{ variable }}
                    </n-tag>
                  </n-space>
                  <n-text v-if="extractedVariablesInfo.ignoredVariables.length > 0" depth="3" tag="div" class="mt-1" style="font-size: 12px;">
                    {{ $t('tools.app-workshop.cards.DockerComposeEditor.var-info-area.ignoredVars.text3') }}
                  </n-text>
                </div>
              </div>
            </n-card>
          </n-gi>
        </n-grid>
      </div>
    </n-alert>
    <n-alert type="info" mb-2>
      {{ $t('tools.app-workshop.cards.DockerComposeEditor.note') }}
    </n-alert>
    <n-grid cols="2" x-gap="12" mb-4>
      <n-gi>
        <n-button 
          @click="$emit('addDockerComposeParameters')" 
          type="primary" 
          :disabled="extractedVariablesInfo.new === 0"
          block
        >
          <template #icon>
            <n-icon>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>
              </svg>
            </n-icon>
          </template>
          {{ $t('tools.app-workshop.components.addDockerComposeParameters', extractedVariablesInfo.new) }}
          <span v-if="extractedVariablesInfo.new > 0">&nbsp;({{ extractedVariablesInfo.new }})</span>
        </n-button>
      </n-gi>
      <n-gi>
        <n-button @click="$emit('downloadDockerCompose')" type="primary" block>
          <template #icon>
            <n-icon><IconDownload /></n-icon>
          </template>
          {{ $t('tools.app-workshop.components.downloadDockerCompose') }} (docker-compose.yml)
        </n-button>
      </n-gi>
    </n-grid>
    <TextareaCopyable :value="convertedDockerCompose" language="yaml" />
  </ExpandCollapseCard>
</template>
<style scoped>
.expand-collapse-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 8px 0;
  cursor: pointer;
}
</style>