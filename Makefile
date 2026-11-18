.DEFAULT_GOAL := help

# Environment configuration
VENV ?= .venv
PYTHON ?= $(VENV)/bin/python
PIP ?= $(VENV)/bin/pip
UVICORN ?= $(VENV)/bin/uvicorn
PYTEST ?= $(VENV)/bin/pytest
RUFF ?= $(VENV)/bin/ruff

.PHONY: help
help: ## Show available make commands
	@echo "Who is That Pykemon - Developer Commands"
	@echo "========================================="
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ==============================================================================
# Setup & Installation
# ==============================================================================

.PHONY: setup
setup: setup-venv install-backend install-frontend ## Create venv and install all dependencies

.PHONY: setup-venv
setup-venv: ## Initialize Python virtual environment
	@if [ ! -d "$(VENV)" ]; then \
		echo "Creating Python virtual environment in $(VENV)..."; \
		python3 -m venv $(VENV); \
	fi

.PHONY: install
install: install-backend install-frontend ## Install both backend and frontend dependencies

.PHONY: install-backend
install-backend: setup-venv ## Install backend Python dependencies
	@echo "Installing backend dependencies..."
	@$(PIP) install --upgrade pip
	@$(PIP) install -r backend/requirements.txt

.PHONY: install-frontend
install-frontend: ## Install frontend npm dependencies
	@echo "Installing frontend dependencies..."
	@npm ci --prefix frontend

# ==============================================================================
# Development
# ==============================================================================

.PHONY: dev-backend
dev-backend: ## Run FastAPI backend with hot reloading on port 8000
	@echo "Starting FastAPI backend server on http://localhost:8000..."
	@cd backend && ../$(UVICORN) app.main:app --reload --port 8000

.PHONY: dev-frontend
dev-frontend: ## Run Vite frontend dev server on http://localhost:5173
	@echo "Starting Vite frontend dev server on http://localhost:5173..."
	@npm run dev --prefix frontend

.PHONY: dev-docs
dev-docs: ## Serve GitHub Pages documentation site locally on port 4000
	@echo "Serving GitHub Pages documentation site on http://localhost:4000..."
	@python3 -m http.server 4000 --directory docs

# ==============================================================================
# Testing & Validation
# ==============================================================================

.PHONY: test
test: test-backend test-frontend ## Run both backend pytest suite and frontend typecheck

.PHONY: test-backend
test-backend: ## Run backend unit and integration test suite with coverage
	@echo "Running backend test suite..."
	@$(PYTEST) backend/tests/ -v --cov=backend/app --cov-report=term-missing

.PHONY: test-frontend
test-frontend: ## Run frontend TypeScript typecheck
	@echo "Running frontend typecheck..."
	@npm test --prefix frontend

.PHONY: build-frontend
build-frontend: ## Build frontend production PWA bundle
	@echo "Building frontend PWA bundle..."
	@npm run build --prefix frontend

# ==============================================================================
# Desktop App (Tauri)
# ==============================================================================

.PHONY: desktop-dev
desktop-dev: ## Run desktop app in development mode with hot reloading
	@echo "Starting Tauri desktop application in development mode..."
	@npm run desktop:dev

.PHONY: desktop-build
desktop-build: ## Build release desktop application bundle
	@echo "Building production desktop application bundle..."
	@npm run desktop:build

# ==============================================================================
# Code Quality & Governance
# ==============================================================================

.PHONY: lint
lint: lint-backend lint-docs ## Run all linters (Ruff, grounding, and anti-slop)

.PHONY: lint-backend
lint-backend: ## Check backend code formatting and imports with Ruff
	@echo "Running Ruff checks..."
	@$(RUFF) check backend

.PHONY: lint-docs
lint-docs: ## Verify internal documentation links and anti-slop rules
	@echo "Validating documentation grounding and anti-slop rules..."
	@python3 scripts/verify-grounding.py
	@python3 scripts/verify-anti-slop.py

.PHONY: format
format: ## Automatically format and fix backend code with Ruff
	@echo "Formatting backend code with Ruff..."
	@$(RUFF) check --fix backend
	@$(RUFF) format backend

# ==============================================================================
# Docker Orchestration
# ==============================================================================

.PHONY: docker-up
docker-up: ## Build and launch complete container stack in background
	@echo "Starting application containers via Docker Compose..."
	@docker compose up --build -d

.PHONY: docker-down
docker-down: ## Stop and remove application containers
	@echo "Stopping application containers..."
	@docker compose down

.PHONY: docker-logs
docker-logs: ## Follow live logs from running containers
	@docker compose logs -f

# ==============================================================================
# Cleanup
# ==============================================================================

.PHONY: clean
clean: ## Remove temporary cache directories and build artifacts
	@echo "Cleaning cache and build artifacts..."
	@rm -rf .pytest_cache .ruff_cache backend/.pytest_cache frontend/dist frontend/node_modules/.vite src-tauri/target /tmp/who_is_that_pykemon/*
	@find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@find . -type f -name "*.pyc" -delete 2>/dev/null || true
	@echo "Clean completed."
