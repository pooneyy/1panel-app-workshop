<script setup lang="ts">
import { Plus as IconPlus, Download as IconDownload } from '@vicons/tabler';
import type { AppParam } from '@/composable/aw.defind';
import AutoComplete from '@/components/aw.AutoComplete.vue';
import ExpandCollapseCard from '@/components/aw.ExpandCollapseCard.vue';
interface Props {
  title?: string;
  expanded?: boolean;
  appParams?: any[];
  moveParamUp?: (index: number) => void;
  moveParamDown?: (index: number) => void;
  getFilteredEnvVarsOptions?: (envKey: string) => any[];
  paramTypes?: any[];
  removeOption?: (param: AppParam, index: number) => void;
  addOption?: (param: AppParam) => void;
  ruleOptions?: any[];
  editableOptions?: Array<{
    label: string;
    value: string;
    disable: boolean;
    edit: boolean;
  }>;
  addParam?: () => void;
  downloadAppParams?: () => void;
  appParamsYaml?: string;
}
const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  appParams: () => [],
  moveParamUp: () => {},
  moveParamDown: () => {},
  getFilteredEnvVarsOptions: () => [],
  paramTypes: () => [],
  removeOption: () => {},
  addOption: () => {},
  ruleOptions: () => [],
  editableOptions: () => [],
  addParam: () => {},
  downloadAppParams: () => {},
  appParamsYaml: ''
});
const emit = defineEmits<{
  'update:expanded': [value: boolean];
  'update:appParams': [value: any[]];
  'moveParamUp': [index: number];
  'moveParamDown': [index: number];
  'removeParam': [index: number];
  'getFilteredEnvVarsOptions': [envKey: string];
  'removeOption': [param: AppParam, index: number];
  'addOption': [param: AppParam];
  'addParam': [];
  'downloadAppParams': [];
  'update:appParamsYaml': [value: string];
}>();
const getEditableStatusValue = (param: AppParam) => {
  const { disable = false, edit = false } = param;
  if (disable === false && edit === true) {
    return 'install-editable-post-editable';
  } else if (disable === true && edit === true) {
    return 'install-locked-post-editable';
  } else if (disable === false && edit === false) {
    return 'install-editable-post-locked';
  } else if (disable === true && edit === false) {
    return 'install-locked-post-locked';
  }
};
const handleStatusChange = (param: AppParam, value: string) => {
  const option = props.editableOptions.find(opt => opt.value === value);
  if (option) {
    param.disable = option.disable;
    param.edit = option.edit;
  }
};
const editableOptions= computed(() => props.editableOptions);
const expanded = computed({
  get: () => props.expanded,
  set: (value) => {
    emit('update:expanded', value);
  }
});
const appParams = computed({
  get: () => props.appParams,
  set: (value) => {
    emit('update:appParams', value);
  }
});
const appParamsYaml = computed({
  get: () => props.appParamsYaml,
  set: (value) => {
    emit('update:appParamsYaml', value);
  }
});
</script>
<template>
  <ExpandCollapseCard
    v-model:expanded="expanded"
    :title="$t('tools.app-workshop.cards.AppParams.title')"
  >
    <n-alert type="info" mb-4>
      {{ $t('tools.app-workshop.cards.AppParams.note') }}
    </n-alert>
    
    <div v-for="(param, index) in appParams" :key="param.id" class="param-form" :data-param-id="param.id">
      <n-card :title="`${$t('tools.app-workshop.cards.AppParams.Param-card.title')} ${index + 1}`" class="mb-4">
        <template #header-extra>
          <n-button @click="$emit('moveParamUp', index)" 
            :disable="index === 0"
            type="default" size="small">
            {{ $t('tools.app-workshop.components.moveUp') }}
          </n-button>
          <n-button @click="$emit('moveParamDown', index)" 
            :disable="index === appParams.length - 1"
            type="default" size="small" >
            {{ $t('tools.app-workshop.components.moveDown') }}
          </n-button>
          <n-button @click="$emit('removeParam', index)" type="error" size="small">
            {{ $t('tools.app-workshop.components.remove') }}
          </n-button>
        </template>
        
        <n-grid cols="2" x-gap="12">
          <n-gi>
            <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.envKey.label')" required>
              <AutoComplete
                v-model:value="param.envKey"
                :options="getFilteredEnvVarsOptions(param.envKey)"
                :placeholder="param.type === 'apps' || param.type === 'service' ? $t('tools.app-workshop.cards.AppParams.Param-card.envKey.placeholder1') : $t('tools.app-workshop.cards.AppParams.Param-card.envKey.placeholder2')"
              />
            </n-form-item>
          </n-gi>
          
          <n-gi>
            <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.type.label')" required>
              <n-select v-model:value="param.type" :options="paramTypes" />
            </n-form-item>
          </n-gi>
        </n-grid>
        
        <n-grid v-if="param.type === 'select' || param.type === 'apps' || param.type === 'service'" cols="2" x-gap="12">
          <n-gi v-if="param.type === 'apps'" span="2">
            <n-alert type="info" :title="$t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.title')" class="mb-4">
              <div v-html="$t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.note')" />
            </n-alert>
          </n-gi>
          <n-gi v-if="param.type === 'select' || param.type === 'apps'" :span="param.type === 'apps' ? '1' : '2'">
            <n-form-item :label="param.type === 'apps' ? $t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.select.label1') : $t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.select.label2')" required>
              <div>
                <div v-for="(option, optionIndex) in param.values" :key="optionIndex" class="param-form">
                  <n-grid :cols="param.type === 'apps' ? '4' : '3'" x-gap="8">
                    <n-gi>
                      <n-input
                        v-model:value="option.label"
                        :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.select.input-label')"
                      />
                    </n-gi>
                    <n-gi :span="param.type === 'apps' ? '2' : '1'">
                      <n-input
                        v-model:value="option.value"
                        :placeholder="param.type === 'apps' ? $t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.select.input-value1') : $t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.select.input-value2')"
                      />
                    </n-gi>
                    <n-gi>
                      <n-button
                        @click="$emit('removeOption', param, optionIndex as number)"
                        type="error"
                        quaternary
                      >
                        {{ $t('tools.app-workshop.components.removeOption') }}
                      </n-button>
                    </n-gi>
                  </n-grid>
                </div>
                <n-button
                  @click="$emit('addOption', param)"
                  type="primary"
                  dashed
                >
                  {{ $t('tools.app-workshop.components.addOption') }}
                </n-button>
              </div>
            </n-form-item>
          </n-gi>
          <n-gi v-if="param.type === 'apps'">
            <n-card :title="$t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.sub-select.card-title')" class="mb-4">
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.sub-select.label')" required>
                <AutoComplete
                  v-model:value="param.child.envKey"
                  :options="getFilteredEnvVarsOptions(param.child.envKey)"
                  :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.sub-select.placeholder')"
                />
              </n-form-item>
            </n-card>
          </n-gi>
          
          <n-gi v-if="param.type === 'service'">
            <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.key.label')">
              <n-input v-model:value="param.key" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.dynamic-param-config.info.key.placeholder')" />
            </n-form-item>
          </n-gi>
        </n-grid>
        
        <n-grid cols="2" x-gap="12">
          <n-gi>
            <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.default.label')" :required="param.type === 'apps'">
              <n-input v-model:value="param.default" :placeholder="param.type === 'apps' ? $t('tools.app-workshop.cards.AppParams.Param-card.default.placeholder1') : $t('tools.app-workshop.cards.AppParams.Param-card.default.placeholder2')" />
            </n-form-item>
          </n-gi>
          
          <n-gi>
            <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.rule.label')">
              <n-select v-model:value="param.rule" :options="ruleOptions" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.rule.placeholder')" clearable />
            </n-form-item>
          </n-gi>
        </n-grid>
        
        <ExpandCollapseCard
          v-model:expanded="param.expandTagForm"
          :title="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.title')"
        >
          <n-grid cols="3" x-gap="12">
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.zh.label')">
                <n-input clearable v-model:value="param.label.zh" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.zh.placeholder')" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.zh-Hant.label')">
                <n-input clearable v-model:value="param.label.zhHant" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.zh-Hant.placeholder')" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.en.label')">
                <n-input clearable v-model:value="param.label.en" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.en.placeholder')" />
              </n-form-item>
            </n-gi>
          </n-grid>
          
          <n-grid cols="3" x-gap="12">
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.ja.label')">
                <n-input clearable v-model:value="param.label.ja" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.ja.placeholder')" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.ko.label')">
                <n-input clearable v-model:value="param.label.ko" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.ko.placeholder')" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.ms.label')">
                <n-input clearable v-model:value="param.label.ms" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.ms.placeholder')" />
              </n-form-item>
            </n-gi>
          </n-grid>
          
          <n-grid cols="3" x-gap="12">
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.pt-br.label')">
                <n-input clearable v-model:value="param.label.ptBr" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.pt-br.placeholder')" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.ru.label')">
                <n-input clearable v-model:value="param.label.ru" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.ru.placeholder')" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.tr.label')">
                <n-input clearable v-model:value="param.label.tr" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-label.tr.placeholder')" />
              </n-form-item>
            </n-gi>
          </n-grid>
        </ExpandCollapseCard>

        <ExpandCollapseCard
          v-model:expanded="param.expandDescriptionForm"
          :title="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.title')"
        >
          <n-grid cols="2" x-gap="12">
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.zh.label')">
                <n-input clearable v-model:value="param.description.zh" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.zh.placeholder')" />
              </n-form-item>
            </n-gi>
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.zh-Hant.label')">
                <n-input clearable v-model:value="param.description.zhHant" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.zh-Hant.placeholder')" />
              </n-form-item>
            </n-gi>
          </n-grid>
          
          <n-grid cols="2" x-gap="12">
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.en.label')">
                <n-input clearable v-model:value="param.description.en" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.en.placeholder')" />
              </n-form-item>
            </n-gi>
          
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.ja.label')">
                <n-input clearable v-model:value="param.description.ja" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.ja.placeholder')" />
              </n-form-item>
            </n-gi>
          </n-grid>
          
          <n-grid cols="2" x-gap="12">
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.ko.label')">
                <n-input clearable v-model:value="param.description.ko" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.ko.placeholder')" />
              </n-form-item>
            </n-gi>

            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.ms.label')">
                <n-input clearable v-model:value="param.description.ms" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.ms.placeholder')" />
              </n-form-item>
            </n-gi>
          </n-grid>
          
          <n-grid cols="2" x-gap="12">
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.pt-br.label')">
                <n-input clearable v-model:value="param.description.ptBr" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.pt-br.placeholder')" />
              </n-form-item>
            </n-gi>
          
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.ru.label')">
                <n-input clearable v-model:value="param.description.ru" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.ru.placeholder')" />
              </n-form-item>
            </n-gi>
          </n-grid>
          
          <n-grid cols="2" x-gap="12">
            <n-gi>
              <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.tr.label')">
                <n-input clearable v-model:value="param.description.tr" :placeholder="$t('tools.app-workshop.cards.AppParams.Param-card.form-description.tr.placeholder')" />
              </n-form-item>
            </n-gi>
          </n-grid>
        </ExpandCollapseCard>

        <n-grid cols="4" x-gap="12">
          <n-gi>
            <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.required')">
              <n-switch v-model:value="param.required" />
            </n-form-item>
          </n-gi>
          
          <n-gi>
            <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.random')">
              <n-switch v-model:value="param.random" />
            </n-form-item>
          </n-gi>

          <n-gi>
            <n-form-item :label="$t('tools.app-workshop.cards.AppParams.Param-card.editableOptions')">
              <n-select
                :value="getEditableStatusValue(param)"
                @update:value="handleStatusChange(param, $event)"
                :options="editableOptions"
                style="min-width: 405px;"
              />
            </n-form-item>
          </n-gi>
        </n-grid>
      </n-card>
    </div>
    
    <n-button @click="$emit('addParam')" type="primary" dashed block size="large" mb-4>
      <template #icon>
        <n-icon><IconPlus /></n-icon>
      </template>
      {{ $t('tools.app-workshop.components.addParams') }}
    </n-button>
    
    <n-divider>{{ $t('tools.app-workshop.cards.AppParams.divider') }}</n-divider>
    
    <div mb-4>
      <n-button @click="$emit('downloadAppParams')" type="primary" block>
        <template #icon>
          <n-icon><IconDownload /></n-icon>
        </template>
        {{ $t('tools.app-workshop.components.downloadAppParams') }} (data.yml)
      </n-button>
    </div>
    
    <TextareaCopyable :value="appParamsYaml" language="yaml" />
  </ExpandCollapseCard>
</template>
<style scoped>
.param-form {
  margin-bottom: 16px;
  overflow-anchor: none;
  overscroll-behavior: contain;
}
@supports not (overflow-anchor: none) {
  .param-form {
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }
}
</style>