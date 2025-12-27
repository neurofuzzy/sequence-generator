# Sequence Generator

A powerful, deterministic sequence generator for procedural content generation. Define complex value sequences using a simple DSL (domain-specific language) and resolve them programmatically.

[![npm version](https://badge.fury.io/js/sequence-generator.svg)](https://www.npmjs.com/package/sequence-generator)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

## Features

- 🎲 **Deterministic randomness** - Seeded PRNG for reproducible results
- 🔄 **Multiple sequence types** - ONCE, REPEAT, YOYO, SHUFFLE, RANDOM, REVERSE, BINARY
- ➕ **Accumulators** - ADD, SUBTRACT, MULTIPLY, DIVIDE, LOG, LOG2, LOG10, POW
- 🔗 **Composable** - Sequences can reference other sequences
- 📐 **Expression support** - Arithmetic operations on sequence values
- 🎯 **Simple DSL** - Human-readable sequence definitions

## Installation

```bash
npm install sequence-generator
```

## Quick Start

```typescript
import { Sequence } from 'sequence-generator';

// Define a repeating sequence
Sequence.fromStatement('REPEAT 10,20,30 AS mySeq');

// Get values
Sequence.resolve('mySeq()'); // 10 (advances)
Sequence.resolve('mySeq()'); // 20 (advances)
Sequence.resolve('mySeq');   // 20 (current, no advance)
Sequence.resolve('mySeq()'); // 30 (advances)
Sequence.resolve('mySeq()'); // 10 (cycles back)
```

## Sequence Types

| Type | Description | Example |
|------|-------------|---------|
| `ONCE` | Iterate once, then stop (default) | `ONCE 1,2,3` |
| `REPEAT` | Cycle forever | `REPEAT 1,2,3` |
| `YOYO` | Bounce back and forth | `YOYO 1,2,3` → 1,2,3,3,2,1,1,2,3... |
| `SHUFFLE` | Random order (deterministic) | `SHUFFLE 1,2,3` |
| `RANDOM` | Shuffle, reshuffle each cycle | `RANDOM 1,2,3` |
| `REVERSE` | Iterate in reverse | `REVERSE 1,2,3` → 3,2,1 |
| `BINARY` | Binary counter pattern | `BINARY 0,1` |

## Value Syntax

```typescript
// Comma-separated values
Sequence.fromStatement('1,2,3,4,5 AS nums');

// Range (integers)
Sequence.fromStatement('1-10 AS range');

// Decimal range
Sequence.fromStatement('0.1-0.5 AS decimals');

// Hex values
Sequence.fromStatement('0xff0000,0x00ff00,0x0000ff AS colors');

// Repeat shorthand: value[count]
Sequence.fromStatement('5[3],10 AS weighted'); // [5,5,5,10]

// Weighted probability
Sequence.fromStatement('RANDOM 1,1,1,2 AS weighted'); // 1 is 3x more likely
```

## Accumulators

Accumulators apply mathematical operations across iterations:

```typescript
// Running sum: 20, 30, 40, 50...
Sequence.fromStatement('REPEAT 10 ADD AS sum');

// Exponential: 4, 8, 16, 32...
Sequence.fromStatement('REPEAT 2 MULTIPLY AS exp');

// Logarithmic growth (great for organic patterns)
Sequence.fromStatement('REPEAT 1 LOG2 AS organic');
```

| Accumulator | Operation |
|-------------|-----------|
| `REPLACE` | Use value as-is (default) |
| `ADD` | prev + current |
| `SUBTRACT` | prev - current |
| `MULTIPLY` | prev × current |
| `DIVIDE` | prev ÷ current |
| `LOG`, `LOG2`, `LOG10` | Logarithmic scaling |
| `POW` | Exponential power |

## Composition

Sequences can reference other sequences:

```typescript
// Define base sequence
Sequence.fromStatement('REPEAT 100,200,300 AS base');

// Reference in another sequence (current value)
Sequence.fromStatement('REPEAT 1,base,3 AS composed');

// Reference with advance
Sequence.fromStatement('REPEAT base(),5,10 AS advancing');
```

## Expression Resolution

```typescript
Sequence.fromStatement('REPEAT 10 AS val');
Sequence.resolve('val()'); // Start the sequence

Sequence.resolve('val + 5');  // 15
Sequence.resolve('val * 2');  // 20
Sequence.resolve('val / 2');  // 5
```

## Max Iterations

Limit how many times a sequence cycles:

```typescript
// Stop after 2 complete cycles
Sequence.fromStatement('REPEAT (2) 1,2,3 AS limited');
```

## Seeding

```typescript
// Global seed
Sequence.seed = 12345;

// Per-sequence seed (2nd parameter)
Sequence.fromStatement('SHUFFLE 1,2,3,4,5 AS shuffled', 42);

// Reset all sequences
Sequence.resetAll();
Sequence.resetAll(newSeed);
```

## API Reference

### Static Methods

| Method | Description |
|--------|-------------|
| `Sequence.fromStatement(stmt, seed?, binaryLength?)` | Create sequence from DSL |
| `Sequence.resolve(expr, depth?)` | Resolve expression to number |
| `Sequence.getSequence(alias)` | Get sequence by name |
| `Sequence.reset(alias)` | Reset specific sequence |
| `Sequence.resetAll(seed?, skip?)` | Reset all sequences |
| `Sequence.updateSeed(alias, seed)` | Update sequence seed |
| `Sequence.purge()` | Remove all sequences |

### Instance Methods

| Method | Description |
|--------|-------------|
| `seq.next()` | Get next value |
| `seq.current()` | Get current value |
| `seq.reset()` | Reset to initial state |
| `seq.updateSeed(seed)` | Update seed and reset |

### Instance Properties

| Property | Type | Description |
|----------|------|-------------|
| `seq.done` | boolean | True if max iterations reached |
| `seq.started` | boolean | True if sequence has been started |

## Real-World Examples

### Procedural City Generation

```typescript
Sequence.seed = 345890;

// Weighted building dimensions
Sequence.fromStatement('RANDOM 40,40,80,80,120 AS width');
Sequence.fromStatement('RANDOM 80,120,160 AS height');
Sequence.fromStatement('RANDOM 0,1,0,1 AS hasLight');

for (let i = 0; i < 10; i++) {
  const building = {
    w: Sequence.resolve('width()'),
    h: Sequence.resolve('height()'),
    lit: Sequence.resolve('hasLight()') === 1,
  };
}
```

### Generative Tree (Binary Branching)

```typescript
// Binary type with length parameter for tree branches
Sequence.fromStatement('BINARY 30,-70 AS angle', 0, 5);
Sequence.fromStatement('REPEAT 120,90,80,60,40 AS length');

// Each branch picks left/right based on binary counter
function branch(depth) {
  const angle = Sequence.resolve('angle()');
  const len = Sequence.resolve('length()');
  // ... draw branch logic
}
```

### Color Palette Cycling

```typescript
// Convert color palette to sequence
const palette = ['#336699', '#993366', '#669933'];
const colorSeq = `SHUFFLE ${palette.join(',').replace(/#/g, '0x')} AS color`;
Sequence.fromStatement(colorSeq, 42);

// Get colors
const color = Sequence.resolve('color()');
```

## Development

```bash
npm install
npm run build      # Build library
npm run test       # Run tests
npm run examples   # Run example demos
```

## License

ISC
