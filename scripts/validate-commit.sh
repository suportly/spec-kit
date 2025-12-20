#!/bin/bash

# Commit message validation script
# Validates commit messages follow conventional commit format

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get commit message
COMMIT_MSG_FILE=$1
COMMIT_MSG=$(cat "$COMMIT_MSG_FILE")

# Conventional commit pattern
# Format: type(scope): description
# Examples:
#   feat(auth): add login functionality
#   fix(api): resolve user creation bug
#   docs: update README
CONVENTIONAL_COMMIT_REGEX='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?: .{1,50}'

# Check if commit message matches conventional commit format
if [[ $COMMIT_MSG =~ $CONVENTIONAL_COMMIT_REGEX ]]; then
    echo -e "${GREEN}✅ Commit message follows conventional commit format${NC}"
    exit 0
fi

# Check for merge commits (allow them to pass)
if [[ $COMMIT_MSG =~ ^Merge ]]; then
    echo -e "${YELLOW}⚠️  Merge commit detected - skipping validation${NC}"
    exit 0
fi

# Check for revert commits (allow them to pass)
if [[ $COMMIT_MSG =~ ^Revert ]]; then
    echo -e "${YELLOW}⚠️  Revert commit detected - skipping validation${NC}"
    exit 0
fi

# If we get here, the commit message is invalid
echo -e "${RED}❌ Invalid commit message format!${NC}"
echo ""
echo "Commit message should follow conventional commit format:"
echo "  type(scope): description"
echo ""
echo "Valid types:"
echo "  feat     - A new feature"
echo "  fix      - A bug fix"
echo "  docs     - Documentation only changes"
echo "  style    - Changes that do not affect the meaning of the code"
echo "  refactor - A code change that neither fixes a bug nor adds a feature"
echo "  test     - Adding missing tests or correcting existing tests"
echo "  chore    - Changes to the build process or auxiliary tools"
echo "  perf     - A code change that improves performance"
echo "  ci       - Changes to CI configuration files and scripts"
echo "  build    - Changes that affect the build system or external dependencies"
echo "  revert   - Reverts a previous commit"
echo ""
echo "Examples:"
echo "  feat(auth): add user authentication"
echo "  fix(api): resolve database connection issue"
echo "  docs: update installation instructions"
echo "  refactor(utils): simplify helper functions"
echo ""
echo "Your commit message:"
echo "  $COMMIT_MSG"
echo ""
exit 1