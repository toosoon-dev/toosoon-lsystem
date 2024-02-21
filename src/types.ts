import { DEFAULT_SYMBOLS, IGNORED_SYMBOLS } from './constants';

// *********************
// Alphabets
// *********************
export type Alphabet<S extends string = string> = Array<S>;
export type DefaultAlphabet = Alphabet<(typeof DEFAULT_SYMBOLS)[number]>;
export type IgnoredAlphabet = Alphabet<(typeof IGNORED_SYMBOLS)[number]>;

export type Phrase = string;

// *********************
// Symbols
// *********************
export type Symbol<A extends Alphabet> = A[number];
export type Symbols<A extends Alphabet> = Array<Symbol<A>>;

export type ContextSymbol<A extends Alphabet> = Symbol<A> | `${Symbol<A>}${Symbol<A>}`; // If context is using multiple symbols (max: 2)
export type ContextBefore<A extends Alphabet> = `${ContextSymbol<A>}<`;
export type ContextAfter<A extends Alphabet> = `>${ContextSymbol<A>}`;
export type ParametricSymbol<A extends Alphabet> = `${Symbol<A>}(${string})`;

// *********************
// Axiom
// *********************
export type AxiomParameter<A extends Alphabet> = Phrase | Axiom<A>;
export type Axiom<A extends Alphabet> = Array<AxiomPart<A>>;
export type AxiomPart<A extends Alphabet> = { symbol: Symbol<A>; params?: number[] };

// *********************
// Defines
// *********************
export type DefineKey = string;
export type Define = number;
export type Defines = Map<DefineKey, Define>;

// *********************
// Productions
// *********************
export type ProductionParameter<A extends Alphabet, I extends Alphabet> = Phrase | Production<A, I>;

export type ProductionResult<A extends Alphabet> = false | Phrase | Axiom<A> | AxiomPart<A>;

export type Production<A extends Alphabet, I extends Alphabet> = (
  | ({ successor: Successor<A | I> } & { stochastic?: never })
  | ({ stochastic: Array<StochasticSuccessor<A | I>> } & { successor?: never })
) & {
  context?: Context<A>;
  condition?: Condition<A | I>;
  params?: string[];
};

export type Productions<A extends Alphabet, I extends Alphabet> = Map<
  Symbol<A>,
  Production<A, I> | Array<Production<A, I>>
>;

// Successors
export type SuccessorParameter<A extends Alphabet> = //
  `${ContextBefore<A> | ''}${Symbol<A> | ParametricSymbol<A>}${ContextAfter<A> | ''}`;

export type Successor<A extends Alphabet> = Phrase | SuccessorFunction<A> | Axiom<A>;

export type StochasticSuccessor<A extends Alphabet> = {
  successor: Successor<A>;
  weight: number;
};

export type SuccessorFunction<A extends Alphabet> = ({
  axiom,
  index,
  part,
  params
}: {
  axiom: Axiom<A>;
  index: number;
  part: AxiomPart<A>;
  params: number[];
}) => ProductionResult<A> | undefined;

// Options
export type ContextParameter<A extends Alphabet> = ContextSymbol<A> | Symbols<A>;
export type Context<A extends Alphabet> = { before?: ContextParameter<A>; after?: ContextParameter<A> };

export type Condition<A extends Alphabet> = ({
  axiom,
  index,
  part,
  params
}: {
  axiom: Axiom<A>;
  index: number;
  part: AxiomPart<A>;
  params: number[];
}) => boolean;

// *********************
// Commands
// *********************
export type CommandKey<A extends Alphabet, I extends Alphabet> = Symbol<A | I>;
export type Command<A extends Alphabet, I extends Alphabet> = ({
  index,
  part,
  params
}: {
  index: number;
  part: AxiomPart<A | I>;
  params: number[];
}) => void;
export type Commands<A extends Alphabet, I extends Alphabet> = Map<CommandKey<A, I>, Command<A, I>>;
