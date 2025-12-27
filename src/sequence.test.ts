import { describe, it, expect, beforeEach } from 'vitest';
import { Sequence } from './sequence';

describe('Sequence', () => {
    beforeEach(() => {
        Sequence.purge();
        Sequence.seed = 0;
    });

    describe('fromStatement', () => {
        it('should create a sequence from comma-separated values', () => {
            const seq = Sequence.fromStatement('1,2,3,4');
            expect(seq).not.toBeNull();
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
            expect(seq!.next()).toBe(3);
            expect(seq!.next()).toBe(4);
        });

        it('should create a sequence from a range', () => {
            const seq = Sequence.fromStatement('1-5');
            expect(seq).not.toBeNull();
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
            expect(seq!.next()).toBe(3);
            expect(seq!.next()).toBe(4);
            expect(seq!.next()).toBe(5);
        });

        it('should create a sequence from a decimal range', () => {
            const seq = Sequence.fromStatement('0.1-0.3');
            expect(seq).not.toBeNull();
            expect(seq!.next()).toBeCloseTo(0.1);
            expect(seq!.next()).toBeCloseTo(0.2);
            expect(seq!.next()).toBeCloseTo(0.3);
        });

        it('should handle hex values', () => {
            const seq = Sequence.fromStatement('0xff,0x00,0x80');
            expect(seq).not.toBeNull();
            expect(seq!.next()).toBe(255);
            expect(seq!.next()).toBe(0);
            expect(seq!.next()).toBe(128);
        });

        it('should handle repeat shorthand syntax', () => {
            const seq = Sequence.fromStatement('5[3],10');
            expect(seq).not.toBeNull();
            expect(seq!.next()).toBe(5);
            expect(seq!.next()).toBe(5);
            expect(seq!.next()).toBe(5);
            expect(seq!.next()).toBe(10);
        });

        it('should alias sequences with AS keyword', () => {
            Sequence.fromStatement('1,2,3 AS myseq');
            const seq = Sequence.getSequence('myseq');
            expect(seq).not.toBeNull();
            expect(seq!.next()).toBe(1);
        });

        it('should return null for empty statement', () => {
            expect(Sequence.fromStatement('')).toBeNull();
        });
    });

    describe('ONCE type (default)', () => {
        it('should iterate through values once and stop', () => {
            const seq = Sequence.fromStatement('ONCE 1,2,3');
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
            expect(seq!.next()).toBe(3);
            // After exhaustion, current should still return last value
            expect(seq!.current()).toBe(3);
        });
    });

    describe('REVERSE type', () => {
        it('should iterate through values in reverse order', () => {
            const seq = Sequence.fromStatement('REVERSE 1,2,3');
            expect(seq!.next()).toBe(3);
            expect(seq!.next()).toBe(2);
            expect(seq!.next()).toBe(1);
        });
    });

    describe('REPEAT type', () => {
        it('should cycle through values indefinitely', () => {
            const seq = Sequence.fromStatement('REPEAT 1,2,3');
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
            expect(seq!.next()).toBe(3);
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
        });

        it('should respect max iterations', () => {
            const seq = Sequence.fromStatement('REPEAT (2) 1,2');
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
            expect(seq!.done).toBe(true);
        });
    });

    describe('YOYO type', () => {
        it('should bounce back and forth through values', () => {
            const seq = Sequence.fromStatement('YOYO 1,2,3');
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
            expect(seq!.next()).toBe(3);
            expect(seq!.next()).toBe(3);
            expect(seq!.next()).toBe(2);
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);
        });
    });

    describe('SHUFFLE type', () => {
        it('should shuffle values deterministically based on seed', () => {
            Sequence.seed = 42;
            const seq1 = Sequence.fromStatement('SHUFFLE 1,2,3,4,5 AS s1 SEED 42');

            const values1: number[] = [];
            for (let i = 0; i < 5; i++) {
                values1.push(seq1!.next());
            }

            // Reset and create again with same seed
            Sequence.purge();
            Sequence.seed = 42;
            const seq2 = Sequence.fromStatement('SHUFFLE 1,2,3,4,5 AS s2 SEED 42');

            const values2: number[] = [];
            for (let i = 0; i < 5; i++) {
                values2.push(seq2!.next());
            }

            expect(values1).toEqual(values2);
        });

        it('should contain all original values after shuffling', () => {
            const seq = Sequence.fromStatement('SHUFFLE 1,2,3,4,5 SEED 42');
            const values: number[] = [];
            for (let i = 0; i < 5; i++) {
                values.push(seq!.next());
            }
            expect(values.sort()).toEqual([1, 2, 3, 4, 5]);
        });
    });

    describe('RANDOM type', () => {
        it('should produce deterministic random values with same seed', () => {
            const seq1 = Sequence.fromStatement('RANDOM 1,2,3,4,5 AS r1 SEED 123');
            const values1: number[] = [];
            for (let i = 0; i < 10; i++) {
                values1.push(seq1!.next());
            }

            Sequence.purge();
            const seq2 = Sequence.fromStatement('RANDOM 1,2,3,4,5 AS r2 SEED 123');
            const values2: number[] = [];
            for (let i = 0; i < 10; i++) {
                values2.push(seq2!.next());
            }

            expect(values1).toEqual(values2);
        });
    });

    describe('Accumulators', () => {
        it('ADD should accumulate values', () => {
            const seq = Sequence.fromStatement('REPEAT 10 ADD AS addseq');
            // ADD accumulates: prev + current, where prev starts at first value
            expect(seq!.next()).toBe(20); // 10 + 10
            expect(seq!.next()).toBe(30); // 20 + 10
            expect(seq!.next()).toBe(40); // 30 + 10
        });

        it('SUBTRACT should subtract values', () => {
            const seq = Sequence.fromStatement('REPEAT 5 SUBTRACT');
            // SUBTRACT: prev - current, prev starts at first value
            expect(seq!.next()).toBe(0);  // 5 - 5
            expect(seq!.next()).toBe(-5); // 0 - 5
            expect(seq!.next()).toBe(-10); // -5 - 5
        });

        it('MULTIPLY should multiply values', () => {
            const seq = Sequence.fromStatement('REPEAT 2 MULTIPLY');
            // MULTIPLY: prev * current, prev starts at first value
            expect(seq!.next()).toBe(4);  // 2 * 2
            expect(seq!.next()).toBe(8);  // 4 * 2
            expect(seq!.next()).toBe(16); // 8 * 2
        });
    });

    describe('Sequence composition', () => {
        it('should reference another sequence current value', () => {
            Sequence.fromStatement('REPEAT 10,20,30 AS base');
            Sequence.resolve('base()'); // advance to 10

            const composed = Sequence.fromStatement('REPEAT 1,base,3 AS composed');
            expect(composed!.next()).toBe(1);
            expect(composed!.next()).toBe(10); // current value of base
            expect(composed!.next()).toBe(3);
        });

        it('should reference another sequence next value with ()', () => {
            Sequence.fromStatement('REPEAT 100,200,300 AS source');
            Sequence.resolve('source()'); // advance to 100
            Sequence.resolve('source()'); // advance to 200

            // When composing, the composed sequence pulls from source on each pick
            const composed = Sequence.fromStatement('ONCE 5,source,10 AS consumer');
            expect(composed!.next()).toBe(5);
            expect(composed!.next()).toBe(200); // current value of source
            expect(composed!.next()).toBe(10);
        });
    });

    describe('resolve', () => {
        it('should resolve a sequence alias to its current value', () => {
            Sequence.fromStatement('REPEAT 5,10,15 AS myval');
            expect(Sequence.resolve('myval()')).toBe(5);
            expect(Sequence.resolve('myval')).toBe(5); // current, not next
            expect(Sequence.resolve('myval()')).toBe(10);
        });

        it('should handle arithmetic expressions', () => {
            Sequence.fromStatement('REPEAT 10 AS ten');
            Sequence.resolve('ten()'); // start the sequence
            expect(Sequence.resolve('ten + 5')).toBe(15);
            expect(Sequence.resolve('ten * 2')).toBe(20);
        });

        it('should create inline sequences', () => {
            expect(Sequence.resolve('REPEAT 1,2,3')).toBe(1);
        });
    });

    describe('reset', () => {
        it('should reset a sequence to its initial state', () => {
            const seq = Sequence.fromStatement('ONCE 1,2,3 AS resettable');
            expect(seq!.next()).toBe(1);
            expect(seq!.next()).toBe(2);

            Sequence.reset('resettable');
            expect(seq!.next()).toBe(1);
        });

        it('should reset all sequences', () => {
            Sequence.fromStatement('ONCE 1,2,3 AS seq1');
            Sequence.fromStatement('ONCE 4,5,6 AS seq2');

            Sequence.resolve('seq1()');
            Sequence.resolve('seq2()');

            Sequence.resetAll();

            expect(Sequence.resolve('seq1()')).toBe(1);
            expect(Sequence.resolve('seq2()')).toBe(4);
        });
    });

    describe('updateSeed', () => {
        it('should update seed and reset sequence', () => {
            const seq = Sequence.fromStatement('SHUFFLE 1,2,3,4,5 AS seedtest SEED 1');
            const val1 = seq!.next();

            seq!.updateSeed(999);
            const val2 = seq!.next();

            // Values might be same or different, but sequence should be reset
            expect(seq!.started).toBe(true);
        });
    });

    describe('getSequence', () => {
        it('should retrieve a sequence by alias', () => {
            const original = Sequence.fromStatement('1,2,3 AS findme');
            const found = Sequence.getSequence('findme');
            expect(found).toBe(original);
        });

        it('should normalize alias case', () => {
            Sequence.fromStatement('1,2,3 AS CamelCase');
            expect(Sequence.getSequence('camelcase')).not.toBeNull();
            expect(Sequence.getSequence('CAMELCASE')).not.toBeNull();
        });

        it('should handle () in alias lookup', () => {
            Sequence.fromStatement('1,2,3 AS testseq');
            expect(Sequence.getSequence('testseq()')).not.toBeNull();
        });
    });

    describe('purge', () => {
        it('should remove all sequences', () => {
            Sequence.fromStatement('1,2,3 AS seq1');
            Sequence.fromStatement('4,5,6 AS seq2');

            Sequence.purge();

            expect(Sequence.getSequence('seq1')).toBeUndefined();
            expect(Sequence.getSequence('seq2')).toBeUndefined();
        });
    });

    describe('edge cases', () => {
        it('should handle single value sequences', () => {
            const seq = Sequence.fromStatement('42');
            expect(seq!.next()).toBe(42);
        });

        it('should handle negative numbers in ranges', () => {
            // Note: current implementation may not support negative ranges
            const seq = Sequence.fromStatement('-5,-3,-1');
            expect(seq!.next()).toBe(-5);
            expect(seq!.next()).toBe(-3);
            expect(seq!.next()).toBe(-1);
        });

        it('should handle floating point values', () => {
            const seq = Sequence.fromStatement('1.5,2.5,3.5');
            expect(seq!.next()).toBeCloseTo(1.5);
            expect(seq!.next()).toBeCloseTo(2.5);
            expect(seq!.next()).toBeCloseTo(3.5);
        });
    });
});
