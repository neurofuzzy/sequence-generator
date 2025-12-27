/**
 * Sequence Generator Examples
 * 
 * This file demonstrates all the key features of the Sequence library
 * through practical, runnable examples.
 */

import { Sequence } from './index';

// Reset before each example section
function section(name: string) {
    console.log('\n' + '='.repeat(50));
    console.log(`📝 ${name}`);
    console.log('='.repeat(50));
    Sequence.purge();
    Sequence.seed = 0;
}

// ============================================================
// BASIC SEQUENCES
// ============================================================

section('Basic Value Sequences');

// Comma-separated values
const basic = Sequence.fromStatement('1,2,3,4,5 AS nums');
console.log('ONCE 1,2,3,4,5:');
for (let i = 0; i < 5; i++) {
    console.log(`  next() = ${basic!.next()}`);
}

// Range syntax
const range = Sequence.fromStatement('10-15 AS range');
console.log('\nRange 10-15:');
for (let i = 0; i < 6; i++) {
    console.log(`  next() = ${range!.next()}`);
}

// Decimal range
const decimals = Sequence.fromStatement('0.1-0.5 AS decimals');
console.log('\nDecimal range 0.1-0.5:');
for (let i = 0; i < 5; i++) {
    console.log(`  next() = ${decimals!.next()}`);
}

// ============================================================
// SEQUENCE TYPES
// ============================================================

section('REPEAT - Cycle Forever');

Sequence.fromStatement('REPEAT 10,20,30 AS values');
console.log('REPEAT 10,20,30 (cycling):');
for (let i = 0; i < 8; i++) {
    const seq = Sequence.getSequence('values');
    console.log(`  ${i}: ${seq!.next()}`);
}

section('YOYO - Bounce Back and Forth');

const yoyo = Sequence.fromStatement('YOYO 1,2,3 AS bounce');
console.log('YOYO 1,2,3 (bouncing):');
for (let i = 0; i < 10; i++) {
    console.log(`  ${i}: ${yoyo!.next()}`);
}

section('SHUFFLE - Deterministic Random Order');

Sequence.seed = 42;
const shuffle1 = Sequence.fromStatement('SHUFFLE 1,2,3,4,5 AS shuffled SEED 42');
console.log('SHUFFLE 1,2,3,4,5 (seed=42):');
const firstRun: number[] = [];
for (let i = 0; i < 5; i++) {
    firstRun.push(shuffle1!.next());
}
console.log(`  First run:  [${firstRun.join(', ')}]`);

// Same seed = same order
Sequence.purge();
Sequence.seed = 42;
const shuffle2 = Sequence.fromStatement('SHUFFLE 1,2,3,4,5 AS shuffled2 SEED 42');
const secondRun: number[] = [];
for (let i = 0; i < 5; i++) {
    secondRun.push(shuffle2!.next());
}
console.log(`  Second run: [${secondRun.join(', ')}]`);
console.log(`  Same order? ${JSON.stringify(firstRun) === JSON.stringify(secondRun)}`);

section('REVERSE - Backwards Order');

const reversed = Sequence.fromStatement('REVERSE 1,2,3,4,5 AS backwards');
console.log('REVERSE 1,2,3,4,5:');
for (let i = 0; i < 5; i++) {
    console.log(`  ${reversed!.next()}`);
}

section('RANDOM - Shuffled Each Cycle');

Sequence.seed = 123;
const random = Sequence.fromStatement('RANDOM 1,2,3 AS rand SEED 123');
console.log('RANDOM 1,2,3 (reshuffles each cycle):');
for (let i = 0; i < 9; i++) {
    console.log(`  ${i}: ${random!.next()}`);
}

// ============================================================
// BINARY TYPE - Binary Counter Pattern
// ============================================================

section('BINARY - Binary Counter Pattern');

// BINARY picks values based on binary representation of iteration
// With values [A, B] and length 3:
// iter 0: 000 -> [A, A, A]
// iter 1: 001 -> [A, A, B]
// iter 2: 010 -> [A, B, A]
// etc.

const binary = Sequence.fromStatement('BINARY 0,1 AS bits');
console.log('BINARY 0,1 (binary counter):');
for (let i = 0; i < 8; i++) {
    console.log(`  ${binary!.next()}`);
}

// ============================================================
// ACCUMULATORS
// ============================================================

section('Accumulators - Mathematical Operations');

console.log('ADD accumulator (running sum):');
const addSeq = Sequence.fromStatement('REPEAT 10 ADD AS adder');
for (let i = 0; i < 5; i++) {
    console.log(`  ${addSeq!.next()}`); // 20, 30, 40, 50, 60
}

console.log('\nMULTIPLY accumulator (exponential):');
const mulSeq = Sequence.fromStatement('REPEAT 2 MULTIPLY AS doubler');
for (let i = 0; i < 6; i++) {
    console.log(`  ${mulSeq!.next()}`); // 4, 8, 16, 32, 64, 128
}

// ============================================================
// REAL-WORLD PATTERNS
// ============================================================

section('Real-World: Procedural City Generation');

// From embly/tests/city04.test.js pattern
Sequence.seed = 345890;

// Weighted probability: 40 appears 2x, making it more likely
Sequence.fromStatement('RANDOM 40,40,80,80,120 AS buildingWidth');
Sequence.fromStatement('RANDOM 80,120,160 AS buildingHeight');
Sequence.fromStatement('RANDOM 0,1,0,1 AS hasLight');  // 50% chance

console.log('Generating buildings:');
for (let i = 0; i < 5; i++) {
    const w = Sequence.resolve('buildingWidth()');
    const h = Sequence.resolve('buildingHeight()');
    const lit = Sequence.resolve('hasLight()') === 1;
    console.log(`  Building ${i + 1}: ${w}x${h}, light: ${lit ? '💡' : '⬛'}`);
}

section('Real-World: Color Palette Cycling');

// Hex color values for generative art
Sequence.fromStatement('SHUFFLE 0x336699,0x993366,0x669933 AS palette');

console.log('Color palette (hex):');
for (let i = 0; i < 6; i++) {
    const color = Sequence.resolve('palette()');
    console.log(`  #${color.toString(16).padStart(6, '0')}`);
}

section('Real-World: Rotation Sequences');

// From isobox44 - synchronized rotation cycles
Sequence.fromStatement('REPEAT 270,0,90 AS rotA');
Sequence.fromStatement('REPEAT 0,90,270 AS rotB');
Sequence.fromStatement('REPEAT 270,90,0 AS rotC');

console.log('Synchronized rotations:');
for (let i = 0; i < 4; i++) {
    const a = Sequence.resolve('rotA()');
    const b = Sequence.resolve('rotB()');
    const c = Sequence.resolve('rotC()');
    console.log(`  Frame ${i}: A=${a}° B=${b}° C=${c}°`);
}

// ============================================================
// SEQUENCE COMPOSITION
// ============================================================

section('Sequence Composition');

Sequence.fromStatement('REPEAT 10,20,30 AS base');
Sequence.resolve('base()'); // Initialize to 10

// Compose: include base sequence in another
Sequence.fromStatement('REPEAT 1,base,100 AS composed');

console.log('REPEAT 1,base,100 (base = REPEAT 10,20,30):');
for (let i = 0; i < 6; i++) {
    console.log(`  ${Sequence.resolve('composed()')}`);
}

// ============================================================
// EXPRESSION RESOLUTION
// ============================================================

section('Expression Resolution');

Sequence.fromStatement('REPEAT 10 AS val');
Sequence.resolve('val()'); // Start at 10

console.log('Arithmetic with sequences:');
console.log(`  val = ${Sequence.resolve('val')}`);
console.log(`  val + 5 = ${Sequence.resolve('val + 5')}`);
console.log(`  val * 2 = ${Sequence.resolve('val * 2')}`);
console.log(`  val / 2 = ${Sequence.resolve('val / 2')}`);

// ============================================================
// MAX ITERATIONS
// ============================================================

section('Max Iterations');

const limited = Sequence.fromStatement('REPEAT (2) 1,2,3 AS limited');
console.log('REPEAT (2) 1,2,3 (stops after 2 cycles):');
for (let i = 0; i < 8; i++) {
    if (limited!.done) {
        console.log(`  [done after ${i} iterations]`);
        break;
    }
    console.log(`  ${limited!.next()}`);
}

// ============================================================
// SPECIAL VALUE SYNTAX
// ============================================================

section('Special Value Syntax');

// Repeat shorthand: value[count]
const repeated = Sequence.fromStatement('5[3],10,20[2] AS special');
console.log('5[3],10,20[2] expands to [5,5,5,10,20,20]:');
for (let i = 0; i < 6; i++) {
    console.log(`  ${repeated!.next()}`);
}

// ============================================================
// ADVANCED: BINARY TYPE FOR TREE STRUCTURES
// ============================================================

section('Advanced: BINARY for Branching Patterns');

// BINARY with binaryLength (3rd parameter) creates tree-like patterns
// Used in stamp/examples/07_binarytree.ts for generative trees
// binaryLength=3 means: picks based on 3-bit binary counter (000, 001, 010, 011...)

Sequence.fromStatement('BINARY 30,-70 AS angle', 0, 3);
console.log('BINARY 30,-70 with length=3 (for tree branching):');
console.log('  Iteration pattern: (values picked from [30,-70] based on binary bits)');
for (let i = 0; i < 12; i++) {
    const angle = Sequence.resolve('angle()');
    console.log(`  ${i}: ${angle}°`);
}

// ============================================================
// ADVANCED: LOG2 ACCUMULATOR FOR ORGANIC GROWTH
// ============================================================

section('Advanced: LOG2 Accumulator');

// LOG2 creates organic, logarithmic growth patterns
// From stamp/examples/47-hatches-print.ts

const logScale = Sequence.fromStatement('REPEAT 1 LOG2 AS scale', 0);
console.log('REPEAT 1 LOG2 (logarithmic scaling):');
for (let i = 0; i < 8; i++) {
    console.log(`  ${i}: ${logScale!.next().toFixed(3)}`);
}

// ============================================================
// ADVANCED: EXPRESSION COMPOSITION
// ============================================================

section('Advanced: Expression Composition');

// One sequence can reference another in its expression!
// From stamp/examples/04_hatch.ts

Sequence.fromStatement('RANDOM 30,60,90,120 AS baseWidth');
Sequence.resolve('baseWidth()'); // Initialize to get a value

// Create a sequence that uses baseWidth in its expression
Sequence.fromStatement('RANDOM 5,baseWidth-25 AS offset');

console.log('Composing: RANDOM 5,baseWidth-25 AS offset');
console.log('  (offset uses baseWidth value minus 25)');
for (let i = 0; i < 5; i++) {
    const w = Sequence.resolve('baseWidth()');
    const o = Sequence.resolve('offset()');
    console.log(`  baseWidth=${w}, offset=${o}`);
}

// ============================================================
// ADVANCED: STRING-BASED INTEGRATION
// ============================================================

section('Advanced: String-Based Integration (Deferred Resolution)');

// In stamp, sequences are referenced as strings in style objects
// and resolved at render time. This enables dynamic property binding.

console.log('Example from stamp (conceptual):');
console.log(`
  const style = {
    fillColor: "COLOR()",      // Resolved when shape is drawn
    hatchPattern: "HATCH()",
    radius: "RSCALE()",
  };

  // The Stamp library calls Sequence.resolve() internally
  // This allows each shape to get unique values from sequences
`);

// Demo the concept
Sequence.fromStatement('REPEAT 10,20,30,40 AS sizes');
const styleDemo = {
    radius: "sizes()",
    computed: () => Sequence.resolve("sizes()"),
};

console.log('Simulated style with "sizes()" property:');
for (let i = 0; i < 4; i++) {
    console.log(`  Shape ${i + 1}: radius = ${Sequence.resolve(styleDemo.radius)}`);
}

console.log('\n✨ Examples complete!');
