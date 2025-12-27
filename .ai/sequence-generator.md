# Sequence Generator - AI Agent Guide

A deterministic sequence generator for procedural content. Define sequences with a DSL, resolve them programmatically.

## Core API

```typescript
import { Sequence } from 'sequence-generator';

// Define sequences
Sequence.fromStatement(dsl: string, seed?: number, binaryLength?: number): void

// Get values
Sequence.resolve(expression: string): number  // Evaluates and returns value

// Control
Sequence.seed = number           // Set global seed for reproducibility
Sequence.resetAll(): void        // Reset all sequences to initial state
Sequence.reset(alias: string): void  // Reset specific sequence
Sequence.purge(): void           // Clear all sequences
```

## DSL Syntax

**Pattern**: `TYPE values [ACCUMULATOR] AS alias`

### Sequence Types

- `ONCE` - Single pass through values
- `REPEAT` - Cycle through values infinitely
- `YOYO` - Bounce back and forth
- `SHUFFLE` - Random order, reshuffle when exhausted
- `RANDOM` - Pick random value each time
- `REVERSE` - Reverse order
- `BINARY` - Binary tree traversal (requires `binaryLength` param)

### Accumulators (Optional)

Apply operation to running total:
- `ADD` - Running sum
- `SUBTRACT` - Running difference
- `MULTIPLY` - Running product
- `DIVIDE` - Running quotient
- `LOG` - Natural logarithm
- `LOG2` - Base-2 logarithm
- `LOG10` - Base-10 logarithm
- `POW` - Power (squares)

### Value Formats

- **Numbers**: `1,2,3` or `1.5,2.7`
- **Ranges**: `1-5` expands to `1,2,3,4,5`
- **Hex**: `0xff0000,0x00ff00` for colors
- **Repeat shorthand**: `5[3]` = `5,5,5`
- **References**: `otherSeq` or `otherSeq()` to use another sequence's value

## Common Patterns

### Colors
```typescript
// Shuffle palette
Sequence.fromStatement('SHUFFLE 0xff6b6b,0x4ecdc4,0xffe66d AS palette');
Sequence.resolve('palette()'); // Returns random color each time

// Weighted random (repeat values for higher probability)
Sequence.fromStatement('RANDOM 0xff0000,0xff0000,0x00ff00 AS weighted');
```

### Counters & Growth
```typescript
// Linear counter
Sequence.fromStatement('REPEAT 1 ADD AS counter');
Sequence.resolve('counter()'); // 1, 2, 3, 4...

// Exponential growth
Sequence.fromStatement('REPEAT 2 MULTIPLY AS exp');
Sequence.resolve('exp()'); // 2, 4, 8, 16...

// Logarithmic (organic growth)
Sequence.fromStatement('REPEAT 10 LOG2 AS organic');
Sequence.resolve('organic()'); // 10, 3.32, 1.73, 0.79...
```

### Phyllotaxis (Golden Angle Spiral)
```typescript
Sequence.seed = 42;
Sequence.fromStatement('REPEAT 137.508 AS angle');  // Golden angle
Sequence.fromStatement('REPEAT 1 ADD AS dist');     // Distance from center

for (let i = 0; i < 100; i++) {
  const a = Sequence.resolve('angle()') * (Math.PI / 180);
  const r = Math.sqrt(i) * Sequence.resolve('dist()');
  const x = centerX + Math.cos(a * i) * r;
  const y = centerY + Math.sin(a * i) * r;
  // Draw circle at (x, y)
}
```

### Binary Trees
```typescript
Sequence.fromStatement('BINARY 30,-30 AS branch', 0, 5); // binaryLength = 5
// Generates: 30, -30, 30, 30, -30, 30, -30, -30, ...
// Perfect for L-systems and recursive branching
```

### Composition (Sequences Referencing Sequences)
```typescript
Sequence.fromStatement('REPEAT 100,200,300 AS base');
Sequence.fromStatement('RANDOM 1,base,10 AS composed');
Sequence.resolve('composed()'); // Uses current value of 'base'
```

### Expressions
```typescript
Sequence.fromStatement('REPEAT 10 AS width');
Sequence.fromStatement('REPEAT 5 AS offset');

// Arithmetic in resolve
Sequence.resolve('width() + offset()');     // 15
Sequence.resolve('width() * 2');            // 20
Sequence.resolve('width() - offset() / 2'); // 7.5
```

## Key Behaviors

### Seeding
```typescript
Sequence.seed = 123;  // All RANDOM/SHUFFLE sequences use this seed
// Same seed = same "random" output (deterministic)

// Per-sequence seed (overrides global)
Sequence.fromStatement('RANDOM 1-10 AS nums', 456);
```

### Advancing vs Current
```typescript
Sequence.fromStatement('REPEAT 1,2,3 AS nums');

Sequence.resolve('nums()');  // 1 (advances)
Sequence.resolve('nums()');  // 2 (advances)
Sequence.resolve('nums');    // 2 (current, no advance)
Sequence.resolve('nums()');  // 3 (advances)
```

### Reset
```typescript
Sequence.resetAll();           // Reset all sequences
Sequence.reset('nums');        // Reset specific sequence
Sequence.updateSeed('nums', 789); // Change seed for specific sequence
```

## Real-World Use Cases

### Generative Art
```typescript
Sequence.seed = Date.now();
Sequence.fromStatement('SHUFFLE 0x2d3561,0xc05c7e,0xf3826f AS colors');
Sequence.fromStatement('REPEAT 5,10,15,20 LOG2 AS sizes');

for (let i = 0; i < 50; i++) {
  drawCircle({
    color: Sequence.resolve('colors()'),
    radius: Sequence.resolve('sizes()'),
    x: random() * width,
    y: random() * height
  });
}
```

### Game Procedural Generation
```typescript
Sequence.seed = worldSeed;
Sequence.fromStatement('RANDOM 40,40,80,80,120 AS buildingWidth');
Sequence.fromStatement('RANDOM 80,120,160 AS buildingHeight');

for (let i = 0; i < citySize; i++) {
  buildings.push({
    width: Sequence.resolve('buildingWidth()'),
    height: Sequence.resolve('buildingHeight()'),
    x: i * spacing
  });
}
```

### Animation Easing
```typescript
Sequence.fromStatement('YOYO 0,0.25,0.5,0.75,1 AS ease');

function animate() {
  const progress = Sequence.resolve('ease()');
  element.style.opacity = progress;
  requestAnimationFrame(animate);
}
```

## Tips for Agents

1. **Always set seed** for reproducible results
2. **Use SHUFFLE for colors** - better distribution than RANDOM
3. **LOG2/LOG10 for organic growth** - creates natural-looking variation
4. **Composition is powerful** - sequences can reference other sequences
5. **Binary length matters** - for BINARY type, specify depth with 3rd param
6. **Expressions are safe** - no eval(), uses custom parser
7. **Zero dependencies** - fully self-contained, safe to bundle

## Error Handling

```typescript
try {
  Sequence.fromStatement('INVALID syntax');
} catch (error) {
  // Handle parse errors
}

try {
  Sequence.resolve('nonexistent()');
} catch (error) {
  // Handle missing sequence
}
```

## Performance Notes

- Sequences are lazy - only compute when resolved
- SHUFFLE pre-shuffles on creation (O(n))
- RANDOM is O(1) per resolve
- Expression evaluation is O(n) where n = expression complexity
- No memory leaks - use `Sequence.purge()` to clear all

## TypeScript Support

Full type definitions included:
```typescript
import { Sequence, safeEvaluate } from 'sequence-generator';

// safeEvaluate is also exported for custom use
const result = safeEvaluate('2 + 3 * 4'); // 14
```
