# Makefile for spec-kit project

.PHONY: help install install-dev test test-cov lint format clean build docs

# Default target
help:
	@echo "Available commands:"
	@echo "  install      Install production dependencies"
	@echo "  install-dev  Install development dependencies"
	@echo "  test         Run tests"
	@echo "  test-cov     Run tests with coverage"
	@echo "  lint         Run linting (flake8, mypy)"
	@echo "  format       Format code (black, isort)"
	@echo "  clean        Clean build artifacts"
	@echo "  build        Build package"
	@echo "  docs         Generate documentation"
	@echo "  setup-env    Setup virtual environment"

# Environment setup
setup-env:
	@echo "Setting up virtual environment..."
	python3 -m venv venv
	@echo "Virtual environment created. Activate with: source venv/bin/activate"

# Installation
install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements-dev.txt
	pip install -e .
	pre-commit install

# Testing
test:
	pytest

test-cov:
	pytest --cov=src/spec_kit --cov-report=term-missing --cov-report=html

test-unit:
	pytest -m "unit" -v

test-integration:
	pytest -m "integration" -v

test-watch:
	pytest-watch

# Code quality
lint:
	flake8 src tests
	mypy src

format:
	black src tests
	isort src tests

format-check:
	black --check src tests
	isort --check-only src tests

# Security
security:
	bandit -r src/

# Cleaning
clean:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info/
	rm -rf .pytest_cache/
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf .mypy_cache/
	find . -type d -name __pycache__ -delete
	find . -type f -name "*.pyc" -delete

# Building
build: clean
	python -m build

# Documentation
docs:
	cd docs && make html

docs-serve:
	cd docs/_build/html && python -m http.server 8000

# Development server (if applicable)
dev:
	uvicorn src.spec_kit.main:app --reload --host 0.0.0.0 --port 8000

# Database migrations (if using Alembic)
migrate:
	alembic upgrade head

migration:
	@read -p "Enter migration message: " message; \
	alembic revision --autogenerate -m "$$message"

# Pre-commit hooks
pre-commit:
	pre-commit run --all-files

# CI/CD helpers
ci-test:
	pytest --cov=src/spec_kit --cov-report=xml --cov-fail-under=80

ci-lint:
	flake8 src tests
	mypy src
	black --check src tests
	isort --check-only src tests