/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'chore',
        'style',
        'hotfix',
        'design',
        'comment',
        'remove',
        'rename',
        'docs',
        'refactor',
        'test',
        'init',
        'build',
      ],
    ],
    'scope-empty': [0],
    'subject-full-stop': [0],
    'header-max-length': [2, 'always', 100],
  },
};
