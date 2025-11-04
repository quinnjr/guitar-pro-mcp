# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2025-11-04

### Added
- Binary entry point in package.json for pnpm/npx execution
- `.gitattributes` file for consistent LF line endings across platforms
- Release scripts for automated version bumping and tagging

### Fixed
- `ERR_PNPM_DLX_NO_BIN` error when running via `pnpx`
- Prettier line ending errors in CI/CD pipelines
- pnpm version conflict in GitHub Actions workflows

### Changed
- esbuild configuration to inject shebang banner
- Removed duplicate shebang from source file

## [1.0.0] - 2025-11-04

### Added
- Initial release of Guitar Pro 6 MCP server
- Two MCP tools: `create_guitar_pro_file` and `create_simple_guitar_pro_file`
- Comprehensive test suite with 147 tests (80%+ coverage)
- Binary writer utilities for GP6 format
- Modular architecture with separated data models
- TypeScript compilation via esbuild
- ESLint and Prettier configuration
- Husky git hooks for pre-commit, pre-push, and commit-msg validation
- GitHub Actions workflows for CI, release, and security scanning
- Conventional Commits enforcement
- Protected main/develop branches workflow

### Documentation
- Comprehensive README with usage examples
- ISC License
- API documentation in code comments

[1.0.1]: https://github.com/quinnjr/guitar-pro-mcp/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/quinnjr/guitar-pro-mcp/releases/tag/v1.0.0

