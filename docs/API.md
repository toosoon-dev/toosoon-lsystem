# L-System API

## Types

All the references to API types are described [here](./TYPES.md).

## L-System

- [new LSystem(parameters)](#constructor)
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
  - [.iterate(iterations)](#iterate): `Axiom`
  - [.getAxiomString()](#get-axiom-string): `string`

### Constructor

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
LSystem.alphabet: readonly Alphabet;
```

##### ignoredSymbols

Array of symbols to ignore when performing context sensitive checks. For example, you may want to define `+-` in two-dimensional turtle-graphic L-Systems to be ignored.

```ts
LSystem.ignoredSymbols: readonly Alphabet;
```

##### axiom

The initial phrase of your L-System. The axiom can also bet set later via `setAxiom()`.

```ts
LSystem.axiom: Axiom;
```

##### iterations

The number of iterations the L-System will perform when calling `iterate()`. It is also possible to set the iterations by passing it as an argument to the method: `iterate([iterations])`.

```ts
LSystem.iterations: number;
```

##### defines

Key-value Object to set constant values that will be used by the L-System.

```ts
LSystem.defines: Defines;
```

##### productions

Key-value Object to set the productions from one symbol to its axiom. Applied when calling `iterate()`.

```ts
LSystem.productions: Productions;
```

##### commands

Key-value Object to set Functions to be executed for each symbol in sequential order. Useful for visualization. Used when calling `run()`.

```ts
LSystem.commands: Commands;
```

### Methods

##### setAxiom(axiom) <a id="set-axiom"></a>

Set the axiom of the L-System.

- `axiom`: Initial phrase of the L-System.

```ts
LSystem.setAxiom(axiom: AxiomParameter): void;
```

##### setDefine(key, define) <a id="set-define"></a>

Set a define for the L-System.

- `key`: Key for defining constant.
- `define`: A constant value.

```ts
LSystem.setDefine(key: DefineKey, define: Define): void;
```

##### setDefines(defines) <a id="set-defines"></a>

Set multiple defines for the L-System.

- `defines`: Collection of defined constants.

```ts
LSystem.setDefines(defines: { [key in DefineKey]?: Define }): void;
```

##### clearDefines() <a id="clear-defines"></a>

Clear all defines from the L-System.

```ts
LSystem.clearDefines(): void;
```

##### setProduction(successorParameter, productionParameter) <a id="set-production"></a>

Set a production for the L-System.

- `successorParameter`: Successor symbol mapped to the production.
- `productionParameter`: Production rule mapped to the symbol.

```ts
LSystem.setProduction(successorParameter: SuccessorParameter, productionParameter: ProductionParameter): void;
```

##### setProductions(productions) <a id="set-productions"></a>

Set multiple productions for the L-System.

- `productions`: Collection of production rules mapped to symbols.

```ts
LSystem.setProductions(productions: { [successorParameter in SuccessorParameter]?: ProductionParameter }): void;
```

##### clearProductions() <a id="clear-productions"></a>

Clear all productions from the L-System.

```ts
LSystem.clearProductions(): void;
```

##### setCommand(symbol, command) <a id="set-command"></a>

Set a command for the L-System.

- `symbol`: Symbol used as a key for the command.
- `command`: Function to be executed for each corresponding symbol.

```ts
LSystem.setCommand(symbol: Symbol, command: Command): void;
```

##### setCommands(commands) <a id="set-commands"></a>

Set multiple commands for the L-System.

- `commands`: Collection of commands mapped to symbols.

```ts
LSystem.setCommands(commands: { [key in CommandKey]?: Command }): void;
```

##### clearCommands() <a id="clear-commands"></a>

Clear all commands from the L-System.

```ts
LSystem.clearCommands(): void;
```

##### run() <a id="run"></a>

Execute the commands defined in the L-System.

```ts
LSystem.run(): void;
```

##### iterate(iterations) <a id="iterate"></a>

Perform a specified number of iterations on the L-System.

- `[iterations]`: Number of iterations.

```ts
LSystem.iterate(iterations?: number): Axiom;
```

##### getAxiomString() <a id="get-axiom-string"></a>

Get the current axiom of the L-System.

```ts
LSystem.getAxiomString(): string;
```
