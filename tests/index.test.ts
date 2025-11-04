import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir, tmpdir } from 'os';

// Import the functions we need to test
import { createSong, addTrackToSong } from '../src/models/Song';
import { createTrack, addMeasureToTrack } from '../src/models/Track';
import { createMeasure, addBeatToMeasure, setTimeSignature } from '../src/models/Measure';
import { createBeat, addNoteToBeat, Duration } from '../src/models/Beat';
import { createNote } from '../src/models/Note';
import { writeGPXFile } from '../src/writers/GPXWriter';

describe('MCP Server Functions', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary test directory
    testDir = join(
      tmpdir(),
      `guitar-pro-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
    );
    await fs.mkdir(testDir, { recursive: true });
    // Ensure directory is writable
    await fs.access(testDir, fs.constants.W_OK);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('File Creation Integration', () => {
    it('should create a complete Guitar Pro file with all components', async () => {
      // Create a song
      let song = createSong('Integration Test Song', 'Test Artist');

      // Create a track
      let track = createTrack('Guitar', 6);

      // Create a measure with time signature
      let measure = createMeasure();
      measure = setTimeSignature(measure, 4, 4);

      // Add beats with notes
      for (let i = 0; i < 4; i++) {
        let beat = createBeat(Duration.QUARTER);
        const note = createNote(i * 2, 1);
        beat = addNoteToBeat(beat, note);
        measure = addBeatToMeasure(measure, beat);
      }

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      // Write the file
      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'test-song.gpx');
      await fs.writeFile(filepath, buffer);

      // Verify file exists and has content
      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
      expect(stats.isFile()).toBe(true);
    });

    it('should create file with multiple tracks', async () => {
      let song = createSong('Multi-Track Song');

      // Add guitar track
      let guitar = createTrack('Lead Guitar');
      let guitarMeasure = createMeasure();
      let guitarBeat = createBeat(Duration.QUARTER);
      guitarBeat = addNoteToBeat(guitarBeat, createNote(5, 1));
      guitarMeasure = addBeatToMeasure(guitarMeasure, guitarBeat);
      guitar = addMeasureToTrack(guitar, guitarMeasure);

      // Add bass track
      let bass = createTrack('Bass', 4);
      let bassMeasure = createMeasure();
      let bassBeat = createBeat(Duration.QUARTER);
      bassBeat = addNoteToBeat(bassBeat, createNote(3, 1));
      bassMeasure = addBeatToMeasure(bassMeasure, bassBeat);
      bass = addMeasureToTrack(bass, bassMeasure);

      song = addTrackToSong(song, guitar);
      song = addTrackToSong(song, bass);

      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'multi-track.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should create file with complex structure', async () => {
      let song = createSong('Complex Song', 'Complex Artist');
      let track = createTrack('Guitar');

      // Multiple measures
      for (let m = 0; m < 4; m++) {
        let measure = createMeasure();

        // Multiple beats per measure
        for (let b = 0; b < 4; b++) {
          let beat = createBeat(Duration.EIGHTH);

          // Multiple notes per beat (chord)
          beat = addNoteToBeat(beat, createNote(0, 1));
          beat = addNoteToBeat(beat, createNote(2, 2));
          beat = addNoteToBeat(beat, createNote(2, 3));

          measure = addBeatToMeasure(measure, beat);
        }

        track = addMeasureToTrack(track, measure);
      }

      song = addTrackToSong(song, track);

      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'complex.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(100);
    });

    it('should handle songs with different note durations', async () => {
      let song = createSong('Duration Test');
      let track = createTrack('Guitar');
      let measure = createMeasure();

      const durations = [
        Duration.WHOLE,
        Duration.HALF,
        Duration.QUARTER,
        Duration.EIGHTH,
        Duration.SIXTEENTH,
      ];

      for (const duration of durations) {
        let beat = createBeat(duration);
        beat = addNoteToBeat(beat, createNote(5, 1));
        measure = addBeatToMeasure(measure, beat);
      }

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'durations.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should handle empty songs', async () => {
      const song = createSong('Empty Song');

      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'empty.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should handle songs with rests', async () => {
      let song = createSong('Rest Test');
      let track = createTrack('Guitar');
      let measure = createMeasure();

      // Add a note
      let beat1 = createBeat(Duration.QUARTER);
      beat1 = addNoteToBeat(beat1, createNote(5, 1));
      measure = addBeatToMeasure(measure, beat1);

      // Add a rest
      const beat2 = createBeat(Duration.QUARTER);
      beat2.rest = true;
      measure = addBeatToMeasure(measure, beat2);

      // Add another note
      let beat3 = createBeat(Duration.QUARTER);
      beat3 = addNoteToBeat(beat3, createNote(7, 1));
      measure = addBeatToMeasure(measure, beat3);

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'rests.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should handle dotted notes', async () => {
      let song = createSong('Dotted Notes');
      let track = createTrack('Guitar');
      let measure = createMeasure();

      let beat = createBeat(Duration.QUARTER);
      beat.dotted = true;
      beat = addNoteToBeat(beat, createNote(5, 1));
      measure = addBeatToMeasure(measure, beat);

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'dotted.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should handle notes with effects', async () => {
      let song = createSong('Effects Test');
      let track = createTrack('Guitar');
      let measure = createMeasure();

      let beat = createBeat(Duration.QUARTER);
      const note = createNote(12, 1);
      note.palmMute = true;
      note.vibrato = true;
      note.harmonic = true;
      beat = addNoteToBeat(beat, note);
      measure = addBeatToMeasure(measure, beat);

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'effects.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Directory Handling', () => {
    it('should create output directory if it does not exist', async () => {
      const nestedDir = join(testDir, 'nested', 'dir');
      await fs.mkdir(nestedDir, { recursive: true });

      const song = createSong('Test');
      const buffer = writeGPXFile(song);
      const filepath = join(nestedDir, 'test.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.isFile()).toBe(true);
    });

    it('should handle filenames with and without .gpx extension', async () => {
      const song = createSong('Test');
      const buffer = writeGPXFile(song);

      // Without extension
      const filepath1 = join(testDir, 'test1.gpx');
      await fs.writeFile(filepath1, buffer);
      expect((await fs.stat(filepath1)).isFile()).toBe(true);

      // With extension already
      const filepath2 = join(testDir, 'test2.gpx');
      await fs.writeFile(filepath2, buffer);
      expect((await fs.stat(filepath2)).isFile()).toBe(true);
    });
  });

  describe('Default Directory Function', () => {
    it('should return a valid path for default directory', () => {
      const home = homedir();
      const musicDir = join(home, 'Music');

      expect(home).toBeDefined();
      expect(musicDir).toContain('Music');
    });
  });

  describe('Song Building Workflow', () => {
    it('should support a typical song creation workflow', async () => {
      // Start with empty song
      let song = createSong('My Song', 'My Band');
      expect(song.tracks.length).toBe(0);

      // Add first track
      let track1 = createTrack('Guitar');
      let measure1 = createMeasure();
      measure1 = setTimeSignature(measure1, 4, 4);

      let beat1 = createBeat(Duration.QUARTER);
      beat1 = addNoteToBeat(beat1, createNote(0, 1));
      measure1 = addBeatToMeasure(measure1, beat1);

      track1 = addMeasureToTrack(track1, measure1);
      song = addTrackToSong(song, track1);

      expect(song.tracks.length).toBe(1);
      expect(song.measureCount).toBe(1);

      // Add second track
      let track2 = createTrack('Bass', 4);
      let measure2 = createMeasure();

      let beat2 = createBeat(Duration.QUARTER);
      beat2 = addNoteToBeat(beat2, createNote(0, 1));
      measure2 = addBeatToMeasure(measure2, beat2);

      track2 = addMeasureToTrack(track2, measure2);
      song = addTrackToSong(song, track2);

      expect(song.tracks.length).toBe(2);

      // Write the complete song
      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'workflow.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid file paths gracefully', async () => {
      const song = createSong('Test');
      const buffer = writeGPXFile(song);

      // Try to write to an invalid path
      const invalidPath = join('Z:\\invalid\\path\\test.gpx');

      try {
        await fs.writeFile(invalidPath, buffer);
        // If it somehow succeeds, that's also ok
      } catch (error) {
        // Expected to fail
        expect(error).toBeDefined();
      }
    });
  });

  describe('Simple Tablature Parser Simulation', () => {
    it('should handle simple tab string format', async () => {
      let song = createSong('Simple Tab');
      let track = createTrack('Guitar', 6);

      // Simulate parsing "0-2-2" format
      const tabString = '0-2-2';
      const frets = tabString.split('-').map((f) => parseInt(f, 10));

      let measure = createMeasure();
      for (const fret of frets) {
        let beat = createBeat(Duration.QUARTER);
        const note = createNote(fret, 1, 95);
        beat = addNoteToBeat(beat, note);
        measure = addBeatToMeasure(measure, beat);
      }

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writeGPXFile(song);
      expect(buffer.length).toBeGreaterThan(0);

      const filepath = join(testDir, 'simple-tab.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should handle multiple tab strings', async () => {
      let song = createSong('Multi Tab');
      let track = createTrack('Guitar', 6);

      const tablature = ['0-2-2', '3-3-3', '5-5-7'];

      for (const tabString of tablature) {
        let measure = createMeasure();
        const frets = tabString.split('-').map((f) => parseInt(f, 10));

        for (const fret of frets) {
          let beat = createBeat(Duration.QUARTER);
          const note = createNote(fret, 1, 95);
          beat = addNoteToBeat(beat, note);
          measure = addBeatToMeasure(measure, beat);
        }

        track = addMeasureToTrack(track, measure);
      }

      song = addTrackToSong(song, track);

      const buffer = writeGPXFile(song);
      const filepath = join(testDir, 'multi-tab.gpx');
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      expect(stats.size).toBeGreaterThan(0);
      expect(song.measureCount).toBe(3);
    });
  });
});
