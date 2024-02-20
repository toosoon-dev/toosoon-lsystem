# TOOSOON L-SYSTEM

TOOSOON L-System library.

This library provides functionalities for creating and manipulating L-Systems (Lindenmayer systems) using various parameters.

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

## API

See full documentation [here](./docs/API.md).

## License

MIT License, see [LICENSE](https://github.com/toosoon-dev/toosoon-lsystem/tree/master/LICENSE) for details
