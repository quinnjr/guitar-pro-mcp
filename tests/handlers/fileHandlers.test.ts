import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir, platform, homedir } from 'os';
import {
  getDefaultOutputDirectory,
  createGuitarProFile,
  createSimpleGuitarProFile,
} from '../../src/handlers/fileHandlers';

describe('File Handlers', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = join(
      tmpdir(),
      `guitar-pro-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    await fs.mkdir(testDir, { recursive: true });
    // Ensure directory is writable
    await fs.access(testDir, fs.constants.W_OK);
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('getDefaultOutputDirectory', () => {
    it('should return a path containing Music', () => {
      const dir = getDefaultOutputDirectory();
      expect(dir).toContain('Music');
    });

    it('should return an absolute path', () => {
      const dir = getDefaultOutputDirectory();
      expect(dir.length).toBeGreaterThan(0);
      // Should contain some path separator
      expect(dir).toMatch(/[/\\]/);
    });

    it('should return platform-appropriate Music directory', () => {
      const dir = getDefaultOutputDirectory();
      const home = homedir();
      const currentPlatform = platform();

      if (currentPlatform === 'win32') {
        // Windows: Should be like C:\Users\username\Music
        expect(dir).toBe(join(home, 'Music'));
        expect(dir).toMatch(/\\/);
      } else if (currentPlatform === 'darwin') {
        // macOS: Should be like /Users/username/Music
        expect(dir).toBe(join(home, 'Music'));
        expect(dir).toMatch(/\//);
      } else if (currentPlatform === 'linux') {
        // Linux: Should respect XDG_MUSIC_DIR or fallback to ~/Music
        if (process.env.XDG_MUSIC_DIR) {
          expect(dir).toBe(process.env.XDG_MUSIC_DIR);
        } else {
          expect(dir).toBe(join(home, 'Music'));
        }
      }
    });

    it('should respect XDG_MUSIC_DIR on Linux', () => {
      // Only test this on Linux or when we can mock the platform
      const currentPlatform = platform();
      if (currentPlatform === 'linux') {
        const originalXdgMusicDir = process.env.XDG_MUSIC_DIR;
        const testMusicDir = '/home/testuser/CustomMusic';

        // Set XDG_MUSIC_DIR
        process.env.XDG_MUSIC_DIR = testMusicDir;

        const dir = getDefaultOutputDirectory();
        expect(dir).toBe(testMusicDir);

        // Restore original value
        if (originalXdgMusicDir) {
          process.env.XDG_MUSIC_DIR = originalXdgMusicDir;
        } else {
          delete process.env.XDG_MUSIC_DIR;
        }
      } else {
        // On non-Linux platforms, just verify it doesn't use XDG_MUSIC_DIR
        const dir = getDefaultOutputDirectory();
        expect(dir).toBe(join(homedir(), 'Music'));
      }
    });
  });

  describe('createGuitarProFile', () => {
    it('should create a basic guitar pro file', async () => {
      const args = {
        filename: 'test-song',
        outputDirectory: testDir,
        title: 'Test Song',
        artist: 'Test Artist',
        tempo: 120,
        tracks: [
          {
            name: 'Guitar',
            measures: [
              {
                beats: [
                  {
                    duration: 4,
                    notes: [{ string: 1, fret: 5 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = await createGuitarProFile(args);

      expect(result.filepath).toContain('test-song.gp6');
      expect(result.song.info.title).toBe('Test Song');
      expect(result.song.info.artist).toBe('Test Artist');
      expect(result.song.tracks.length).toBe(1);

      // Verify file exists
      const stats = await fs.stat(result.filepath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should add .gp6 extension if not provided', async () => {
      const args = {
        filename: 'test-song-no-ext',
        outputDirectory: testDir,
        title: 'Test',
        tracks: [],
      };

      const result = await createGuitarProFile(args);

      expect(result.filepath).toMatch(/\.gp6$/);
    });

    it('should not duplicate .gp6 extension', async () => {
      const args = {
        filename: 'test-song.gp6',
        outputDirectory: testDir,
        title: 'Test',
        tracks: [],
      };

      const result = await createGuitarProFile(args);

      expect(result.filepath).toMatch(/\.gp6$/);
      expect(result.filepath).not.toMatch(/\.gp6\.gp6$/);
    });

    it('should use default directory if not provided', async () => {
      const args = {
        filename: 'test-default-dir',
        title: 'Test',
        tracks: [],
      };

      const result = await createGuitarProFile(args);

      expect(result.filepath).toContain('Music');
    });

    it('should create directory if it does not exist', async () => {
      const nestedDir = join(testDir, 'nested', 'path');

      const args = {
        filename: 'test-nested',
        outputDirectory: nestedDir,
        title: 'Test',
        tracks: [],
      };

      const result = await createGuitarProFile(args);

      const stats = await fs.stat(result.filepath);
      expect(stats.isFile()).toBe(true);
    });

    it('should handle multiple tracks', async () => {
      const args = {
        filename: 'multi-track',
        outputDirectory: testDir,
        title: 'Multi Track Song',
        tracks: [
          {
            name: 'Guitar',
            measures: [
              {
                beats: [{ duration: 4, notes: [{ string: 1, fret: 0 }] }],
              },
            ],
          },
          {
            name: 'Bass',
            strings: 4,
            measures: [
              {
                beats: [{ duration: 4, notes: [{ string: 1, fret: 3 }] }],
              },
            ],
          },
        ],
      };

      const result = await createGuitarProFile(args);

      expect(result.song.tracks.length).toBe(2);
      expect(result.song.tracks[0].name).toBe('Guitar');
      expect(result.song.tracks[1].name).toBe('Bass');
    });

    it('should handle custom tuning', async () => {
      const customTuning = [62, 57, 53, 48, 43, 38]; // Drop D tuning

      const args = {
        filename: 'custom-tuning',
        outputDirectory: testDir,
        title: 'Drop D Song',
        tracks: [
          {
            name: 'Guitar',
            tuning: customTuning,
            measures: [],
          },
        ],
      };

      const result = await createGuitarProFile(args);

      expect(result.song.tracks[0].tuning.strings).toEqual(customTuning);
    });

    it('should handle time signatures', async () => {
      const args = {
        filename: 'time-sig',
        outputDirectory: testDir,
        title: 'Odd Time',
        tracks: [
          {
            name: 'Guitar',
            measures: [
              {
                timeSignature: { numerator: 7, denominator: 8 },
                beats: [],
              },
            ],
          },
        ],
      };

      const result = await createGuitarProFile(args);

      expect(result.song.tracks[0].measures[0].timeSignature).toBeDefined();
      expect(result.song.tracks[0].measures[0].timeSignature?.numerator).toBe(7);
    });

    it('should handle dotted notes', async () => {
      const args = {
        filename: 'dotted',
        outputDirectory: testDir,
        title: 'Dotted Notes',
        tracks: [
          {
            name: 'Guitar',
            measures: [
              {
                beats: [
                  {
                    duration: 4,
                    dotted: true,
                    notes: [{ string: 1, fret: 5 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = await createGuitarProFile(args);

      expect(result.song.tracks[0].measures[0].beats[0].dotted).toBe(true);
    });

    it('should handle rest beats', async () => {
      const args = {
        filename: 'rests',
        outputDirectory: testDir,
        title: 'With Rests',
        tracks: [
          {
            name: 'Guitar',
            measures: [
              {
                beats: [
                  {
                    duration: 4,
                    rest: true,
                    notes: [],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = await createGuitarProFile(args);

      expect(result.song.tracks[0].measures[0].beats[0].rest).toBe(true);
    });

    it('should handle custom velocity', async () => {
      const args = {
        filename: 'velocity',
        outputDirectory: testDir,
        title: 'Velocity Test',
        tracks: [
          {
            name: 'Guitar',
            measures: [
              {
                beats: [
                  {
                    duration: 4,
                    notes: [{ string: 1, fret: 5, velocity: 110 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = await createGuitarProFile(args);

      expect(result.song.tracks[0].measures[0].beats[0].notes[0].velocity).toBe(110);
    });

    it('should use default velocity if not specified', async () => {
      const args = {
        filename: 'default-velocity',
        outputDirectory: testDir,
        title: 'Default Velocity',
        tracks: [
          {
            name: 'Guitar',
            measures: [
              {
                beats: [
                  {
                    duration: 4,
                    notes: [{ string: 1, fret: 5 }],
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = await createGuitarProFile(args);

      expect(result.song.tracks[0].measures[0].beats[0].notes[0].velocity).toBe(95);
    });
  });

  describe('createSimpleGuitarProFile', () => {
    it('should create a simple guitar pro file', async () => {
      const args = {
        filename: 'simple-song',
        outputDirectory: testDir,
        title: 'Simple Song',
        artist: 'Simple Artist',
        tempo: 100,
        tablature: ['0-2-2', '3-3-3'],
      };

      const result = await createSimpleGuitarProFile(args);

      expect(result.filepath).toContain('simple-song.gp6');
      expect(result.song.info.title).toBe('Simple Song');
      expect(result.song.tracks.length).toBe(1);
      expect(result.song.measureCount).toBe(2);

      // Verify file exists
      const stats = await fs.stat(result.filepath);
      expect(stats.isFile()).toBe(true);
    });

    it('should parse tab strings correctly', async () => {
      const args = {
        filename: 'tab-parse',
        outputDirectory: testDir,
        title: 'Tab Test',
        tablature: ['0-2-3'],
      };

      const result = await createSimpleGuitarProFile(args);

      const measure = result.song.tracks[0].measures[0];
      expect(measure.beats.length).toBe(3);
      expect(measure.beats[0].notes[0].fret).toBe(0);
      expect(measure.beats[1].notes[0].fret).toBe(2);
      expect(measure.beats[2].notes[0].fret).toBe(3);
    });

    it('should add .gp6 extension if not provided', async () => {
      const args = {
        filename: 'simple-no-ext',
        outputDirectory: testDir,
        title: 'Test',
        tablature: ['0'],
      };

      const result = await createSimpleGuitarProFile(args);

      expect(result.filepath).toMatch(/\.gp6$/);
    });

    it('should handle multiple measures', async () => {
      const args = {
        filename: 'multi-measure',
        outputDirectory: testDir,
        title: 'Multi',
        tablature: ['0-2-2', '3-3-3', '5-5-7'],
      };

      const result = await createSimpleGuitarProFile(args);

      expect(result.song.measureCount).toBe(3);
      expect(result.song.tracks[0].measures.length).toBe(3);
    });

    it('should use default directory if not provided', async () => {
      const args = {
        filename: 'simple-default',
        title: 'Test',
        tablature: ['0'],
      };

      const result = await createSimpleGuitarProFile(args);

      expect(result.filepath).toContain('Music');
    });

    it('should handle single note tablature', async () => {
      const args = {
        filename: 'single-note',
        outputDirectory: testDir,
        title: 'Single',
        tablature: ['5'],
      };

      const result = await createSimpleGuitarProFile(args);

      expect(result.song.tracks[0].measures[0].beats.length).toBe(1);
      expect(result.song.tracks[0].measures[0].beats[0].notes[0].fret).toBe(5);
    });

    it('should handle empty tablature string', async () => {
      const args = {
        filename: 'empty-tab',
        outputDirectory: testDir,
        title: 'Empty',
        tablature: [],
      };

      const result = await createSimpleGuitarProFile(args);

      expect(result.song.tracks[0].measures.length).toBe(0);
    });

    it('should set tempo correctly', async () => {
      const args = {
        filename: 'tempo-test',
        outputDirectory: testDir,
        title: 'Tempo',
        tempo: 180,
        tablature: ['0'],
      };

      const result = await createSimpleGuitarProFile(args);

      expect(result.song.tempo).toBe(180);
    });

    it('should use default tempo if not provided', async () => {
      const args = {
        filename: 'default-tempo',
        outputDirectory: testDir,
        title: 'Default',
        tablature: ['0'],
      };

      const result = await createSimpleGuitarProFile(args);

      expect(result.song.tempo).toBe(120);
    });
  });
});
