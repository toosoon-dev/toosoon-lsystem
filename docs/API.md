# L-System API

## Types

All the references to existing types are described [here](./TYPES.md).

## Create L-System instance

- LSystem
  - [new LSystem(parameters)](#new-lsystem)
    - [.alphabet](#alphabet)
    - [.ignoredSymbols](#ignoredsymbols)
    - [.axiom](#axiom)
    - [.iterations](#iterations)
    - [.defines](#defines)
    - [.productions](#productions)
    - [.commands](#commands)
    - [.setAxiom(axiom)](#set-axiom)
    - [.setDefine(key, define)](#set-define)
    - [.setDefines(defines)](#set-defines)
    - [.clearDefines()](#clear-defines)
    - [.setProduction(successorParameter, productionParameter)](#set-production)
    - [.setProductions(productions)](#set-productions)
    - [.clearProductions()](#clear-productions)
    - [.setCommand(symbol, command)](#set-command)
    - [.setCommands(commands)](#set-commands)
    - [.clearCommands()](#clear-commands)
    - [.run()](#run)
    - [.iterate(iterations)](#iterate)
    - [.getAxiomString()](#get-axiom-string): `string`

### <a id="new-lsystem"></a> Parameters

| Parameter                   | Type                                                                   | Default           | Description                                                                        |
| --------------------------- | ---------------------------------------------------------------------- | ----------------- | ---------------------------------------------------------------------------------- |
| parameters                  | `LSystemParameters`                                                    |                   |                                                                                    |
| [parameters.alphabet]       | `Alphabet`                                                             | `DefaultAlphabet` | Represent the set of symbols used in an L-System.                                  |
| [parameters.ignoredSymbols] | `Alphabet`                                                             | `IgnoredAlphabet` | Represent the set of symbols to be ignored by the L-System.                        |
| [parameters.axiom]          | `Axiom`                                                                | `[]`              | The initial phrase of the L-System.                                                |
| [parameters.iterations]     | `number`                                                               | `1`               | The number of iterations to perform.                                               |
| [parameters.defines]        | `{ [key in DefineKey]?: Define }`                                      |                   | Key-value Object to set constant values that will be used by the L-System.         |
| [parameters.productions]    | `{ [successorParameter in SuccessorParameter]?: ProductionParameter }` |                   | Key-value Object to set the productions from one symbol to its axiom.              |
| [parameters.commands]       | `{ [key in CommandKey]?: Command }`                                    |                   | Key-value Object to set Functions be executed for each symbol in sequential order. |

### Properties

##### alphabet

Array of symbols supported by the L-System.

```ts
system.alphabet: readonly Alphabet;
```

##### ignoredSymbols

Array of symbols to ignore when performing context sensitive checks. For example, you may want to define `+-` in two-dimensional turtle-graphic L-Systems to be ignored.

```ts
system.ignoredSymbols: readonly Alphabet;
```

##### axiom

The initial phrase of your L-System. The axiom can also bet set later via `setAxiom()`.

```ts
system.axiom: Axiom;
```

##### iterations

The number of iterations the L-System will perform when calling `iterate()`. It is also possible to set the iterations by passing it as an argument to the method: `iterate([iterations])`.

```ts
system.iterations: number;
```

##### defines

Key-value Object to set constant values that will be used by the L-System.

```ts
system.defines: Defines;
```

##### productions

Key-value Object to set the productions from one symbol to its axiom. Applied when calling `iterate()`.

```ts
system.productions: Productions;
```

##### commands

Key-value Object to set Functions to be executed for each symbol in sequential order. Useful for visualization. Used when calling `run()`.

```ts
system.commands: Commands;
```

### Methods

<a id="set-axiom"></a>Set the axiom of the L-System.

```ts
system.setAxiom(axiom: AxiomParameter) => void;
```

<a id="set-define"></a>Set a define for the L-System.

```ts
system.setDefine(key: DefineKey, define: Define) => void;
```

<a id="set-defines"></a>Set multiple defines for the L-System.

```ts
system.setDefines(defines: { [key in DefineKey]?: Define }) => void;
```

<a id="clear-defines"></a>Clear all defines from the L-System.

```ts
system.clearDefines() => void;
```

<a id="set-production"></a>Set a production for the L-System.

```ts
system.setProduction(successorParameter: SuccessorParameter, productionParameter: ProductionParameter) => void;
```

<a id="set-productions"></a>Set multiple productions for the L-System.

```ts
system.setProductions(productions: { [successorParameter in SuccessorParameter]?: ProductionParameter }) => void;
```

<a id="clear-productions"></a>Clear all productions from the L-System.

```ts
system.clearProductions() => void;
```

<a id="set-command"></a>Set a command for the L-System.

```ts
system.setCommand(symbol: Symbol, command: Command)  => void;
```

<a id="set-commands"></a>Set multiple commands for the L-System.

```ts
system.setCommands(commands: { [key in CommandKey]?: Command }) => void;
```

<a id="clear-commands"></a>Clear all commands from the L-System.

```ts
system.clearCommands() => void;
```

<a id="run"></a>Execute commands defined in the L-System.

```ts
system.run() => void;
```

<a id="iterate"></a>Perform a specified number of iterations on the L-System.

```ts
system.iterate(iterations?: number) => Axiom;
```

<a id="get-axiom-string"></a>Get the current axiom of the L-System.

```ts
system.getAxiomString() => string;
```

## Usages

### Basic

```ts
new LSystem({
  axiom: 'F',
  productions: {
    F: 'F-A',
    A: 'F+A'
  }
});
```

### Custom Alphabet

Using custom alphabets allows you to use custom Strings as symbols.

```ts
const ALPHABET = ['Block', 'Line'] as const;
type A = Alphabet<(typeof ALPHABET)[number]>;

new LSystem<A>({
  alphabet: [...ALPHABET],
  axiom: 'Block',
  productions: {
    Block: 'Block-Line',
    Line: 'Line++Line--Block'
  }
});
```

### Defines

- Define

  `key`: Name of the define Object.

  `value`: Value of that will be injected by L-System.

Defines are especially usefull coupled with [parametric syntax](#parametric-syntax).

```ts
new LSystem({
  defines: {
    [key]: [value]
  }
});
```

### Productions

- Production

  `symbol`: One symbol string from the L-System Alphabet.

  `production`: Either the result of a production or a production Object.

You can set productions in two ways.

Multiple productions via constructor:

```ts
new LSystem({
  productions: {
    [symbol]: [production],
    [symbol]: [production]
  }
});
```

Or via the setter-methods:

```ts
// Set single production
system.setProduction([symbol], [production]);
```

```ts
// Set multiple productions
system.setProductions({
  [symbol]: [production],
  [symbol]: [production]
});
```

#### String-Based Productions

The most basic production consists of a single string, representing the result of a production.

```ts
// Each 'F' will be replacd with 'FF'
system.setProduction('F', 'FF');
```

#### Object-based Productions

To allow even more flexibility than String-based productions, you can choose to use a wrapper Object in the following way to allow for stochastic, context-sensitive and conditional L-Systems. This object basically wraps around a regular Array, String or Function Production, which are now defined in the successor field.

##### String-based successor

Equivalent to String-based productions for Object-based ones.

```ts
system.setProduction('F', { successor: 'FF' });
```

##### Array-based successor

If you are reading about L-System in the classic ABOP, you may have stumbled upon parametric L-Systems. Those have optional parameters inside each symbol. To make this possible you can use Arrays of successors besides basic Strings as production results (and axioms).

```ts
system.setProduction('F', {
  successor: [
    { symbol: 'F', params: [1, 2] },
    { symbol: 'F', params: [3, 4] }
  ]
});
```

##### Context-sensitive production

To add a context-sensitive check you can add `before` and `after` contexts properties.

```ts
// Replace 'F' with 'FF' only if precceded by 'FA' and followed by 'A'
system.setProduction('F', {
  successor: 'FF',
  context: { before: 'FA', after: 'A' }
});
```

See also the chapter on [classic syntax](#context-sensitive-syntax) to learn how to write more concise context sensitive productions.

##### Parametrical production

See the chapter on [classic syntax](#parametric-syntax) to learn how to write concise parametrical productions.

##### Conditional production

You may also define a condition which has to return a boolean.

```ts
// Replace 'F' with 'FF' only if condition is `true`
myLsystem.setProduction('F', {
  successor: 'FF',
  condition: () => {
    return condition === true;
  }
});
```

##### Stochastic production

Instead of a single successor, a stochastic L-System defines an Array which includes multiple Objects with their own successor. The weight property defines the probability of each successor to be choosen. If all successors have the same weight they have an equal chance to get choosen. If one successor has a higher weight than another, it is more likely to get choosen.

```ts
system.setProduction('F', {
  stochastic: [
    { successor: 'A', weight: 50 }, // 50% probability
    { successor: 'AB', weight: 25 }, // 25% probability
    { successor: 'A+B', weight: 25 } // 25% probability
  ]
});
```

In order to create pseudo-randomness, [toosoon-prng](https://github.com/toosoon-dev/toosoon-prng) is used to determine stochastic outputs.

##### Function-based successor

Besides Strings and Arrays, you can also define functions as successors for complete flexibilty. Each successor function has also access to an info object:

- `axiom`: Reference to the current axiom. Useful in combination with index.
- `index`: The current index of the symbol inside the whole axiom.
- `part`: The current symbol part. Not very useful for String based L-Systems. But for Array based ones, this lets you access the whole symbol object, including any custom parameters you added.
- `params`: Shorthand for `part.params`.

A successor function returns a valid production result. If nothing or `false` is returned, the symbol will not replaced.

Usages examples:

```ts
// Replace 'F' with 'A' if it is at least at index 3 (4th position) inside the current axiom, otherwise return 'B'
system.setAxiom('FFFFFFF');
system.setProduction('F', {
  successor: ({ index }) => (index >= 3 ? 'A' : 'B')
});
system.iterate(); // 'FFFFFF' results in -> 'BBBAAAA'

// Replace any occurrence of 'F' with a random amount (but max. 5) of 'F'
system.setProduction('F', {
  successor: () => {
    let result = '';
    let n = Math.ceil(Math.random() * 5);
    for (let i = 0; i < n; i++) result += 'F';
    return result;
  }
});

// Replace 'F' with 'FM' on mondays and with 'FT' on tuesdays. Otherwise nothing is returned, therefore 'F' stays 'F'
system.setProduction('F', {
  successor: () => {
    const day = new Date().getDay();
    if (day === 1) return 'FM';
    if (day === 2) return 'FT';
  }
});
```

#### Apply Productions

To apply your productions onto the axiom you call `iterate([iterations])` on your L-System instance.

In each iteration step, all symbols of the axiom are replaced with new symbols based on your defined productions.

When you call `iterate()`, the reduced string result/axiom of your L-System is returned. You can also get the string result/axiom via `getAxiomString()`.

### Commands

To visualize or post-process your L-System you can define commands functions for each symbol. These functions are similar to productions, but instead of replacing the existing axiom, commands are used to draw for example different lines for different symbols. All commands are executed by calling `run()`.

A very common application for commands would be the creation of turtle graphics.

### Classic Syntax

#### Context-sensitive syntax

```ts
// Instead of:
system.setProduction('F', {
  successor: 'C',
  context: { before: 'AB', after: 'D' }
});

// You can write:
system.setProduction('AB<F>D', 'C');
```

#### Parametric syntax

```ts
// Instead of:
system.setProduction('F', {
  successor: [
    { symbol: 'A', params: [1] },
    { symbol: 'B', params: [2, 1] }
  ]
});

// You can write:
system.setProduction('F', 'A(1) B(2, 1)');

// Then use parametrical productions:
system.setProduction('A(t)', 'B(t, t + 1)');
system.setProduction('B(t, d)', 'A(t * d)');
```
