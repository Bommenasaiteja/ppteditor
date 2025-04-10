// https://eslint.org/docs/rules/

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
  root: true,
  env: {
    node: true,
    'vue/setup-compiler-macros': true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'eqeqeq': ['error', 'always'],
    'semi': ['error', 'never'],
    'quotes': ['error', 'single', {
      'avoidEscape': true,
      'allowTemplateLiterals': true,
    }],
    'key-spacing': ['error', {
      'beforeColon': false,
      'afterColon': true,
      'mode': 'strict',
    }],
    'no-empty': 'error',
    'no-else-return': 'error',
    'no-multi-spaces': 'error',
    'require-await': 'error',
    'spaced-comment': ['error', 'always'],
    'arrow-spacing': 'error',
    'no-duplicate-imports': 'error',
    'comma-spacing': ['error', {
      'before': false,
      'after': true,
    }],
    'default-case': 'error',
    'consistent-this': ['error', '_this'],
    'max-depth': ['error', 8],
    'max-lines': ['error', 1400],
    'no-multi-str': 'error',
    'space-infix-ops': 'error',
    'keyword-spacing': ['error'],
    'prefer-const': 'error',
    'no-useless-return': 'error',
    'array-bracket-spacing': 'error',
    'no-useless-escape': 'off',
    'no-eval': 'error',
    'no-var': 'error',
    'no-with': 'error',
    'no-alert': isProduction ? 'error' : 'warn',
    'no-console': isProduction ? 'error' : 'warn',
    'no-debugger': isProduction ? 'error' : 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': ['error', {
      'extendDefaults': true,
      'types': {
        '{}': false,
      },
    }],
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    'vue/multi-word-component-names': 'off',
    'vue/no-reserved-component-names': 'off',
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true,
      },
    },
  ],
}