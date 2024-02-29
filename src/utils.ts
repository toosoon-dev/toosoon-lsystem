import { cyrb128, splitmix32 } from 'toosoon-utils/prng';

import { BRANCH_SYMBOLS } from './constants';
import { transformPhraseToAxiom } from './transformers';
import { Alphabet, Axiom, ContextParameter, Defines } from './types';

/**
 * Check if a symbol matches a context
 *
 * @param {object}
 * @returns {boolean}
 */
export function matchContext<A extends Alphabet, I extends Alphabet>({
  axiom,
  index,
  match,
  direction,
  alphabet,
  ignoredSymbols,
  defines
}: {
  axiom: Axiom<A>;
  index: number;
  match: ContextParameter<A>;
  direction: 'before' | 'after';
  alphabet: A;
  ignoredSymbols: I;
  defines: Defines;
}): boolean {
  // Normalize match
  const matchSymbols =
    typeof match === 'string'
      ? transformPhraseToAxiom<A, I>(match, alphabet, ignoredSymbols, defines).map((part) => part.symbol)
      : match;

  let branchCount = 0;
  let explicitBranchCount = 0;

  // Set some variables depending on the direction to match
  let axiomIndex: number;
  let matchIndex: number;
  let matchIndexChange: number;
  let matchIndexOverflow: number;
  let loopIndexChange: number;
  let branchStart: (typeof BRANCH_SYMBOLS)[number];
  let branchEnd: (typeof BRANCH_SYMBOLS)[number];
  if (direction === 'before') {
    axiomIndex = index - 1;
    matchIndex = matchSymbols.length - 1;
    matchIndexChange = -1;
    matchIndexOverflow = -1;
    loopIndexChange = -1;
    branchEnd = BRANCH_SYMBOLS[0];
    branchStart = BRANCH_SYMBOLS[1];
  } else {
    axiomIndex = index + 1;
    matchIndex = 0;
    matchIndexChange = +1;
    matchIndexOverflow = matchSymbols.length;
    loopIndexChange = +1;
    branchStart = BRANCH_SYMBOLS[0];
    branchEnd = BRANCH_SYMBOLS[1];
  }

  // Loop into axiom
  for (; axiomIndex < axiom.length && axiomIndex >= 0; axiomIndex += loopIndexChange) {
    let axiomSymbol = axiom[axiomIndex].symbol;
    let matchSymbol = matchSymbols[matchIndex];

    // Compare current symbol of axiom with current symbol of match
    if (axiomSymbol === matchSymbol) {
      // If it's a match and previously NOT inside branch (branchCount === 0) or in explicitly wanted branch (explicitBranchCount > 0)
      if (branchCount === 0 || explicitBranchCount > 0) {
        // If a bracket was explicitly stated in match axiom
        if (axiomSymbol === branchStart) {
          explicitBranchCount++;
          branchCount++;
          matchIndex += matchIndexChange;
        } else if (axiomSymbol === branchEnd) {
          explicitBranchCount = Math.max(0, explicitBranchCount - 1);
          branchCount = Math.max(0, branchCount - 1);
          // Only increase match if we are out of explicit branch
          if (explicitBranchCount === 0) matchIndex += matchIndexChange;
        } else {
          matchIndex += matchIndexChange;
        }
      }

      // Overflowing matchIndices (matchIndexEnd for 'before' match, matchIndex + 1 for 'after' match)
      if (matchIndex === matchIndexOverflow) {
        return true;
      }
    } else if (axiomSymbol === branchStart) {
      branchCount++;
      if (explicitBranchCount > 0) explicitBranchCount++;
    } else if (axiomSymbol === branchEnd) {
      branchCount = Math.max(0, branchCount - 1);
      if (explicitBranchCount > 0) explicitBranchCount = Math.max(0, explicitBranchCount - 1);
    } else if (
      (branchCount === 0 || (explicitBranchCount > 0 && matchSymbol !== branchEnd)) &&
      ignoredSymbols.includes(axiomSymbol) === false
    ) {
      // Not in branch or if in explicit branch and not at the very end (']'), and symbol not in ignoredSymbols: return false
      return false;
    }
  }

  return false;
}

/**
 * Select a pseudo-random index from an array of weighted items
 *
 * @param {string} seed
 * @param {number[]} weights Array of weights
 * @returns {number} Random index based on weights
 */
export function pseudoRandomIndex(seed: string, weights: number[]): number {
  if (weights.length === 0) return -1;

  let totalWeight = 0;
  for (let weight of weights) {
    totalWeight += weight;
  }

  if (totalWeight <= 0) {
    console.warn('pseudoRandomIndex()', 'Weights must sum to > 0', totalWeight);
  }

  const hashes = cyrb128(seed);
  let random = splitmix32(hashes[0]) * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }

  return 0;
}
