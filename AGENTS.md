# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a lightweight tools workspace with no committed source tree yet. As tools are added, keep each independent utility in its own top-level directory, for example `cli-name/`, `scripts/`, or `packages/tool-name/`. Place tests next to the code when the project is small (`tool/test_*` or `tool/*.test.*`), or under a top-level `tests/` directory for shared integration coverage. Keep generated files, build outputs, and local caches out of version control.

## Build, Test, and Development Commands

No project-level build system is present yet. Add commands in the relevant tool directory and document them in that tool's `README.md`.

Common examples to use once applicable:

```sh
make test        # run the repository test suite
npm test         # run JavaScript/TypeScript tests
python -m pytest # run Python tests
```

Prefer one obvious command for each workflow: install, format, lint, test, and run locally.

## Coding Style & Naming Conventions

Follow the conventions of the language used by each tool. Use descriptive lowercase directory names with hyphens for standalone tools, such as `log-cleaner/`. Use snake_case for Python files and camelCase or kebab-case consistently for JavaScript/TypeScript packages according to the package ecosystem. Keep scripts small, composable, and documented with clear CLI flags.

## Testing Guidelines

Add tests with every non-trivial behavior change. Name tests after the behavior being verified, not the implementation detail. For Python, prefer `pytest` files named `test_*.py`; for JavaScript/TypeScript, prefer `*.test.ts` or `*.spec.ts`. Include at least one smoke test for command-line tools that verifies help output or a minimal successful run.

## Commit & Pull Request Guidelines

This directory is not currently a git repository, so no local commit convention can be inferred. When version control is initialized, use concise imperative commit messages, for example `Add log cleaner smoke test`. Pull requests should include a short summary, testing evidence, linked issues when relevant, and screenshots or terminal output for user-facing CLI changes.

## Security & Configuration Tips

Never commit secrets, tokens, personal credentials, or machine-specific absolute paths. Use `.env.example` for documented configuration and keep real `.env` files ignored. Prefer safe defaults, explicit dry-run modes for destructive tools, and clear error messages when required configuration is missing.
