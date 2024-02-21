# L-System Types

This library provides types for working with L-Systems.

## Alphabet

`Alphabet`: Represent the set of symbols used in an L-System.

```ts
type Alphabet = Array<string>;
```

## Symbols

`Symbol`: Represent a single symbol from the alphabet.

```ts
type Symbol = Alphabet[number];
```

`Symbols`: Represent an array of symbols.

```ts
type Symbols = Array<Symbol>;
```

## Axiom

`AxiomParameter`: Represent the initial phrase of the L-System. It can be a `Phrase` or an `Axiom` Array.

`Axiom`: Represent an array of axiom parts.

```ts
type Axiom = Array<AxiomPart>;
```

`AxiomPart`: Represent a single part of the axiom, consisting of a symbol and optional parameters.

```ts
type AxiomPart = { symbol: Symbol; params?: number[] };
```

## Defines

`DefineKey`: Represent the key for defining constants.

```ts
type DefineKey = string;
```

`Define`: Represent a constant value.

```ts
type Define = number;
```

`Defines`: Represent a collection of defined constants.

```ts
type Defines = Map<DefineKey, Define>;
```

## Productions

`ProductionParameter`: Represent a production for a symbol in the L-System. It can be `Phrase` or a `Production` Object.

`ProductionResult`: Represent the result of a production rule. It can be `false`, a `Phrase` (string), an `Axiom` Array or an `AxiomPart` Object;

```ts
type ProductionResult = false | Phrase | Axiom | AxiomPart;
```

`Production`: Represent a production rule with optional context, condition, and parameters.

```ts
type Production = ({ successor: Successor } | { stochastic: Array<StochasticSuccessor> }) & {
  context?: Context;
  condition?: Condition;
  params?: string[];
};
```

`Productions`: Represent a collection of production rules mapped to symbols.

```ts
type Productions = Map<Symbol, Production | Array<Production>>;
```

### Successors

`SuccessorParameter`: Represent the successor symbol along with optional context symbols. It is a string based on a single `Symbol` with classic syntax supports.

`Successor`: Represent the successor of a symbol in the L-System. It can be `Phrase` , a `Function` or an `Axiom` Array.

```ts
type Successor = Phrase | SuccessorFunction | Axiom;
```

### Options

`ContextParameter`: Represent a context parameter for defining context symbols.

`Context`: Represent the context configuration with optional before and after parameters.

```ts
type Context = { before?: ContextParameter; after?: ContextParameter };
```

`Condition`: Represent a condition function to be evaluated for a production rule.

```ts
type Condition = ({
  axiom,
  index,
  part,
  params
}: {
  axiom: Axiom;
  index: number;
  part: AxiomPart;
  params: number[];
}) => boolean;
```

## Commands

`CommandKey`: Represent a symbol used as a key for commands.

```ts
type CommandKey = Symbol;
```

`Command`: Represent a function to be executed for each corresponding symbol in the L-System.

```ts
type Command = ({ index, part, params }: { index: number; part: AxiomPart; params: number[] }) => void;
```

`Commands`: Represent a collection of commands mapped to symbols.

```ts
type Commands = Map<CommandKey, Command>;
```
