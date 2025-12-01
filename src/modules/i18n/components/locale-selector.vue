<script setup lang="ts">
const { availableLocales, locale, t } = useI18n();

const localesLong: Record<string, string> = {
  ar: 'عربي',
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ga: 'Gaeilge',
  ja: '日本語',
  ko: '한국어',
  ms: 'Bahasa Melayu',
  no: 'Norwegian',
  pl: 'Polski',
  pt: 'Português',
  ru: 'Русский',
  tr: 'Turkish',
  uk: 'Українська',
  vi: 'Tiếng Việt',
  zh: '简体中文',
  'zh-hant': '繁體中文',
};

const localeOptions = computed(() =>
  availableLocales.map(locale => ({
    label: localesLong[locale] ?? locale,
    value: locale,
  })),
);
</script>

<template>
  <c-select
    v-model:value="locale"
    :options="localeOptions"
    :placeholder="t('locale-selector.select-a-language')"
    w-110px
  />
</template>
