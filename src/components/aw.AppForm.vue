<script setup lang="ts">
import ExpandCollapseCard from '@/components/aw.ExpandCollapseCard.vue';
interface Props {
  title?: string;
  expanded?: boolean;
  appForm?: {
    key: string;
    [key: string]: any;
  };
  availableTags?: {label: string; value: string;}[];
  typeOptions?: {label: string; value: string;}[];
  memoryUnitOptions?: {label: string; value: string;}[];
  architectureOptions?: {label: string; value: string;}[];
}
const props = withDefaults(defineProps<Props>(), {
  expanded: false,
  appForm: () => ({ key: 'undefined-app' }),
  availableTags: () => [],
  typeOptions: () => [],
  memoryUnitOptions: () => [],
  architectureOptions : () => [],
});
const emit = defineEmits<{
  'update:expanded': [value: boolean];
  'update:appForm': [value: any];
  'update:memoryUnitOptions': [value: string[]];
  'update:architectureOptions': [value: string[]];
}>();
const expanded = computed({
  get: () => props.expanded,
  set: (value) => {
    emit('update:expanded', value);
  }
});
const appForm = computed({
  get: () => props.appForm,
  set: (value) => {
    emit('update:appForm', value);
  }
});
</script>
<template>
  <ExpandCollapseCard
    v-model:expanded="expanded"
    :title="$t('tools.app-workshop.cards.AppForm.title')"
  >
    <n-form label-placement="left" label-width="140px">
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.key.label')" required>
        <n-input clearable v-model:value="appForm.key" :placeholder="$t('tools.app-workshop.cards.AppForm.key.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.name.label')" required>
        <n-input clearable v-model:value="appForm.name" :placeholder="$t('tools.app-workshop.cards.AppForm.name.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.desc.en.label')" required>
        <n-input clearable v-model:value="appForm.description.en" :placeholder="$t('tools.app-workshop.cards.AppForm.desc.en.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.desc.zh.label')" required>
        <n-input clearable v-model:value="appForm.description.zh" :placeholder="$t('tools.app-workshop.cards.AppForm.desc.zh.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.desc.zh-Hant.label')" required>
        <n-input clearable v-model:value="appForm.description.zhHant" :placeholder="$t('tools.app-workshop.cards.AppForm.desc.zh-Hant.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.desc.ja.label')" required>
        <n-input clearable v-model:value="appForm.description.ja" :placeholder="$t('tools.app-workshop.cards.AppForm.desc.ja.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.desc.ko.label')" required>
        <n-input clearable v-model:value="appForm.description.ko" :placeholder="$t('tools.app-workshop.cards.AppForm.desc.ko.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.desc.ms.label')" required>
        <n-input clearable v-model:value="appForm.description.ms" :placeholder="$t('tools.app-workshop.cards.AppForm.desc.ms.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.desc.pt-br.label')" required>
        <n-input clearable v-model:value="appForm.description.ptBr" :placeholder="$t('tools.app-workshop.cards.AppForm.desc.pt-br.placeholder')" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.desc.ru.label')" required>
        <n-input clearable v-model:value="appForm.description.ru" :placeholder="$t('tools.app-workshop.cards.AppForm.desc.ru.placeholder')" />
      </n-form-item>
      
      <n-grid cols="2" x-gap="12">
        <n-gi>
          <n-form-item :label="$t('tools.app-workshop.cards.AppForm.tags.label')">
            <n-select
              v-model:value="appForm.tags"
              multiple
              :options="availableTags"
              :placeholder="$t('tools.app-workshop.cards.AppForm.tags.placeholder')"
            />
          </n-form-item>
        </n-gi>
        
        <n-gi>
          <n-form-item :label="$t('tools.app-workshop.cards.AppForm.type')" required>
            <n-select v-model:value="appForm.type" :options="typeOptions" />
          </n-form-item>
        </n-gi>
      </n-grid>
      
      <n-grid cols="2" x-gap="12">
        <n-gi>
          <n-form-item :label="$t('tools.app-workshop.cards.AppForm.memoryRequired.label')">
            <n-input-group>
              <n-input-number v-model:value="appForm.memoryRequired" 
                :min="0" style="width: 270px" 
                :placeholder="$t('tools.app-workshop.cards.AppForm.memoryRequired.placeholder')"
              />
              <n-select v-model:value="appForm.memoryUnit" :options="memoryUnitOptions" 
                style="width: 80px" placeholder=""
              />
            </n-input-group>
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="$t('tools.app-workshop.cards.AppForm.architectures')">
            <n-select v-model:value="appForm.architectures" multiple :options="architectureOptions" />
          </n-form-item>
        </n-gi>
      </n-grid>
      
      <n-grid cols="2" x-gap="12">
        <n-gi>
          <n-form-item :label="$t('tools.app-workshop.cards.AppForm.crossVersionUpdate')">
            <n-switch v-model:value="appForm.crossVersionUpdate" />
          </n-form-item>
        </n-gi>
        
        <n-gi>
          <n-form-item :label="$t('tools.app-workshop.cards.AppForm.limit.label')">
            <n-input-number v-model:value="appForm.limit" :min="0" :placeholder="$t('tools.app-workshop.cards.AppForm.limit.placeholder')" />
          </n-form-item>
        </n-gi>
      </n-grid>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.website')">
        <n-input clearable v-model:value="appForm.website" placeholder="https://example.com" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.github')">
        <n-input clearable v-model:value="appForm.github" placeholder="https://github.com/user/repo" />
      </n-form-item>
      
      <n-form-item :label="$t('tools.app-workshop.cards.AppForm.document')">
        <n-input clearable v-model:value="appForm.document" placeholder="https://docs.example.com" />
      </n-form-item>
    </n-form>
  </ExpandCollapseCard>
</template>
<style scoped></style>