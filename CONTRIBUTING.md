# Contributing to Who is That Pykemon ⚡️

Thank you for your interest in contributing to **Who is That Pykemon**! We welcome bug fixes, performance improvements, new features, and documentation enhancements.

---

## 🛠️ Development Workflow

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/<your-username>/who-is-that-pykemon.git
   cd who-is-that-pykemon
   ```
3. **Create a topic branch**:
   ```bash
   git checkout -b feature/awesome-new-effect
   ```
4. **Set up local development environments**:
   - Backend:
     ```bash
     cd backend
     python -m venv .venv
     source .venv/bin/activate
     pip install -r requirements.txt
     ```
   - Frontend:
     ```bash
     cd frontend
     npm install
     ```

---

## 🧪 Testing Guidelines

Before opening a pull request, ensure all tests pass:

### Backend Testing
```bash
cd backend
pytest tests/ -v
```

### Frontend Testing & Build
```bash
cd frontend
npm test
npm run build
```

---

## 🎨 Code Style & Standards

- **Python**: Follow PEP 8 guidelines. Write clear English docstrings (PEP 257) for all new functions and classes.
- **TypeScript / React**: Use strict TypeScript typing (`noImplicitAny`). Write modular components and clean Tailwind CSS classes.
- **Git Commits**: Write clear, descriptive commit messages following the Conventional Commits specification (e.g., `feat: add lightning reveal effect`, `fix: handle transparent webp input`).

---

## 🚀 Submitting a Pull Request

1. Push your branch to GitHub:
   ```bash
   git push origin feature/awesome-new-effect
   ```
2. Open a Pull Request against the `main` branch.
3. Fill out the provided Pull Request template describing the changes, motivation, and verification steps.
4. Ensure all GitHub Actions CI checks pass.

Thank you for making Who is That Pykemon better!
