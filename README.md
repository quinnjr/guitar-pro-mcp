# Guitar Pro MCP Server

[![CI](https://github.com/quinnjr/guitar-pro-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/quinnjr/guitar-pro-mcp/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/quinnjr/guitar-pro-mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/quinnjr/guitar-pro-mcp)
[![npm version](https://badge.fury.io/js/guitar-pro-mcp.svg)](https://www.npmjs.com/package/guitar-pro-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/node/v/guitar-pro-mcp.svg)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg)](https://pnpm.io/)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)

A Model Context Protocol (MCP) server for generating Guitar Pro 6 files programmatically. This server provides tools for creating tablature files with full control over tracks, measures, beats, and notes.

## Features

- 🎸 Generate Guitar Pro 6 (.gp6) files
- 🎵 Support for multiple tracks and instruments
- 📝 Full control over measures, beats, and notes
- 🎼 Time signatures, tempo changes, and key signatures
- 🎹 Note effects (palm mute, vibrato, harmonics, etc.)
- 🔧 Custom tunings for any string instrument
- 📊 97%+ test coverage with comprehensive unit tests
- 🚀 Built with TypeScript and compiled with esbuild
- 🔒 Git hooks with Husky for code quality enforcement
- 🧪 CI/CD pipelines with GitHub Actions
- 📐 ESLint + Prettier for consistent code style
- 🌳 Branch protection to prevent direct commits to main/develop

## Installation

### As a Package

```bash
# Using pnpm
pnpm add guitar-pro-mcp

# Using npm
npm install guitar-pro-mcp

# Using yarn
yarn add guitar-pro-mcp
```

### For Development

```bash
# Clone the repository
git clone https://github.com/quinnjr/guitar-pro-mcp.git
cd guitar-pro-mcp

# Install dependencies
pnpm install

# Build the project
pnpm build

# Run tests
pnpm test

# Check coverage
pnpm test:coverage

# Lint code
pnpm lint

# Fix lint issues
pnpm lint:fix
```

## Usage

This is an MCP server that can be integrated with MCP clients. The server provides two main tools:

### 1. create_guitar_pro_file

Create a Guitar Pro 6 file with full control over all aspects of the composition.

**Parameters:**
- `filename` (string, required): Name of the output file (e.g., "my-song.gp6")
- `outputDirectory` (string, optional): Custom output directory. Defaults to the Music folder
- `title` (string, required): Song title
- `artist` (string, optional): Artist name
- `tempo` (number, optional): Tempo in BPM (default: 120)
- `tracks` (array, required): Array of track objects

**Track Structure:**
```typescript
{
  name: string;           // Track name
  strings?: number;       // Number of strings (default: 6)
  tuning?: number[];      // MIDI note values for tuning
  measures: [{            // Array of measures
    timeSignature?: {     // Optional time signature
      numerator: number;
      denominator: number;
    };
    beats: [{             // Array of beats
      duration: number;   // 1=whole, 2=half, 4=quarter, 8=eighth, etc.
      dotted?: boolean;
      rest?: boolean;
      notes: [{           // Array of notes
        string: number;   // String number (1-based)
        fret: number;     // Fret number
        velocity?: number; // 0-127 (default: 95)
      }]
    }]
  }]
}
```

**Example:**
```javascript
{
  filename: "my-song.gp6",
  title: "My Guitar Song",
  artist: "Me",
  tempo: 120,
  tracks: [
    {
      name: "Lead Guitar",
      measures: [
        {
          timeSignature: { numerator: 4, denominator: 4 },
          beats: [
            {
              duration: 4,
              notes: [
                { string: 1, fret: 0 },
                { string: 2, fret: 2 },
                { string: 3, fret: 2 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. create_simple_guitar_pro_file

Create a simple Guitar Pro 6 file using an easy tablature format.

**Parameters:**
- `filename` (string, required): Name of the output file
- `outputDirectory` (string, optional): Custom output directory. Defaults to the Music folder
- `title` (string, required): Song title
- `artist` (string, optional): Artist name
- `tempo` (number, optional): Tempo in BPM (default: 120)
- `tablature` (array of strings, required): Tab strings in "fret-fret-fret" format

**Example:**
```javascript
{
  filename: "simple-riff.gp6",
  title: "Simple Riff",
  tempo: 140,
  tablature: [
    "0-2-2",  // First measure: open, 2nd fret, 2nd fret
    "3-3-3",  // Second measure: three notes on 3rd fret
    "5-5-7"   // Third measure
  ]
}
```

## Output Directory

By default, files are saved to:
- **Windows**: `C:\Users\<username>\Music`
- **Mac**: `/Users/<username>/Music`
- **Linux**: `/home/<username>/Music`

You can override this by providing a custom `outputDirectory` parameter.

## Development

### Project Structure

```
src/
├── models/          # Data models (Song, Track, Measure, Beat, Note)
├── writers/         # GP6 file writer
├── utils/           # Binary writer utilities
├── handlers/        # MCP tool handlers
└── index.ts         # MCP server entry point

tests/
├── models/          # Model tests
├── writers/         # Writer tests
├── utils/           # Utility tests
└── handlers/        # Handler tests

.github/
└── workflows/       # CI/CD pipelines
    ├── ci.yml       # Continuous integration
    ├── release.yml  # Release automation
    └── codeql.yml   # Security scanning
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Building

The project uses esbuild for fast compilation:

```bash
# Build once
pnpm build

# Build and watch for changes
node build.mjs --watch
```

### Code Quality

This project enforces code quality through:

#### ESLint + Prettier
```bash
# Run linter
pnpm lint

# Auto-fix linting issues
pnpm lint:fix
```

#### Git Hooks (Husky)

The project uses Husky to enforce quality standards:

- **pre-commit**: Prevents direct commits to `main` and `develop` branches
- **commit-msg**: Enforces Conventional Commits format
- **pre-push**: Runs linting, tests, and build before pushing

**Branch Naming Convention:**
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical fixes for production
- `refactor/*` - Code refactoring
- `docs/*` - Documentation updates

**Commit Message Format:**
```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Examples:**
```bash
feat: add support for custom time signatures
fix(parser): handle empty measures correctly
docs: update installation instructions
```

### CI/CD Pipelines

#### Continuous Integration (ci.yml)
- Runs on: Push to `main`/`develop`, Pull Requests
- Tests on: Node.js 18.x, 20.x, 22.x
- Platforms: Ubuntu, Windows, macOS
- Steps:
  1. Lint check
  2. Run tests with coverage
  3. Upload coverage to Codecov
  4. Build verification

#### Release Workflow (release.yml)
- Triggers on: Git tags (`v*.*.*`)
- Steps:
  1. Run full test suite
  2. Build project
  3. Create GitHub Release
  4. Publish to NPM

#### Security Scanning (codeql.yml)
- Runs weekly and on push/PR
- CodeQL analysis for vulnerabilities

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit using conventional commits: `git commit -m "feat: add amazing feature"`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

**Note:** Direct commits to `main` and `develop` are blocked by git hooks.

## Technical Details

### Guitar Pro 6 Format

This implementation focuses on Guitar Pro 6 (.gp6) compatibility. The format includes:
- Binary file structure with header identification
- Song metadata (title, artist, album, etc.)
- Track information (name, tuning, MIDI settings)
- Measure data (time signatures, tempo, markers)
- Beat information (duration, tuplets, effects)
- Note data (string, fret, velocity, articulations)

### Note Durations

- `1` - Whole note
- `2` - Half note
- `4` - Quarter note
- `8` - Eighth note
- `16` - Sixteenth note
- `32` - Thirty-second note

### Standard Guitar Tuning (MIDI values)

- String 1 (High E): 64
- String 2 (B): 59
- String 3 (G): 55
- String 4 (D): 50
- String 5 (A): 45
- String 6 (Low E): 40

## Testing

The project includes comprehensive unit tests with 97%+ coverage:
- **147 tests** across 9 test suites
- All models tested (Note, Beat, Measure, Track, Song)
- Binary writer fully tested
- GP6 writer tested with various song structures
- Handler integration tests
- File I/O and error handling tests

## Requirements

- Node.js 18+ (Tested on 18.x, 20.x, 22.x)
- pnpm 10.19+

## Badges Explained

- **CI**: Continuous Integration status - shows if all tests pass
- **codecov**: Code coverage percentage - we maintain 97%+ coverage
- **npm version**: Latest published version on NPM
- **License**: ISC License
- **Node.js Version**: Minimum required Node.js version
- **pnpm**: Package manager used for this project
- **Code Style**: Formatted with Prettier

## Support

- **Issues**: [GitHub Issues](https://github.com/quinnjr/guitar-pro-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/quinnjr/guitar-pro-mcp/discussions)

## License

ISC

## Guitar Pro Compatibility

This server generates Guitar Pro 6 files. These files are compatible with:
- Guitar Pro 6 and later versions
- Both Windows and macOS versions of Guitar Pro

Note: Guitar Pro is a proprietary application by Arobas Music. This server generates files in the Guitar Pro format but does not include Guitar Pro itself.

