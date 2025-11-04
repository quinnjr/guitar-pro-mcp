#!/bin/bash
# Release script that bumps version and creates a git tag
# Usage: ./scripts/release.sh [major|minor|patch|version_number]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if version argument is provided
if [ -z "$1" ]; then
  echo -e "${RED}Error: Version argument required${NC}"
  echo "Usage: ./scripts/release.sh [major|minor|patch|1.2.3]"
  exit 1
fi

VERSION_ARG="$1"

# Ensure we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
  echo -e "${RED}Error: Must be on main branch to create a release${NC}"
  echo "Current branch: $CURRENT_BRANCH"
  exit 1
fi

# Ensure working directory is clean
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${RED}Error: Working directory is not clean${NC}"
  echo "Please commit or stash your changes first"
  git status --short
  exit 1
fi

# Ensure we're up to date with remote
git fetch origin main
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
if [ "$LOCAL" != "$REMOTE" ]; then
  echo -e "${RED}Error: Local branch is not up to date with remote${NC}"
  echo "Please pull latest changes first"
  exit 1
fi

echo -e "${GREEN}Starting release process...${NC}"

# Bump version in package.json using npm version
# This will also create a git tag automatically
echo -e "${YELLOW}Bumping version to: $VERSION_ARG${NC}"

# Disable git tag creation (we'll do it manually with better message)
pnpm version "$VERSION_ARG" --no-git-tag-version

# Get the new version from package.json
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}New version: v$NEW_VERSION${NC}"

# Run tests and build
echo -e "${YELLOW}Running tests...${NC}"
pnpm test

echo -e "${YELLOW}Running build...${NC}"
pnpm build

# Commit the version bump
echo -e "${YELLOW}Committing version bump...${NC}"
git add package.json
HUSKY=0 git commit -m "chore: bump version to $NEW_VERSION"

# Create annotated tag
echo -e "${YELLOW}Creating tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION

See CHANGELOG.md for details."

# Push changes and tag
echo -e "${YELLOW}Pushing changes to remote...${NC}"
git push origin main
git push origin "v$NEW_VERSION"

echo -e "${GREEN}✅ Release v$NEW_VERSION created successfully!${NC}"
echo -e "${GREEN}   View release: https://github.com/quinnjr/guitar-pro-mcp/releases/tag/v$NEW_VERSION${NC}"

