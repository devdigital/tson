module.exports = {
  types: [
    { value: 'feat', name: 'feat: a new feature' },
    { value: 'fix', name: 'fix: a bug fix' },
    { value: 'docs', name: 'docs: documentation only changes' },
    {
      value: 'style',
      name: 'style: white-space, formatting, missing semi-colons, etc',
    },
    {
      value: 'refactor',
      name:
        'refactor: a code change that neither fixes a bug nor adds a feature',
    },
    {
      value: 'perf',
      name: 'perf: a code change that improves performance',
    },
    { value: 'test', name: 'test: adding tests' },
    {
      value: 'chore',
      name:
        'chore: changes to the build process or auxiliary tools and libraries',
    },
    { value: 'revert', name: 'revert: revert a commit' },
    { value: 'wip', name: 'wip: work in progress' },
  ],
  scopes: ['all', 'docs', 'build', 'parse'],
  allowCustomScopes: false,
}
