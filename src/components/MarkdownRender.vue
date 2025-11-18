<!-- @/components/MarkdownRender.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 配置 marked 使用 highlight.js 进行代码高亮
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
});

interface Props {
  value: string;
  language?: string;
  downloadFileName?: string;
}

const props = withDefaults(defineProps<Props>(), {
  value: '',
  language: 'markdown',
  downloadFileName: '',
});

// 将 markdown 转换为 HTML
const renderedHtml = computed(() => {
  if (!props.value.trim()) {
    return '<p>暂无内容</p>';
  }
  return marked(props.value);
});
</script>

<template>
  <div class="markdown-render-container">
    <div class="markdown-content" v-html="renderedHtml" />
  </div>
</template>

<style scoped>
.markdown-render-container {
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  overflow: hidden;
}

.download-section {
  padding: 12px;
  border-bottom: 1px solid #d9d9d9;
  background-color: #fafafa;
}

.markdown-content {
  padding: 16px;
  min-height: 100px;
  max-height: 400px;
  overflow-y: auto;
  background-color: white;
}

/* Markdown 内容样式 */
.markdown-content :deep() {
  line-height: 1.6;
}

.markdown-content :deep(h1) {
  font-size: 1.8em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
  margin-top: 1em;
  margin-bottom: 0.8em;
}

.markdown-content :deep(h2) {
  font-size: 1.5em;
  border-bottom: 1px solid #eaecef;
  padding-bottom: 0.3em;
  margin-top: 1.2em;
  margin-bottom: 0.6em;
}

.markdown-content :deep(h3) {
  font-size: 1.25em;
  margin-top: 1em;
  margin-bottom: 0.6em;
}

.markdown-content :deep(p) {
  margin: 0.8em 0;
}

.markdown-content :deep(ul), 
.markdown-content :deep(ol) {
  padding-left: 2em;
  margin: 0.8em 0;
}

.markdown-content :deep(li) {
  margin: 0.4em 0;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #dfe2e5;
  padding-left: 1em;
  margin: 1em 0;
  color: #6a737d;
}

.markdown-content :deep(pre) {
  background-color: #f6f8fa;
  border-radius: 6px;
  padding: 16px;
  overflow: auto;
  margin: 1em 0;
}

.markdown-content :deep(code) {
  background-color: rgba(175, 184, 193, 0.2);
  border-radius: 6px;
  padding: 0.2em 0.4em;
  font-size: 0.85em;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content :deep(th), 
.markdown-content :deep(td) {
  border: 1px solid #dfe2e5;
  padding: 6px 13px;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f6f8fa;
  font-weight: 600;
}

.markdown-content :deep(a) {
  color: #0366d6;
  text-decoration: none;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
}
</style>