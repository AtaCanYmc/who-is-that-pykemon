# Contributing to Who is That Pykemon

Contributions to Who is That Pykemon are welcome. Follow these guidelines to maintain code quality, test coverage, and clear commit history.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Development Setup](#development-setup)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

All contributors must adhere to the [Code of Conduct](CODE_OF_CONDUCT.md). Treat participants with respect and keep discussions technical and constructive.

## Development Setup

### Prerequisites

- Python 3.11 or later
- Node.js 20 or later with npm
- FFmpeg installed locally
- Git

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest tests/ -v
```

### Frontend Setup

```bash
cd frontend
npm ci
npm test
npm run dev
```

## Branching Strategy

1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/<your-username>/who-is-that-pykemon.git
   cd who-is-that-pykemon
   ```
3. Create a descriptive feature or bugfix branch from `main`:
   ```bash
   git checkout -b feat/custom-theme-palette
   ```

## Commit Convention

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

| Type | Purpose | Example |
| :--- | :--- | :--- |
| `feat` | New feature or user capability | `feat: add neon theme transition effect` |
| `fix` | Bug fix | `fix: sanitize turkish characters in filename` |
| `docs` | Documentation additions or corrections | `docs: add scoped backend readme` |
| `test` | Adding or updating unit tests | `test: add job polling timeout test` |
| `refactor` | Code restructuring without behavioral change | `refactor: extract silhouette generator into helper` |
| `chore` | Dependency or tooling configuration | `chore: update vite build configuration` |

Husky and commitlint validate commit messages automatically on git commit.

## Testing Guidelines

Run verification commands before pushing commits:

```bash
# Run backend test suite with coverage
pytest backend/tests/ -v --cov=backend/app

# Run frontend typecheck and production build
npm test --prefix frontend
npm run build --prefix frontend
```

Verify that linters report no issues:

```bash
# Ruff check and formatting
./.venv/bin/ruff check backend
./.venv/bin/ruff format --check backend
```

## Pull Request Process

1. Push your branch to your GitHub fork:
   ```bash
   git push origin feat/custom-theme-palette
   ```
2. Open a Pull Request against the `main` branch.
3. Fill out the pull request template completely.
4. Verify that all GitHub Actions CI checks pass.
5. Address review feedback with atomic commits.
