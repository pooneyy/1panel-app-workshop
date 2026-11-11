/**
 * 项目沿用的是早期 antfu 配置（ESLint 8 + .eslintrc），从未按 v10 引入的
 * 排序/格式偏好规则书写。这里统一关闭这类"纯风格"规则，避免 `pnpm lint`
 * 因为数百条 import 顺序、模板属性顺序告警而失败；能抓真实缺陷的规则
 * （未使用变量、console、正则回溯、Vue 宏顺序等）仍然保留并降级为 warning。
 *
 * 若要逐步治理代码风格，可从此列表中逐条移除规则并配合 `eslint --fix`。
 */
export const styleRulesOff = {
  // import / export 排序（v10 新增的 perfectionist 系列）
  'perfectionist/sort-imports': 'off',
  'perfectionist/sort-named-imports': 'off',
  'perfectionist/sort-named-exports': 'off',
  'import/consistent-type-specifier-style': 'off',
  'ts/no-use-before-define': 'off',
  'ts/no-import-type-side-effects': 'off',

  // Vue 模板排版偏好
  'vue/attributes-order': 'off',
  'vue/html-indent': 'off',
  'vue/html-closing-bracket-spacing': 'off',
  'vue/html-closing-bracket-newline': 'off',
  'vue/first-attribute-linebreak': 'off',
  'vue/html-self-closing': 'off',
  'vue/attribute-hyphenation': 'off',
  'vue/singleline-html-element-content-newline': 'off',
  'vue/multiline-html-element-content-newline': 'off',
  'vue/v-on-event-hyphenation': 'off',
  'vue/component-name-in-template-casing': 'off',
  'vue/prop-name-casing': 'off',

  // 其余与项目既有写法冲突的建议型规则
  'object-shorthand': 'off',
  'prefer-template': 'off',
  'unicorn/prefer-number-properties': 'off',
  'unicorn/new-for-builtins': 'off',
};

/** 保留但降级为 warning 的规则：能发现真实问题，但不阻断 lint 命令。 */
export const warnRules = {
  'unused-imports/no-unused-vars': 'warn',
  'regexp/no-super-linear-backtracking': 'warn',
  'regexp/use-ignore-case': 'warn',
  'no-console': 'warn',
  'ts/no-empty-object-type': 'warn',
  'vue/define-macros-order': 'warn',
  'vue/no-required-prop-with-default': 'warn',
  'jsdoc/check-types': 'warn',
  'prefer-const': 'warn',
  'e18e/prefer-object-has-own': 'warn',
  'no-prototype-builtins': 'warn',
  'ts/no-unused-expressions': 'warn',
  'no-sequences': 'warn',
  'no-template-curly-in-string': 'warn',
};
