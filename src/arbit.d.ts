declare module 'arbit' {
    interface ArbitPRNG {
        (): number;
        nextInt(min: number, max: number): number;
    }

    function arbit(seed?: number): ArbitPRNG;
    export = arbit;
}