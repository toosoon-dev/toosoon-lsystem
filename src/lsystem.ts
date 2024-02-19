import prng from 'toosoon-prng';

import { IGNORED_SYMBOLS } from './symbols';
import { normalizeAxiom, normalizeProduction, transformParamsToDefines, transformPhraseToAxiom } from './transformers';
import {
  Alphabet,
  Axiom,
  AxiomParameter,
  AxiomPart,
  Command,
  CommandKey,
  Commands,
  Define,
  DefineKey,
  Defines,
  IgnoredAlphabet,
  Production,
  ProductionParameter,
  ProductionResult,
  Productions,
  SuccessorParameter,
  Symbol
} from './types';
import { matchContext } from './utils';

export type LSystemParameters<A extends Alphabet, I extends Alphabet = IgnoredAlphabet> = {
  readonly alphabet: A;
  readonly ignoredSymbols?: I;
  axiom?: AxiomParameter<A | I>;
  iterations?: number;
  defines?: { [key in DefineKey]?: Define };
  productions?: { [successorParameter in SuccessorParameter<A>]?: ProductionParameter<A, I> };
  commands?: { [key in CommandKey<A, I>]?: Command<A, I> };
};

export default class LSystem<A extends Alphabet, I extends Alphabet = IgnoredAlphabet> {
  readonly alphabet: A;
  readonly ignoredSymbols: I;
  axiom: Axiom<A | I> = [];
  iterations: number;
  defines: Defines = new Map();
  productions: Productions<A, I> = new Map();
  commands: Commands<A, I> = new Map();

  constructor({
    alphabet,
    ignoredSymbols = [...IGNORED_SYMBOLS] as I,
    axiom = '',
    iterations = 1,
    defines,
    productions,
    commands
  }: LSystemParameters<A, I>) {
    this.alphabet = alphabet;
    this.ignoredSymbols = ignoredSymbols;

    this.setAxiom(axiom);
    this.iterations = Math.floor(iterations);

    if (defines) this.setDefines(defines);
    if (productions) this.setProductions(productions);
    if (commands) this.setCommands(commands);
  }

  setAxiom(axiom: AxiomParameter<A | I>) {
    this.axiom = normalizeAxiom<A, I>(axiom, this.alphabet, this.ignoredSymbols, this.defines);
  }

  setDefine(key: DefineKey, define: Define) {
    this.defines.set(key, define);
  }

  setDefines(defines: { [key in DefineKey]?: Define }) {
    this.clearDefines();
    Object.entries(defines).forEach(([key, define]) => {
      this.setDefine(key as DefineKey, define as Define);
    });
  }

  clearDefines() {
    this.defines = new Map();
  }

  setProduction(successorParameter: SuccessorParameter<A>, productionParameter: ProductionParameter<A, I>) {
    // Apply transformers and normalizations
    const { symbol, production } = normalizeProduction<A, I>(successorParameter, productionParameter);

    if (this.productions.has(symbol)) {
      // Add new production to array if other productions are already associated to this symbol
      let existingProduction = this.productions.get(symbol) as Production<A, I> | Production<A, I>[];
      // TODO: Compare productions context and merge/replace existing production

      if (!(existingProduction instanceof Array)) {
        existingProduction = [existingProduction];
      }

      existingProduction.push(production);
      this.productions.set(symbol, existingProduction);
    } else {
      // Set new production if this symbol has no associated production yet
      this.productions.set(symbol, production);
    }
  }

  setProductions(productions: { [successorParameter in SuccessorParameter<A>]?: ProductionParameter<A, I> }) {
    this.clearProductions();
    Object.entries(productions).forEach(([successorParameter, productionParameter]) => {
      this.setProduction(successorParameter as SuccessorParameter<A>, productionParameter as ProductionParameter<A, I>);
    });
  }

  clearProductions() {
    this.productions = new Map();
  }

  getProductionResult(
    production: Production<A, I>,
    part: AxiomPart<A | I>,
    index: number,
    recursive = false
  ): ProductionResult<A | I> {
    let result: ProductionResult<A | I> = false;
    let precheck = true;

    // TODO: Eval string for condition
    if (
      // Check if condition is true
      production.condition !== undefined &&
      production.condition({ axiom: this.axiom, index, part, params: part.params ?? [] }) === false
    ) {
      precheck = false;
    } else if (production.context?.before !== undefined || production.context?.after !== undefined) {
      // Check left and right contexts
      const contextParameters = {
        axiom: this.axiom,
        index: index,
        alphabet: this.alphabet,
        defines: this.defines,
        ignoredSymbols: this.ignoredSymbols
      };
      if (production.context?.before && production.context?.after) {
        precheck =
          matchContext({
            direction: 'before',
            match: production.context.before,
            ...contextParameters
          }) &&
          matchContext({
            direction: 'after',
            match: production.context.after,
            ...contextParameters
          });
      } else if (production.context?.before) {
        precheck = matchContext({
          direction: 'before',
          match: production.context.before,
          ...contextParameters
        });
      } else if (production.context?.after) {
        precheck = matchContext({
          direction: 'after',
          match: production.context.after,
          ...contextParameters
        });
      }
    }

    if (precheck === false) {
      // If conditions and context don't allow production, keep result = false
      result = false;
    } else if (production.stochastic) {
      // For stochastic productions pick a successor from the list according to their weight
      const seed = `${part.symbol}-${index}`;
      const weights = production.stochastic.map((item) => item.weight as number);
      const item = production.stochastic[prng.randomIndex(seed, weights)];
      result = this.getProductionResult({ successor: item.successor }, part, index);
    } else if (typeof production.successor === 'string') {
      // If parameter is a Phrase, transform and merge it into new axiom
      // Merge production params (from classic parametric syntax) to global defines
      const defines = new Map();
      this.defines.forEach((value, key) => defines.set(key, value));
      transformParamsToDefines(production.params, part.params).forEach((value, key) => defines.set(key, value));
      result = transformPhraseToAxiom<A, I>(production.successor, this.alphabet, this.ignoredSymbols, defines);
    } else if (typeof production.successor === 'function') {
      // If successor is a function, execute function and append returned value
      result = production.successor({ axiom: this.axiom, index, part });
    } else if (production.successor instanceof Array) {
      // If successor is an Axiom array, return value
      result = production.successor;
    }

    // Allow false results for recursive calls
    if (!result) {
      return recursive ? result : part;
    }

    return result;
  }

  applyProductions() {
    let axiom: Axiom<A | I> = [];
    let index = 0;

    // Iterate all symbols of the axiom and lookup according productions
    this.axiom.forEach((part) => {
      const symbol = part.symbol;
      let productionResult: ProductionResult<A | I> = part;

      if (this.productions.has(symbol)) {
        const production = this.productions.get(symbol) as Production<A, I> | Production<A, I>[];
        if (production instanceof Array) {
          // If symbol has multiple productions associated, set first valid result
          for (let productionItem of production) {
            let result = this.getProductionResult(productionItem, part, index, true);
            if (result) {
              productionResult = result;
              break;
            }
          }
        } else {
          // If symbol has only one production associated, set result
          productionResult = this.getProductionResult(production, part, index);
        }
      }

      // Add result to new axiom
      axiom.push(...normalizeAxiom<A, I>(productionResult, this.alphabet, this.ignoredSymbols, this.defines));

      index++;
    });

    return axiom;
  }

  setCommand(symbol: Symbol<A | I>, command: Command<A, I>) {
    this.commands.set(symbol, command);
  }

  setCommands(commands: { [key in CommandKey<A, I>]?: Command<A, I> }) {
    this.clearCommands();
    Object.entries(commands).forEach(([key, command]) => {
      this.setCommand(key as CommandKey<A, I>, command as Command<A, I>);
    });
  }

  run() {
    let index = 0;
    // Execute commands
    this.axiom.forEach((part) => {
      const symbol = part.symbol;
      if (this.commands.has(symbol)) {
        const command = this.commands.get(symbol) as Command<A, I>;
        command({ index, part, params: part.params ?? [] });
      }
      index++;
    });
  }

  clearCommands() {
    this.commands = new Map();
  }

  iterate(iterations: number = this.iterations) {
    this.iterations = Math.floor(iterations);
    for (let i = 0; i < iterations; i++) {
      this.axiom = this.applyProductions();
    }
    return this.axiom;
  }

  getAxiomString(): string {
    if (typeof this.axiom === 'string') return this.axiom;
    return this.axiom.reduce((prev, current) => prev + current.symbol, '');
  }
}
