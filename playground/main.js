import { Sequence } from '@neurofuzzy/sequence-generator';

// Preset examples
const PRESETS = {
    repeat: {
        dsl: 'REPEAT 10,20,30,40,50 AS nums',
        resolve: 'nums()',
    },
    yoyo: {
        dsl: 'YOYO 1,2,3,4,5 AS bounce',
        resolve: 'bounce()',
    },
    shuffle: {
        dsl: 'SHUFFLE 1,2,3,4,5 AS shuffled',
        resolve: 'shuffled()',
    },
    random: {
        dsl: 'RANDOM 10,20,30,40,50 AS rand',
        resolve: 'rand()',
    },
    binary: {
        dsl: 'BINARY 30,-30 AS angle',
        resolve: 'angle()',
    },
    add: {
        dsl: 'REPEAT 10 ADD AS sum',
        resolve: 'sum()',
    },
    multiply: {
        dsl: 'REPEAT 2 MULTIPLY AS exp',
        resolve: 'exp()',
    },
    log2: {
        dsl: 'REPEAT 1 LOG2 AS organic',
        resolve: 'organic()',
    },
    phyllotaxis: {
        dsl: `REPEAT 137.508 AS goldenAngle
REPEAT 6 LOG10 AS offset
REPEAT 12 LOG2 AS size
SHUFFLE 0xff6b6b,0x4ecdc4,0xffe66d,0x95d5b2,0xf8a5c2 AS color`,
        resolve: 'goldenAngle()',
        isPhyllotaxis: true,
        count: 80,
    },
    compose: {
        dsl: `REPEAT 100,200,300 AS base
REPEAT 1,base,10 AS composed`,
        resolve: 'composed()',
    },
    skyline: {
        dsl: `RANDOM 20,30,30,40,50 AS width
RANDOM 40,60,80,100,120,140 AS height`,
        resolve: 'width()',
        isSkyline: true,
        skylineRows: 10,
        skylineTotal: 400,
    },
    colors: {
        dsl: 'SHUFFLE 0x336699,0x993366,0x669933,0xff6b6b,0x4ecdc4,0xffe66d AS palette',
        resolve: 'palette()',
    },
    warmColors: {
        dsl: 'RANDOM 0xff4444,0xff8844,0xffcc44,0xff6644,0xee5533 AS warm',
        resolve: 'warm()',
    },
    coolColors: {
        dsl: 'YOYO 0x2196f3,0x00bcd4,0x009688,0x4caf50,0x8bc34a AS cool',
        resolve: 'cool()',
    },
    flexrow: {
        dsl: 'RANDOM 30,60,60,90,90,120 AS widths',
        resolve: 'widths()',
        isGrid: true,
        gridRows: 8,
        gridTotal: 450,
    },
};

// DOM elements
const presetSelect = document.getElementById('preset');
const seedInput = document.getElementById('seed');
const countInput = document.getElementById('count');
const randomizeBtn = document.getElementById('randomize');
const dslInput = document.getElementById('dsl');
const resolveInput = document.getElementById('resolve');
const runBtn = document.getElementById('run');
const outputDiv = document.getElementById('output');
const timelineDiv = document.getElementById('timeline');

// Load preset
let currentPreset = null;
presetSelect.addEventListener('change', () => {
    currentPreset = PRESETS[presetSelect.value];
    if (currentPreset) {
        dslInput.value = currentPreset.dsl;
        resolveInput.value = currentPreset.resolve;
        generate();
    }
});

// Randomize seed
randomizeBtn.addEventListener('click', () => {
    seedInput.value = Math.floor(Math.random() * 100000);
    generate();
});

// Run button
runBtn.addEventListener('click', generate);

// Auto-run on input changes (debounced)
let debounceTimer;
dslInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generate, 300);
});
resolveInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(generate, 300);
});
seedInput.addEventListener('change', generate);
countInput.addEventListener('change', generate);

// Generate values
function generate() {
    const dsl = dslInput.value.trim();
    const resolveExpr = resolveInput.value.trim();
    const seed = parseInt(seedInput.value) || 0;
    const count = parseInt(countInput.value) || 20;

    if (!dsl || !resolveExpr) {
        outputDiv.innerHTML = '<span class="value" style="color: var(--text-secondary)">Enter a sequence definition...</span>';
        timelineDiv.innerHTML = '';
        return;
    }

    try {
        // Reset and set seed
        Sequence.purge();
        Sequence.seed = seed;

        // Parse DSL lines
        const lines = dsl.split('\n').filter(line => line.trim());
        lines.forEach(line => {
            Sequence.fromStatement(line.trim());
        });

        // Generate values
        const values = [];
        for (let i = 0; i < count; i++) {
            try {
                const val = Sequence.resolve(resolveExpr);
                values.push(val);
            } catch (e) {
                values.push(NaN);
            }
        }

        // Check if values look like colors (hex values > 0x10000)
        const isColorMode = values.some(v => v >= 0x10000 && v <= 0xffffff);
        const isGridMode = currentPreset?.isGrid;

        // Render values
        if (currentPreset?.isPhyllotaxis) {
            // Phyllotaxis mode: golden angle spiral
            const count = currentPreset.count || 100;
            const centerX = 200;
            const centerY = 100;
            let html = '<div class="phyllotaxis-container"><svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">';

            // Reset and regenerate for spiral
            Sequence.purge();
            Sequence.seed = seed;
            const lines = dsl.split('\n').filter(line => line.trim());
            lines.forEach(line => Sequence.fromStatement(line.trim()));

            for (let i = 0; i < count; i++) {
                // Golden angle spiral: angle = 137.508 * i, distance = sqrt(i)
                const goldenAngle = Sequence.resolve('goldenAngle()'); // Constant 137.508
                const offset = Sequence.resolve('offset()');          // LOG10 offset for variation
                const sizeVal = Sequence.resolve('size()');            // LOG2 shrinking size
                const color = Sequence.resolve('color()');

                // Classic phyllotaxis: angle = golden angle * index, r = scale * sqrt(index)
                const angleRad = (goldenAngle * i) * (Math.PI / 180);
                const baseR = Math.sqrt(i) * 8;  // Base spiral growth
                const r = baseR + offset * 2;    // Add LOG10 offset for organic variation
                const x = centerX + Math.cos(angleRad) * r;
                const y = centerY + Math.sin(angleRad) * r;
                const size = Math.max(2, sizeVal);

                const hex = color.toString(16).padStart(6, '0');
                html += `<circle cx="${x}" cy="${y}" r="${size}" fill="#${hex}" opacity="0.9"/>`;
            }

            html += '</svg></div>';
            outputDiv.innerHTML = html;
            timelineDiv.innerHTML = '';
        } else if (currentPreset?.isSkyline) {
            // Skyline mode: render layered building rows
            const skylineTotal = currentPreset.skylineTotal || 400;
            const skylineRows = currentPreset.skylineRows || 5;
            const maxHeight = 150;
            let html = '<div class="skyline-container">';

            // Build each row from bottom (last row) to top (first row)
            const rows = [];
            for (let row = 0; row < skylineRows; row++) {
                let remaining = skylineTotal;
                const buildings = [];

                while (remaining > 0) {
                    const w = Sequence.resolve('width()');
                    const h = Sequence.resolve('height()');
                    const width = Math.min(w, remaining);
                    buildings.push({ width, height: h });
                    remaining -= width;
                }
                rows.push(buildings);
            }

            // Render rows from back to front
            rows.forEach((buildings, rowIdx) => {
                const rowDepth = skylineRows - rowIdx; // Back rows have higher z-index
                const baseHeight = (rowIdx + 1) * 20; // Each row starts higher
                html += `<div class="skyline-row" style="z-index: ${rowDepth}">`;

                buildings.forEach((b, i) => {
                    const hue = 200 + (rowIdx * 15) + (i * 5); // Blue-ish buildings
                    const lightness = 20 + rowIdx * 8; // Farther rows are lighter
                    const heightPx = Math.min(b.height + baseHeight, maxHeight);
                    html += `<div class="building" style="
                        width: ${(b.width / skylineTotal) * 100}%;
                        height: ${heightPx}px;
                        background: linear-gradient(to top, hsl(${hue}, 30%, ${lightness}%), hsl(${hue}, 40%, ${lightness + 15}%));
                    " title="${b.width}x${b.height}"></div>`;
                });

                html += '</div>';
            });

            html += '</div>';
            outputDiv.innerHTML = html;
            timelineDiv.innerHTML = '';
        } else if (isGridMode && currentPreset) {
            // Grid mode: render rows that fill to a total
            const gridTotal = currentPreset.gridTotal || 450;
            const gridRows = currentPreset.gridRows || 6;
            let html = '<div class="grid-container">';

            for (let row = 0; row < gridRows; row++) {
                html += '<div class="grid-row">';
                let remaining = gridTotal;
                const rowValues = [];

                // Fill the row
                while (remaining > 0) {
                    const val = Sequence.resolve(resolveExpr);
                    const width = Math.min(val, remaining);
                    rowValues.push(width);
                    remaining -= width;
                }

                // Render cells
                rowValues.forEach((w, i) => {
                    const hue = (i * 40 + row * 30) % 360;
                    html += `<div class="grid-cell" style="width: ${(w / gridTotal) * 100}%; background: hsl(${hue}, 65%, 55%)" title="${w}"></div>`;
                });

                html += '</div>';
            }
            html += '</div>';
            outputDiv.innerHTML = html;
            timelineDiv.innerHTML = '';
        } else if (isColorMode) {
            outputDiv.innerHTML = values
                .map((v, i) => {
                    if (Number.isNaN(v)) return '<span class="value">NaN</span>';
                    const hex = v.toString(16).padStart(6, '0');
                    return `<span class="color-swatch" style="animation-delay: ${i * 20}ms; background: #${hex}" title="#${hex}"></span>`;
                })
                .join('');
            // Hide timeline for colors
            timelineDiv.innerHTML = '';
        } else {
            outputDiv.innerHTML = values
                .map((v, i) => {
                    const display = Number.isNaN(v) ? 'NaN' :
                        Number.isInteger(v) ? v : v.toFixed(2);
                    return `<span class="value" style="animation-delay: ${i * 20}ms">${display}</span>`;
                })
                .join('');

            // Render timeline
            const max = Math.max(...values.filter(v => !Number.isNaN(v)), 1);
            const min = Math.min(...values.filter(v => !Number.isNaN(v)), 0);
            const range = max - min || 1;

            timelineDiv.innerHTML = values
                .slice(0, 15)
                .map((v, i) => {
                    if (Number.isNaN(v)) return '';
                    const width = Math.max(10, ((v - min) / range) * 100);
                    const hue = (i / 15) * 60 + 180;
                    return `<div class="timeline-bar" style="width: ${width}%; background: hsl(${hue}, 70%, 50%)">${Number.isInteger(v) ? v : v.toFixed(1)}</div>`;
                })
                .join('');
        }

    } catch (error) {
        outputDiv.innerHTML = `<span class="value" style="color: #f85149">Error: ${error.message}</span>`;
        timelineDiv.innerHTML = '';
    }
}

// Load default preset
presetSelect.value = 'repeat';
presetSelect.dispatchEvent(new Event('change'));
