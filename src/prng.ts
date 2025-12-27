/**
 * Alea PRNG - A seeded pseudo-random number generator.
 * 
 * Based on Johannes Baagøe's Alea algorithm.
 * Original: https://github.com/nquinlan/better-random-numbers-for-javascript-mirror
 * 
 * Vendored from 'arbit' package (MIT License)
 * https://www.npmjs.com/package/arbit
 */

export interface PRNG {
    (): number;
    nextFloat(min?: number, max?: number): number;
    nextInt(min: number, max: number): number;
    getState(): [number, number, number];
}

/**
 * Creates a pseudo-random value generator from internal state.
 */
function alea(s0: number, s1: number, c: number): PRNG {
    const f = function aleaStep(): number {
        const t = 2091639 * s0 + c * 2.3283064365386963e-10;
        s0 = s1;
        return s1 = t - (c = t | 0);
    } as PRNG;

    f.getState = function aleaGetState(): [number, number, number] {
        return [s0, s1, c];
    };

    f.nextFloat = function aleaNextFloat(minOrMax?: number, max?: number): number {
        const value = f();

        if (typeof max === 'number') {
            return minOrMax! + value * (max - minOrMax!);
        } else if (typeof minOrMax === 'number') {
            return value * minOrMax;
        }
        return value;
    };

    f.nextInt = function aleaNextInt(min: number, max: number): number {
        return Math.floor(f.nextFloat(min, max));
    };

    return f;
}

/**
 * Creates a new PRNG seeded with the provided value.
 * 
 * @param seed - Numeric seed for reproducible sequences
 * @returns A PRNG function with nextFloat and nextInt methods
 */
export function createPRNG(seed?: number): PRNG {
    let s0: number, s1: number;
    let h: number, n = 0xefc8249d, v: number;
    const seedStr = 'X' + (seed ?? Date.now());

    for (let i = 0; i < 2; i++) {
        for (let j = 0; j < seedStr.length; j++) {
            n += seedStr.charCodeAt(j);
            h = 0.02519603282416938 * n;
            n = h >>> 0;
            h -= n;
            h *= n;
            n = h >>> 0;
            h -= n;
            n += h * 0x100000000;
        }
        v = (n >>> 0) * 2.3283064365386963e-10;
        if (i === 0) s0 = v; else s1 = v;
    }

    return alea(s0!, s1!, 1);
}

export default createPRNG;
