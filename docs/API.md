# L-System API

## Types

All the references to API types are described [here](./TYPES.md).

## L-System <a id="l-system"></a>

- [new LSystem(params)](#l-system-constructor)
  - [.alphabet](#l-system-alphabet): `readonly Alphabet`
  - [.ignoredSymbols](#l-system-ignored-symbols): `readonly Alphabet`
  - [.axiom](#l-system-axiom): `Axiom`
  - [.iterations](#l-system-iterations): `number`
  - [.defines](#l-system-defines): `readonly Map`
  - [.productions](#l-system-productions): `readonly Map`
  - [.commands](#l-system-commands): `readonly Map`
  - [.setAxiom(axiom)](#l-system-set-axiom-method): `void`
  - [.setDefine(key, define)](#l-system-set-define-method): `void`
  - [.setDefines(defines)](#l-system-set-defines-method): `void`
  - [.clearDefines()](#l-system-clear-defines-method): `void`
  - [.setProduction(successorParameter, productionParameter)](#l-system-set-production-method): `void`
  - [.setProductions(productions)](#l-system-set-productions-method): `void`
  - [.clearProductions()](#l-system-clear-productions-method): `void`
  - [.setCommand(symbol, command)](#l-system-set-command-method): `void`
  - [.setCommands(commands)](#l-system-set-commands-method): `void`
  - [.clearCommands()](#l-system-clear-commands-method): `void`
  - [.run()](#l-system-run-method): `void`
  - [.iterate(iterations?)](#l-system-iterate-method): `Axiom`
  - [.getAxiomString()](#l-system-get-axiom-string-method): `string`

### Constructor <a id="l-system-constructor"></a>

| Parameter               | Type                                                                   | Default           | Description                                                                             |
| ----------------------- | ---------------------------------------------------------------------- | ----------------- | --------------------------------------------------------------------------------------- |
| params                  | `LSystemParameters`                                                    |                   |                                                                                         |
| [params.alphabet]       | `Alphabet`                                                             | `DefaultAlphabet` | Represent the set of symbols used in an L-System.                                       |
| [params.ignoredSymbols] | `Alphabet`                                                             | `IgnoredAlphabet` | Represent the set of symbols to be ignored by the L-System.                             |
| [params.axiom]          | `Axiom`                                                                | `[]`              | The initial phrase of the L-System.                                                     |
| [params.iterations]     | `number`                                                               | `1`               | The number of iterations to perform.                                                    |
| [params.defines]        | `{ [key in DefineKey]?: Define }`                                      |                   | Key-value Object to set constant values that will be used by the L-System.              |
| [params.productions]    | `{ [successorParameter in SuccessorParameter]?: ProductionParameter }` |                   | Key-value Object to set the productions from one symbol to its axiom.                   |
| [params.seed]           | `string \| number`                                                     |                   | Seed string used for pseudo-random number generation in stochastic productions.         |
| [params.generator]      | `(...hashes: number[]) => number`                                      |                   | Generator function used for pseudo-random number generations in stochastic productions. |

### Properties

##### .`alphabet` <a id="l-system-alphabet"></a>

Array of symbols supported by the L-System.

```ts
LSystem.alphabet: readonly Alphabet;
```

##### .`ignoredSymbols` <a id="l-system-ignored-symbols"></a>

Array of symbols to ignore when performing context sensitive checks. For example, you may want to define `+-` in two-dimensional turtle-graphic L-Systems to be ignored.

```ts
LSystem.ignoredSymbols: readonly Alphabet;
```

##### .`axiom` <a id="l-system-axiom"></a>

The initial phrase of your L-System. The axiom can also bet set later via `setAxiom()`.

```ts
LSystem.axiom: Axiom;
```

##### .`iterations` <a id="l-system-iterations"></a>

The number of iterations the L-System will perform when calling `iterate()`. It is also possible to set the iterations by passing it as an argument to the method: `iterate([iterations])`.

```ts
LSystem.iterations: number;
```

##### .`defines` <a id="l-system-defines"></a>

Key-value Object to set constant values that will be used by the L-System.

```ts
LSystem.defines: Defines;
```

##### .`productions` <a id="l-system-productions"></a>

Key-value Object to set the productions from one symbol to its axiom. Applied when calling `iterate()`.

```ts
LSystem.productions: Productions;
```

##### .`commands` <a id="l-system-commands"></a>

Key-value Object to set Functions to be executed for each symbol in sequential order. Useful for visualization. Used when calling `run()`.

```ts
LSystem.commands: Commands;
```

### Methods

##### .`setAxiom(axiom)` <a id="l-system-set-axiom-method"></a>

Set the axiom of the L-System.

- `axiom`: Initial phrase of the L-System.

```ts
LSystem.setAxiom(axiom: AxiomParameter): void;
```

##### .`setDefine(key, define)` <a id="l-system-set-define-method"></a>

Set a define for the L-System.

- `key`: Key for defining constant.
- `define`: A constant value.

```ts
LSystem.setDefine(key: DefineKey, define: Define): void;
```

##### .`setDefines(defines)` <a id="l-system-set-defines-method"></a>

Set multiple defines for the L-System.

- `defines`: Collection of defined constants.

```ts
LSystem.setDefines(defines: { [key in DefineKey]?: Define }): void;
```

##### .`clearDefines()` <a id="l-system-clear-defines-method"></a>

Clear all defines from the L-System.

```ts
LSystem.clearDefines(): void;
```

##### .`setProduction(successorParameter, productionParameter)` <a id="l-system-set-production-method"></a>

Set a production for the L-System.

- `successorParameter`: Successor symbol mapped to the production.
- `productionParameter`: Production rule mapped to the symbol.

```ts
LSystem.setProduction(successorParameter: SuccessorParameter, productionParameter: ProductionParameter): void;
```

##### .`setProductions(productions)` <a id="l-system-set-productions-method"></a>

Set multiple productions for the L-System.

- `productions`: Collection of production rules mapped to symbols.

```ts
LSystem.setProductions(productions: {
  [successorParameter in SuccessorParameter]?: ProductionParameter
}): void;
```

##### .`clearProductions()` <a id="l-system-clear-productions-method"></a>

Clear all productions from the L-System.

```ts
LSystem.clearProductions(): void;
```

##### .`setCommand(symbol, command)` <a id="l-system-set-command-method"></a>

Set a command for the L-System.

- `symbol`: Symbol used as a key for the command.
- `command`: Function to be executed for each corresponding symbol.

```ts
LSystem.setCommand(symbol: Symbol, command: Command): void;
```

##### .`setCommands(commands)` <a id="l-system-set-commands-method"></a>

Set multiple commands for the L-System.

- `commands`: Collection of commands mapped to symbols.

```ts
LSystem.setCommands(commands: { [key in CommandKey]?: Command }): void;
```

##### .`clearCommands()` <a id="l-system-clear-commands-method"></a>

Clear all commands from the L-System.

```ts
LSystem.clearCommands(): void;
```

##### .`run()` <a id="l-system-run-method"></a>

Execute the commands defined in the L-System.

```ts
LSystem.run(): void;
```

##### .`iterate(iterations?)` <a id="l-system-iterate-method"></a>

Perform a specified number of iterations on the L-System.

- `[iterations]`: Number of iterations.

```ts
LSystem.iterate(iterations?: number): Axiom;
```

##### .`getAxiomString()` <a id="l-system-get-axiom-string-method"></a>

Get the current axiom of the L-System.

```ts
LSystem.getAxiomString(): string;
```

## Constants

### Symbols

`BRANCH_SYMBOLS`

`PARAMETRIC_SYMBOLS`

`DEFAULT_SYMBOLS`

`IGNORED_SYMBOLS`
