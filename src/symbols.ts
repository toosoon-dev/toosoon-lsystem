export const BRANCH_SYMBOLS = ['[', ']'] as const;

export const PARAMETRIC_SYMBOLS = ['(', ')'] as const;

export const IGNORED_SYMBOLS = [
  // ' ',
  '+',
  '-',
  '&',
  '^',
  '/',
  '|',
  '\\',
  '!',
  '.',
  '{',
  '}',
  ...BRANCH_SYMBOLS,
  ...PARAMETRIC_SYMBOLS
] as const;
