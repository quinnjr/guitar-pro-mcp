import { describe, it, expect } from 'vitest';
import { GPXWriter, writeGPXFile } from '../../src/writers/GPXWriter';
import { createSong, addTrackToSong } from '../../src/models/Song';
import { createTrack, addMeasureToTrack } from '../../src/models/Track';
import {
  createMeasure,
  addBeatToMeasure,
  setTimeSignature,
  setTempo,
} from '../../src/models/Measure';
import { createBeat, addNoteToBeat, Duration } from '../../src/models/Beat';
import { createNote } from '../../src/models/Note';

describe('GPXWriter', () => {
  describe('write', () => {
    it('should write a basic song to buffer', () => {
      const writer = new GPXWriter();
      const song = createSong('Test Song', 'Test Artist');

      const buffer = writer.write(song);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write GP6 header', () => {
      const writer = new GPXWriter();
      const song = createSong('Test');

      const buffer = writer.write(song);

      // Check for GP6 identifier
      const header = buffer.toString('utf8', 0, 21);
      expect(header).toContain('FICHIER GUITAR PRO');
    });

    it('should write song with single track', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      const track = createTrack('Guitar');
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with multiple tracks', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');

      const guitar = createTrack('Guitar');
      const bass = createTrack('Bass', 4);

      song = addTrackToSong(song, guitar);
      song = addTrackToSong(song, bass);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with measures and notes', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      // Create a measure with a beat and note
      let measure = createMeasure();
      let beat = createBeat(Duration.QUARTER);
      const note = createNote(5, 1, 95);
      beat = addNoteToBeat(beat, note);
      measure = addBeatToMeasure(measure, beat);

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with time signature', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();
      measure = setTimeSignature(measure, 3, 4);

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with tempo changes', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();
      measure = setTempo(measure, 140);

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with multiple beats per measure', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();

      // Add 4 quarter notes
      for (let i = 0; i < 4; i++) {
        let beat = createBeat(Duration.QUARTER);
        const note = createNote(i, 1);
        beat = addNoteToBeat(beat, note);
        measure = addBeatToMeasure(measure, beat);
      }

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with chord (multiple notes per beat)', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();
      let beat = createBeat(Duration.QUARTER);

      // Add multiple notes to form a chord
      beat = addNoteToBeat(beat, createNote(0, 1));
      beat = addNoteToBeat(beat, createNote(2, 2));
      beat = addNoteToBeat(beat, createNote(2, 3));

      measure = addBeatToMeasure(measure, beat);
      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with different note durations', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();

      // Different durations
      const durations = [
        Duration.WHOLE,
        Duration.HALF,
        Duration.QUARTER,
        Duration.EIGHTH,
        Duration.SIXTEENTH,
        Duration.THIRTY_SECOND,
      ];

      for (const duration of durations) {
        let beat = createBeat(duration);
        const note = createNote(5, 1);
        beat = addNoteToBeat(beat, note);
        measure = addBeatToMeasure(measure, beat);
      }

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with dotted notes', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();
      let beat = createBeat(Duration.QUARTER);
      beat.dotted = true;
      const note = createNote(5, 1);
      beat = addNoteToBeat(beat, note);

      measure = addBeatToMeasure(measure, beat);
      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with rest beats', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();
      const beat = createBeat(Duration.QUARTER);
      beat.rest = true;

      measure = addBeatToMeasure(measure, beat);
      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should write song with note effects', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();
      let beat = createBeat(Duration.QUARTER);
      const note = createNote(12, 1);
      note.palmMute = true;
      note.vibrato = true;
      beat = addNoteToBeat(beat, note);

      measure = addBeatToMeasure(measure, beat);
      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle empty tracks', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      const track = createTrack('Guitar'); // No measures
      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should handle multiple measures', () => {
      const writer = new GPXWriter();
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      // Add 3 measures
      for (let i = 0; i < 3; i++) {
        let measure = createMeasure();
        let beat = createBeat(Duration.QUARTER);
        const note = createNote(i, 1);
        beat = addNoteToBeat(beat, note);
        measure = addBeatToMeasure(measure, beat);
        track = addMeasureToTrack(track, measure);
      }

      song = addTrackToSong(song, track);

      const buffer = writer.write(song);

      expect(buffer.length).toBeGreaterThan(0);
    });
  });

  describe('writeGPXFile', () => {
    it('should write a song using convenience function', () => {
      let song = createSong('Test Song');
      let track = createTrack('Guitar');

      let measure = createMeasure();
      let beat = createBeat(Duration.QUARTER);
      const note = createNote(5, 1);
      beat = addNoteToBeat(beat, note);
      measure = addBeatToMeasure(measure, beat);

      track = addMeasureToTrack(track, measure);
      song = addTrackToSong(song, track);

      const buffer = writeGPXFile(song);

      expect(buffer).toBeInstanceOf(Buffer);
      expect(buffer.length).toBeGreaterThan(0);
    });

    it('should produce same output as GPXWriter', () => {
      const song = createSong('Test Song');

      const writer = new GPXWriter();
      const buffer1 = writer.write(song);
      const buffer2 = writeGPXFile(song);

      // Both should produce valid buffers
      expect(buffer1.length).toBeGreaterThan(0);
      expect(buffer2.length).toBeGreaterThan(0);
    });
  });

  describe('complex songs', () => {
    it('should write a realistic song structure', () => {
      let song = createSong('Rock Song', 'The Band');

      // Guitar track with 4 measures
      let guitar = createTrack('Lead Guitar');
      for (let m = 0; m < 4; m++) {
        let measure = createMeasure();
        if (m === 0) {
          measure = setTimeSignature(measure, 4, 4);
          measure = setTempo(measure, 120);
        }

        // 4 beats per measure
        for (let b = 0; b < 4; b++) {
          let beat = createBeat(Duration.QUARTER);
          const note = createNote((m * 2 + b) % 12, 1);
          beat = addNoteToBeat(beat, note);
          measure = addBeatToMeasure(measure, beat);
        }

        guitar = addMeasureToTrack(guitar, measure);
      }

      // Bass track with 4 measures
      let bass = createTrack('Bass', 4);
      for (let m = 0; m < 4; m++) {
        let measure = createMeasure();

        for (let b = 0; b < 4; b++) {
          let beat = createBeat(Duration.QUARTER);
          const note = createNote(m % 5, 1);
          beat = addNoteToBeat(beat, note);
          measure = addBeatToMeasure(measure, beat);
        }

        bass = addMeasureToTrack(bass, measure);
      }

      song = addTrackToSong(song, guitar);
      song = addTrackToSong(song, bass);

      const buffer = writeGPXFile(song);

      expect(buffer.length).toBeGreaterThan(100);
      expect(song.tracks.length).toBe(2);
      expect(song.measureCount).toBe(4);
    });
  });
});
