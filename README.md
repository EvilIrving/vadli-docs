# Valdi Documentation (Unofficial Mirror)

> This is an **unofficial** documentation site for Valdi, a cross-platform application development framework.
> It is maintained for convenient offline/online reference and is **periodically synced from the official documentation**.

## Structure

```text
src/
├── content/          # Markdown documentation files
│   ├── docs/         # Core documentation
│   ├── api/          # API reference
│   └── codelabs/     # Step-by-step tutorials
├── src/
│   ├── components/   # Vue components
│   ├── composables/  # Vue composables
│   ├── utils/        # Pure TypeScript logic
│   └── views/        # Page views
```

## Tech Stack

- Vue 3.5 + Vue Router 4
- TypeScript 5
- Vite 7

## Why Plain Text?

The documentation content is displayed as plain text instead of rendered Markdown.

**Reason:** The official GitHub documentation requires switching directories to view Markdown files, which loads slowly and provides poor user experience. Parsing Markdown itself is straightforward, but implementing all the edge cases and special syntax features requires significant effort. Prioritizing a fast-loading web version of the documentation was more important.

If you'd like to add proper Markdown rendering support, feel free to fork the project on GitHub!

## Code Style

See [unix_code.md](unix_code.md) for the Unix philosophy style guide applied to this project.

## Commands

```bash
pnpm dev      # Development server
pnpm build    # Build for production
pnpm type-check  # TypeScript validation
```

## License

MIT
