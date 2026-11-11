import path from 'node:path';
import antfu from '@antfu/eslint-config';
import { includeIgnoreFile } from 'eslint/config';
import { styleRulesOff, warnRules } from './scripts/lint-rules.mjs';

const gitignore = path.join(import.meta.dirname, '.gitignore');

export default antfu(
  {
    vue: true,
    typescript: true,
    // 项目通过 unplugin-auto-import 全局注入 Vue / VueUse API，
    // 关闭 no-undef 之类会误报的规则，类型正确性交给 `pnpm type-check`。
    stylistic: false,
    lessOpinionated: true,
    // 兼容历史遗留的 eslint-disable 注释（部分已不再对应任何规则）
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
  },
  // 复现旧版 `--ignore-path .gitignore` 的行为
  includeIgnoreFile(gitignore, { gitignoreResolution: true, name: 'gitignore' }),
  {
    name: 'project/compat',
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'ts/no-unused-vars': 'off',
      ...styleRulesOff,
      ...warnRules,
    },
  },
  // 按文件范围豁免两类项目约定，规则在其余代码中仍然生效：
  // 1) LocalStorage 的状态日志是刻意保留的可观察性输出；
  // 2) env.d.ts 使用 Vue 官方推荐的 *.vue 模块 shim 写法（DefineComponent<{}, {}, any>）。
  {
    name: 'project/file-exceptions',
    files: ['src/composable/aw.LocalStorage.ts'],
    rules: { 'no-console': 'off' },
  },
  {
    name: 'project/dts-exceptions',
    files: ['src/env.d.ts'],
    rules: { 'ts/no-empty-object-type': 'off' },
  },
);
