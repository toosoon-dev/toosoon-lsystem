# TOOSOON L-SYSTEM

TOOSOON L-System library.

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
  productions: { F: 'F-F++F-F' }
});

console.log(system.iterate(2));
// 'F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F++F-F++F-F-F-F++F-F'
```

## License

MIT License, see [LICENSE](https://github.com/toosoon-dev/toosoon-lsystem/tree/master/LICENSE) for details
