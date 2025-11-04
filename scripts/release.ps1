# Release script that bumps version and creates a git tag
# Usage: .\scripts\release.ps1 [major|minor|patch|version_number]

param(
    [Parameter(Mandatory=$true)]
    [string]$Version
)

$ErrorActionPreference = "Stop"

# Check if version argument is provided
if ([string]::IsNullOrWhiteSpace($Version)) {
    Write-Host "Error: Version argument required" -ForegroundColor Red
    Write-Host "Usage: .\scripts\release.ps1 [major|minor|patch|1.2.3]"
    exit 1
}

# Ensure we're on main branch
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Write-Host "Error: Must be on main branch to create a release" -ForegroundColor Red
    Write-Host "Current branch: $currentBranch"
    exit 1
}

# Ensure working directory is clean
$status = git status --porcelain
if ($status) {
    Write-Host "Error: Working directory is not clean" -ForegroundColor Red
    Write-Host "Please commit or stash your changes first"
    git status --short
    exit 1
}

# Ensure we're up to date with remote
git fetch origin main
$local = git rev-parse "@"
$remote = git rev-parse "@{u}"
if ($local -ne $remote) {
    Write-Host "Error: Local branch is not up to date with remote" -ForegroundColor Red
    Write-Host "Please pull latest changes first"
    exit 1
}

Write-Host "Starting release process..." -ForegroundColor Green

# Bump version in package.json using pnpm version
Write-Host "Bumping version to: $Version" -ForegroundColor Yellow
pnpm version $Version --no-git-tag-version

# Get the new version from package.json
$packageJson = Get-Content package.json | ConvertFrom-Json
$newVersion = $packageJson.version
Write-Host "New version: v$newVersion" -ForegroundColor Green

# Run tests and build
Write-Host "Running tests..." -ForegroundColor Yellow
pnpm test

Write-Host "Running build..." -ForegroundColor Yellow
pnpm build

# Commit the version bump
Write-Host "Committing version bump..." -ForegroundColor Yellow
git add package.json
$env:HUSKY = "0"
git commit -m "chore: bump version to $newVersion"

# Create annotated tag
Write-Host "Creating tag v$newVersion..." -ForegroundColor Yellow
git tag -a "v$newVersion" -m "Release v$newVersion`n`nSee CHANGELOG.md for details."

# Push changes and tag
Write-Host "Pushing changes to remote..." -ForegroundColor Yellow
git push origin main
git push origin "v$newVersion"

Write-Host "✅ Release v$newVersion created successfully!" -ForegroundColor Green
Write-Host "   View release: https://github.com/quinnjr/guitar-pro-mcp/releases/tag/v$newVersion" -ForegroundColor Green

