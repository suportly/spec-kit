# Spec-Kit

A comprehensive specification and testing toolkit for Python projects with FastAPI integration.

## Features

- 🚀 **FastAPI Integration**: Built-in support for FastAPI applications
- 🧪 **Comprehensive Testing**: Advanced testing utilities with pytest
- 📊 **Code Coverage**: Built-in coverage reporting with pytest-cov
- 🔧 **Development Tools**: Pre-configured development environment
- 📝 **CLI Interface**: Command-line tools for project management
- 🏗️ **Project Structure**: Standardized project layout and configuration

## Installation

### Production Installation

```bash
pip install spec-kit
```

### Development Installation

1. Clone the repository:
```bash
git clone https://github.com/suportly/spec-kit.git
cd spec-kit
```

2. Set up virtual environment:
```bash
make setup-env
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install development dependencies:
```bash
make install-dev
```

## Quick Start

### Initialize a New Project

```bash
spec-kit init my-project
cd my-project
```

### Run Tests

```bash
# Run all tests
make test

# Run tests with coverage
make test-cov

# Run only unit tests
make test-unit

# Run only integration tests
make test-integration
```

### Code Quality

```bash
# Format code
make format

# Run linting
make lint

# Run security checks
make security
```

## Project Structure

```
spec-kit/
├── src/
│   └── spec_kit/
│       ├── __init__.py
│       └── cli.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   └── test_example.py
├── docs/
├── requirements.txt
├── requirements-dev.txt
├── setup.py
├── pyproject.toml
├── pytest.ini
├── .coveragerc
└── Makefile
```

## Configuration

### Testing Configuration

The project uses pytest with the following configuration:

- **Test Discovery**: Automatic discovery of test files matching `test_*.py` or `*_test.py`
- **Coverage**: Minimum 80% coverage requirement
- **Markers**: Support for `unit`, `integration`, `slow`, `api`, and `database` test markers
- **Async Support**: Built-in support for async tests with `pytest-asyncio`

### Code Quality Tools

- **Black**: Code formatting with 88 character line length
- **isort**: Import sorting compatible with Black
- **flake8**: Linting and style checking
- **mypy**: Static type checking
- **bandit**: Security vulnerability scanning

## Available Commands

### Make Commands

```bash
make help           # Show available commands
make setup-env      # Setup virtual environment
make install        # Install production dependencies
make install-dev    # Install development dependencies
make test           # Run tests
make test-cov       # Run tests with coverage
make lint           # Run linting
make format         # Format code
make clean          # Clean build artifacts
make build          # Build package
make docs           # Generate documentation
```

### CLI Commands

```bash
spec-kit --help     # Show CLI help
spec-kit version    # Show version information
spec-kit init       # Initialize new project
spec-kit test       # Run tests
spec-kit info       # Show project information
```

## Testing

### Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=src/spec_kit --cov-report=html

# Run specific test markers
pytest -m "unit"           # Unit tests only
pytest -m "integration"    # Integration tests only
pytest -m "not slow"       # Exclude slow tests
```

### Test Markers

- `@pytest.mark.unit`: Unit tests
- `@pytest.mark.integration`: Integration tests
- `@pytest.mark.slow`: Slow-running tests
- `@pytest.mark.api`: API-related tests
- `@pytest.mark.database`: Database-dependent tests

### Writing Tests

```python
import pytest
from spec_kit import get_version

@pytest.mark.unit
def test_get_version():
    """Test version retrieval."""
    version = get_version()
    assert isinstance(version, str)
    assert len(version) > 0

@pytest.mark.asyncio
async def test_async_function():
    """Test async functionality."""
    result = await some_async_function()
    assert result is not None
```

## Development Workflow

1. **Setup Environment**:
   ```bash
   make setup-env
   source venv/bin/activate
   make install-dev
   ```

2. **Make Changes**: Edit code in `src/spec_kit/`

3. **Run Tests**:
   ```bash
   make test-cov
   ```

4. **Check Code Quality**:
   ```bash
   make format
   make lint
   ```

5. **Commit Changes**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Ensure tests pass: `make test`
5. Ensure code quality: `make lint`
6. Commit your changes: `git commit -m "feat: add new feature"`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please contact the Suportly team at team@suportly.com or create an issue on GitHub.

## Changelog

### v0.1.0 (Initial Release)

- Initial project structure
- Basic CLI interface
- Testing framework setup
- Development tools configuration
- Documentation and examples