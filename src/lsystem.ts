import { randomIndex } from 'toosoon-utils/prng';

import { DEFAULT_SYMBOLS, IGNORED_SYMBOLS } from './constants';
import { normalizeAxiom, normalizeProduction, transformParamsToDefines, transformPhraseToAxiom } from './transformers';
import {
  Alphabet,
  Axiom,
  AxiomParameter,
  AxiomPart,
  Command,
  CommandKey,
  Commands,
  DefaultAlphabet,
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

/**
 * LSystem class
 *
 * @exports
 * @class LSystem
 */
export default class LSystem<A extends Alphabet = DefaultAlphabet, I extends Alphabet = IgnoredAlphabet> {
  readonly alphabet: A;
  readonly ignoredSymbols: I;
  axiom: Axiom<A | I> = [];
  iterations: number;
  defines: Defines = new Map();
  productions: Productions<A, I> = new Map();
  commands: Commands<A, I> = new Map();

  constructor({
    alphabet = [...DEFAULT_SYMBOLS] as A,
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

  /**
   * Set the axiom of the L-System
   *
   * @param {AxiomParameter} axiom Initial phrase of this L-System
   */
  public setAxiom(axiom: AxiomParameter<A | I>): void {
    this.axiom = normalizeAxiom<A, I>(axiom, this.alphabet, this.ignoredSymbols, this.defines);
  }

  /**
   * Set a define for this L-System
   *
   * @param {DefineKey} key Key for defining constant
   * @param {Define} define A constant value
   */
  public setDefine(key: DefineKey, define: Define): void {
    this.defines.set(key, define);
  }

  /**
   * Set multiple defines for the L-System.
   *
   * @param {object} defines Collection of defined constants
   */
  public setDefines(defines: { [key in DefineKey]?: Define }): void {
    this.clearDefines();
    Object.entries(defines).forEach(([key, define]) => this.setDefine(key as DefineKey, define as Define));
  }

  /**
   * Clear all defines from this L-System
   */
  public clearDefines(): void {
    this.defines = new Map();
  }

  /**
   * Set a production for the L-System.
   *
   * @param {SuccessorParameter} successorParameter   Successor symbol mapped to the production
   * @param {ProductionParameter} productionParameter Production rule mapped to the symbol
   */
  public setProduction(
    successorParameter: SuccessorParameter<A>,
    productionParameter: ProductionParameter<A, I>
  ): void {
    // Apply transformers and normalizations
    const { symbol, production } = normalizeProduction<A, I>(successorParameter, productionParameter);

    if (this.productions.has(symbol)) {
      // Add new production to array if other productions are already associated to this symbol
      let existingProduction = this.productions.get(symbol) as Production<A, I> | Array<Production<A, I>>;
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

  /**
   * Set multiple productions for this L-System
   *
   * @param {object} productions Collection of production rules mapped to symbols
   */
  public setProductions(productions: {
    [successorParameter in SuccessorParameter<A>]?: ProductionParameter<A, I>;
  }): void {
    this.clearProductions();
    Object.entries(productions).forEach(([successorParameter, productionParameter]) =>
      this.setProduction(successorParameter as SuccessorParameter<A>, productionParameter as ProductionParameter<A, I>)
    );
  }

  /**
   * Clear all productions from the L-System
   */
  public clearProductions(): void {
    this.productions = new Map();
  }

  /**
   * Return the result of a production rule
   *
   * @param {Production} production
   * @param {AxiomPart} part
   * @param {number} index
   * @param {boolean} [recursive=false]
   * @returns {ProductionResult}
   */
  protected getProductionResult(
    production: Production<A, I>,
    part: AxiomPart<A | I>,
    index: number,
    recursive: boolean = false
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
      const weights = production.stochastic.map((item) => item.weight);
      const item = production.stochastic[randomIndex(seed, weights)];
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
      result = production.successor({ axiom: this.axiom, index, part, params: part.params ?? [] }) ?? false;
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

  /**
   * Apply productions rules on current axiom.
   * It corresponds to 1 iteration of this L-System.
   *
   * @returns {Axiom}
   */
  protected applyProductions(): Axiom<A | I> {
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

  /**
   * Set a command for this L-System
   *
   * @param {Symbol} symbol   Symbol used as a key for the command
   * @param {Command} command Function to be executed for each corresponding symbol
   */
  public setCommand(symbol: Symbol<A | I>, command: Command<A, I>): void {
    this.commands.set(symbol, command);
  }

  /**
   * Set multiple commands for this L-System
   *
   * @param {object} commands Collection of commands mapped to symbols
   */
  public setCommands(commands: { [key in CommandKey<A, I>]?: Command<A, I> }): void {
    this.clearCommands();
    Object.entries(commands).forEach(([key, command]) =>
      this.setCommand(key as CommandKey<A, I>, command as Command<A, I>)
    );
  }

  /**
   * Clear all commands from this L-System
   */
  public clearCommands(): void {
    this.commands = new Map();
  }

  /**
   * Execute the commands defined in this L-System
   */
  public run(): void {
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

  /**
   * Perform a specified number of iterations on this L-System
   *
   * @param {number} [iterations] Number of iterations
   * @returns {Axiom}
   */
  public iterate(iterations: number = this.iterations): Axiom<A | I> {
    this.iterations = Math.floor(iterations);
    for (let i = 0; i < iterations; i++) {
      this.axiom = this.applyProductions();
    }
    return this.axiom;
  }

  /**
   * Get the current axiom of this L-System
   *
   * @returns {string}
   */
  public getAxiomString(): string {
    if (typeof this.axiom === 'string') return this.axiom;
    return this.axiom.reduce((prev, current) => prev + current.symbol, '');
  }
}
