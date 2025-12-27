# Contributing to Sequence Generator

Thank you for your interest in contributing! This library aims to be a simple, deterministic sequence generator for procedural content generation.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/neurofuzzy/sequence-generator.git
cd sequence-generator

# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test

# Build the library
npm run build

# Run the playground
npm run playground
```

## Project Structure

```
sequence-generator/
├── src/
│   ├── sequence.ts       # Core Sequence class
│   ├── evaluate.ts       # Safe expression evaluator
│   ├── prng.ts          # Vendored Alea PRNG
│   ├── index.ts         # Public API exports
│   ├── sequence.test.ts # Test suite
│   └── examples.ts      # Usage examples
├── playground/          # Interactive demo
│   ├── index.html
│   ├── style.css
│   └── main.js
└── .ai/                 # AI agent documentation
```

## Guidelines

### Code Style

- **TypeScript**: Use strict typing
- **Formatting**: Run `npm run typecheck` before committing
- **Comments**: Document complex logic, especially in DSL parsing

### Testing

- All new features must include tests
- Run `npm test` to ensure all tests pass
- Aim for high coverage on core functionality
- Tests are in `src/sequence.test.ts`

### Commit Messages

Use conventional commits:
- `feat: add new sequence type`
- `fix: correct YOYO boundary behavior`
- `docs: update README examples`
- `test: add LOG2 accumulator tests`

## Adding Features

### New Sequence Type

1. Add type to `SequenceType` enum in `sequence.ts`
2. Implement picker function (e.g., `pickYoyo`)
3. Add parsing logic in `fromStatement`
4. Write tests in `sequence.test.ts`
5. Add example to `examples.ts`
6. Update README

### New Accumulator

1. Add to `AccumulationType` enum
2. Implement in `applyAccumulator` function
3. Add tests
4. Update documentation

### Playground Preset

1. Add preset object to `PRESETS` in `playground/main.js`
2. Add option to dropdown in `playground/index.html`
3. Add any special rendering logic if needed
4. Test in browser

## Pull Request Process

1. **Fork** the repository
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Make changes** and commit with conventional commits
4. **Run tests**: `npm test`
5. **Build**: `npm run build`
6. **Push**: `git push origin feature/your-feature`
7. **Open PR** with clear description of changes

### PR Checklist

- [ ] Tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Documentation updated (README, examples, `.ai/` guide if needed)
- [ ] Playground updated if adding visual features
- [ ] Conventional commit messages

## Questions?

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
