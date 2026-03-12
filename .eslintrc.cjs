'use strict';

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es2021: true,
  },

  ignorePatterns: ['dist/', 'node_modules/'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {},
    },
  },
  plugins: ['import'],
  extends: ['eslint:recommended', 'plugin:import/recommended'],
  rules: {
    // stylistic
    indent: ['error', 2, { SwitchCase: 1 }],
    quotes: ['error', 'single', { avoidEscape: true }],
    semi: ['error', 'always'],
    'comma-dangle': ['error', 'only-multiline'],

    // modern best-practices
    'prefer-const': ['error', { destructuring: 'all' }],
    'no-var': 'error',
    eqeqeq: ['error', 'always'],
    'no-console': 'warn',

    // import
    'import/no-unresolved': 'off', // handled by TS resolver in TS files
    'import/order': [
      'warn',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          ['parent', 'sibling', 'index'],
        ],
        'newlines-between': 'always',
      },
    ],
  },

  overrides: [
    // JavaScript files
    {
      files: ['*.js', '*.cjs', '*.mjs'],
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      rules: {
        // allow require in venerable JS files
      },
    },

    // TypeScript files
    {
      files: ['*.ts', '*.tsx'],
      parser: require.resolve('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      plugins: ['@typescript-eslint'],
      extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/typescript',
      ],
      rules: {
        // turn off rules which conflict with TS or are handled by TS
        'no-undef': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          { argsIgnorePattern: '^_' },
        ],
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
