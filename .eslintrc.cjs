/* eslint-env node */
module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json'],
    },
    root: true,
    rules: {
        indent: ['error', 4],
        'max-len': ['error', 100],
        'eol-last': 1,
        '@typescript-eslint/unbound-method': 'off',
    },
};