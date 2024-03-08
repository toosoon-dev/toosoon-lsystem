# TOOSOON L-SYSTEM

Library providing functionalities for creating and manipulating Lindenmayer systems (L-Systems) using various parameters.

**Credits**: [lindenmayer](https://github.com/nylki/lindenmayer)

## Installation

Yarn:

```properties
$ yarn add toosoon-lsystem
```

NPM:

```properties
$ npm install toosoon-lsystem
```

## Usage

### Basic

```ts
import LSystem from 'toosoon-lsystem';

const system = new LSystem({
  axiom: 'F++F++F',
  productions: { F: 'F-F++F-F' },
  iterations: 2
});

system.iterate();

console.log(system.getAxiomString());
// 'F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F'
```

### Custom Alphabet

Using custom alphabets allows you to use custom strings as symbols.

```ts
const ALPHABET = ['Block', 'Line'] as const;
type A = Alphabet<(typeof ALPHABET)[number]>;

new LSystem<A>({
  alphabet: [...ALPHABET],
  axiom: 'Block',
  productions: {
    Block: 'Block-Line',
    Line: 'Line++Block--Line'
  }
});
```

### Defines

Defines are especially usefull when coupled with [parametric syntax](#parametric-syntax).

```ts
new LSystem({
  defines: {
    [key]: [value]
  }
});
```

### Productions

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
LSystem.setProduction('F', { successor: 'FF' });
```

##### Array-based successor

If you are reading about L-System in the classic ABOP, you may have stumbled upon parametric L-Systems. Those have optional parameters inside each symbol. To make this possible you can use Arrays of successors besides basic Strings as production results (and axioms).

```ts
LSystem.setProduction('F', {
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
LSystem.setProduction('F', {
  stochastic: [
    { successor: 'A', weight: 50 }, // 50% probability
    { successor: 'AB', weight: 25 }, // 25% probability
    { successor: 'A+B', weight: 25 } // 25% probability
  ]
});
```

In order to create pseudo-randomness, [toosoon-utils/prng](https://github.com/toosoon-dev/toosoon-utils#pseudo-random-number-generator-prng) functions are used to determine stochastic outputs.

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

To apply your productions onto the axiom you call `iterate()` on your L-System instance.

In each iteration step, all symbols of the axiom are replaced with new symbols based on your defined productions.

When you call `iterate()`, the resulted axiom of your L-System is returned. You can also get the resulted axiom via `getAxiomString()`.

### Commands

To visualize or post-process your L-System you can define commands functions for each symbol. These functions are similar to productions, but instead of replacing the existing axiom, commands are used to draw for example different lines for different symbols. All commands are executed by calling `run()`.

A very common application for commands would be the creation of turtle graphics.

### Classic Syntax

#### Context-sensitive syntax

```ts
// Instead of:
system.setProduction('F', {
  successor: 'G',
  context: { before: 'AB', after: 'C' }
});

// You can write:
system.setProduction('AB<F>C', 'G');
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

## API

See full documentation [here](./docs/API.md).

## License

MIT License, see [LICENSE](https://github.com/toosoon-dev/toosoon-lsystem/tree/master/LICENSE) for details.
