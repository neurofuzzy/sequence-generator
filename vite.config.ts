import { defineConfig } from 'vite';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import dts from 'vite-plugin-dts';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        dts({
            include: ['src/**/*'],
            exclude: ['**/*.test.ts'],
            rollupTypes: true,
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'SequenceGenerator',
            formats: ['es', 'cjs'],
            fileName: (format: string) => `sequence-generator.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['arbit'],
            output: {
                globals: {
                    arbit: 'arbit',
                },
            },
        },
        sourcemap: true,
        minify: false,
    },
});
