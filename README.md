# Spec-Kit

A Next.js frontend with FastAPI backend project for specification management.

## Development Setup

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn
- Git

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd spec-kit
```

2. Setup pre-commit hooks:
```bash
chmod +x scripts/setup-hooks.sh
./scripts/setup-hooks.sh
```

3. Install dependencies:

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

### Pre-commit Hooks

This project uses pre-commit hooks to ensure code quality. The hooks will automatically run on each commit and include:

#### Python (Backend)
- **Black**: Code formatting
- **isort**: Import sorting
- **flake8**: Linting and style checking
- **mypy**: Type checking
- **pytest**: Running tests

#### JavaScript/TypeScript (Frontend)
- **Prettier**: Code formatting
- **ESLint**: Linting and style checking
- **TypeScript**: Type checking
- **Jest**: Running tests

#### General
- **Trailing whitespace**: Removes trailing whitespace
- **End of file fixer**: Ensures files end with newline
- **YAML/JSON validation**: Validates syntax
- **Merge conflict detection**: Prevents committing merge conflicts
- **Large file detection**: Prevents committing large files
- **Commit message validation**: Ensures conventional commit format

### Commit Message Format

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools
- `perf`: A code change that improves performance
- `ci`: Changes to CI configuration files and scripts
- `build`: Changes that affect the build system or external dependencies
- `revert`: Reverts a previous commit

**Examples:**
```bash
feat(auth): add user authentication
fix(api): resolve database connection issue
docs: update installation instructions
refactor(utils): simplify helper functions
```

### Manual Hook Execution

Run all hooks manually:
```bash
pre-commit run --all-files
```

Run specific hook:
```bash
pre-commit run black --all-files
pre-commit run eslint --all-files
```

Update hooks to latest versions:
```bash
pre-commit autoupdate
```

### Skipping Hooks (Not Recommended)

In rare cases, you can skip hooks:
```bash
git commit --no-verify
```

**Note:** Only skip hooks when absolutely necessary and ensure code quality through other means.

### Project Structure

```
spec-kit/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
├── scripts/           # Development and deployment scripts
├── .pre-commit-config.yaml  # Pre-commit configuration
├── pyproject.toml     # Python project configuration
└── README.md          # This file
```

### Development Workflow

1. Create a new branch for your feature/fix
2. Make your changes
3. Run tests locally: `npm test` (frontend) or `pytest` (backend)
4. Commit your changes (hooks will run automatically)
5. Push your branch and create a pull request

### Troubleshooting

**Pre-commit hooks failing:**
1. Check the error messages in the terminal
2. Fix the issues (formatting, linting, tests)
3. Stage the fixed files and commit again

**Hook installation issues:**
1. Ensure you have Python 3.8+ and Node.js 16+ installed
2. Run the setup script again: `./scripts/setup-hooks.sh`
3. Check that all dependencies are installed

**Commit message validation failing:**
1. Ensure your commit message follows the conventional commit format
2. Use the correct type and include a clear description
3. See examples above for reference

### Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the development workflow
4. Ensure all hooks pass
5. Submit a pull request

### License

[Add your license information here]