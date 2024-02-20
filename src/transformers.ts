import { PARAMETRIC_SYMBOLS } from './symbols';
import {
  Alphabet,
  Axiom,
  AxiomParameter,
  Context,
  Defines,
  ParametricSymbol,
  Phrase,
  Production,
  ProductionParameter,
  ProductionResult,
  SuccessorParameter,
  Symbol
} from './types';

// *********************
// Normalizers
// *********************

/**
 * Normalize parameter into valid axiom
 *
 * @param {AxiomParameter|ProductionResult} parameter
 * @param {Alphabet} alphabet
 * @param {string[]} ignoredSymbols
 * @param {Defines} defines
 * @returns {Axiom}
 */
export function normalizeAxiom<A extends Alphabet, I extends Alphabet>(
  parameter: AxiomParameter<A | I> | ProductionResult<A | I>,
  alphabet: A,
  ignoredSymbols: I,
  defines: Defines
): Axiom<A | I> {
  const axiom: Axiom<A | I> = [];
  if (typeof parameter === 'string') {
    // If parameter is a Phrase, transform and merge it into new axiom
    axiom.push(...transformPhraseToAxiom<A, I>(parameter, alphabet, ignoredSymbols, defines));
  } else if (parameter instanceof Array) {
    // If parameter is an Axiom, merge it into new axiom
    axiom.push(...parameter);
  } else if (typeof parameter === 'object') {
    // If parameter is an AxiomPart, add it to new axiom
    axiom.push(parameter);
  }

  return axiom;
}

/**
 * Normalize parameter into valid Symbol & Production
 *
 * @param {SuccessorParameter} successorParameter
 * @param {ProductionParameter} productionParameter
 * @returns { symbol: Symbol; production: Production }
 */
export function normalizeProduction<A extends Alphabet, I extends Alphabet>(
  successorParameter: SuccessorParameter<A>,
  productionParameter: ProductionParameter<A, I>
): { symbol: Symbol<A>; production: Production<A, I> } {
  // Normalize production by forcing object form
  let production: Production<A, I>;

  if (typeof productionParameter === 'string') {
    production = { successor: productionParameter };
  } else {
    production = productionParameter;
  }

  // Transform classic context syntax
  const contextInfos = transformClassicContext<A>(successorParameter);
  let symbol = contextInfos.symbol;

  // Set context from classic syntax if no context is found
  if (production.context === undefined) {
    production.context = contextInfos.context;
  }

  // Transform parametrical context syntax
  const parametricInfos = transformClassicParametric<A>(symbol);
  symbol = parametricInfos.symbol;
  production.params = parametricInfos.params;

  return {
    symbol,
    production
  };
}

// *********************
// Transformers
// *********************

/**
 * Transform context classic syntax
 *
 * @param {SuccessorParameter} successorParameter
 * @returns { symbol: Symbol | ParametricSymbol; context: Context }
 */
export function transformClassicContext<A extends Alphabet>(
  successorParameter: SuccessorParameter<A>
): { symbol: Symbol<A>; context: Context<A> } {
  // Initialize values (before<symbol>after)
  let symbol: string = successorParameter;
  let context: Context<A> = {};

  // Transform 'before' classic syntax (symbol>after)
  const before = symbol.match(/(.+)<(.+)/);
  if (before) {
    context.before = before[1];
    symbol = before[2];
  }

  // Transform 'after' classic syntax (symbol)
  const after = symbol.match(/(.+)>(.+)/);
  if (after) {
    symbol = after[1];
    context.after = after[2];
  }

  return { symbol, context } as { symbol: Symbol<A>; context: Context<A> };
}

/**
 * Transform parametric classic syntax
 *
 * @param {Symbol | ParametricSymbol} parametricSymbol
 * @returns { symbol: Symbol; params: string[] }
 */
export function transformClassicParametric<A extends Alphabet>(
  parametricSymbol: Symbol<A> | ParametricSymbol<A>
): { symbol: Symbol<A>; params: string[] } {
  // Initialize values (S(0, A))
  let symbol = parametricSymbol;
  let params: string[] = [];

  // Transform parametric classic syntax (S, ['0', 'A'])
  const split = parametricSymbol.replace(/\s+/g, '').split(/[()]/);
  if (split.length > 1) {
    symbol = split[0];
    params = split[1].split(',');
  }

  return { symbol, params };
}

/**
 * Split a phrase into axiom from an alphabet
 *
 * @param {Phrase} phrase
 * @param {Alphabet} alphabet
 * @param {string[]} ignoredSymbols
 * @param {Defines} defines
 * @returns {Axiom}
 */
export function transformPhraseToAxiom<A extends Alphabet, I extends Alphabet>(
  phrase: Phrase,
  alphabet: A,
  ignoredSymbols: I,
  defines: Defines
): Axiom<A | I> {
  const split = phrase.replace(/\s+/g, '').split('');
  const axiom: Axiom<A> = [];
  let symbol = '';
  let params = [];

  let index = 0;
  for (let i = 0; i < split.length; i++) {
    symbol += split[index];

    // Transform parametric syntax
    const isParametric = split[index + 1] === PARAMETRIC_SYMBOLS[0];
    if (isParametric) {
      // Loop until next parametric end (')')
      while (split[index] !== PARAMETRIC_SYMBOLS[1] && index < split.length) {
        index++;
        symbol += split[index];
      }
      const parametricInfos = transformClassicParametric(symbol);
      symbol = parametricInfos.symbol;
      params = parametricInfos.params.map((param) => {
        defines.forEach((define, defineKey) => {
          param = param.replace(defineKey, String(define));
        });
        return eval(param);
      });
    }

    // Add new AxiomPart to Axiom
    if (alphabet.includes(symbol) || ignoredSymbols.includes(symbol)) {
      axiom.push({ symbol, params });
      symbol = '';
      params = [];
    }

    index++;
    if (index === split.length) break;
  }

  return axiom;
}

/**
 * Convert keys & values into a Map
 *
 * @param {string[]} keys
 * @param {number[]} values
 * @returns {Defines}
 */
export function transformParamsToDefines(keys?: string[], values?: number[]): Defines {
  // Create defines from from classic parametric syntax
  const defines: Defines = new Map();
  if (keys && values && keys.length === values.length) {
    keys.forEach((key, index) => defines.set(key, values[index]));
  } else {
    console.warn(
      'transformParamsToDefines',
      "keys & values lengths don't match:",
      `\nkeys: ${keys?.length}\nvalues: ${values?.length}`
    );
  }
  return defines;
}
