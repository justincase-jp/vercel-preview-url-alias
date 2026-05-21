module.exports = {
  extends: [
    'plugin:@jict/node',
    'plugin:@jict/typescript',
    'plugin:@jict/jest',
    'plugin:@jict/prettier',
  ],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
  rules: {
    'line-comment-position': 'off',
    'jest/expect-expect': 'off',
    '@typescript-eslint/naming-convention': 'off',
  },
};
