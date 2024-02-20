export const BRANCH_SYMBOLS = ['[', ']'] as const;

export const PARAMETRIC_SYMBOLS = ['(', ')'] as const;

export const DEFAULT_SYMBOLS = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z'
];

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
