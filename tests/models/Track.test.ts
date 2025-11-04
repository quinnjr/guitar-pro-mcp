import { describe, it, expect } from 'vitest';
import { createTrack, addMeasureToTrack, setTuning } from '../../src/models/Track';
import { createMeasure } from '../../src/models/Measure';

describe('Track', () => {
  describe('createTrack', () => {
    it('should create a track with default 6 strings', () => {
      const track = createTrack('Guitar');

      expect(track.name).toBe('Guitar');
      expect(track.tuning.strings.length).toBe(6);
      expect(track.measures).toEqual([]);
    });

    it('should create a track with standard guitar tuning', () => {
      const track = createTrack('Guitar');

      // Standard tuning: E A D G B E (MIDI notes: 64, 59, 55, 50, 45, 40)
      expect(track.tuning.strings).toEqual([64, 59, 55, 50, 45, 40]);
    });

    it('should create a track with custom string count', () => {
      const track = createTrack('Bass', 4);

      expect(track.name).toBe('Bass');
      expect(track.tuning.strings.length).toBe(4);
    });

    it('should initialize with default MIDI channel settings', () => {
      const track = createTrack('Guitar');

      expect(track.midiChannel.channel).toBe(0);
      expect(track.midiChannel.effectChannel).toBe(1);
      expect(track.midiChannel.instrument).toBe(25); // Acoustic Guitar (steel)
    });

    it('should initialize with default effects settings', () => {
      const track = createTrack('Guitar');

      expect(track.volume).toBe(13);
      expect(track.balance).toBe(0);
      expect(track.chorus).toBe(0);
      expect(track.reverb).toBe(0);
      expect(track.phaser).toBe(0);
      expect(track.tremolo).toBe(0);
    });

    it('should initialize with default fret count', () => {
      const track = createTrack('Guitar');

      expect(track.fretCount).toBe(24);
      expect(track.offset).toBe(0);
    });

    it('should initialize with a color', () => {
      const track = createTrack('Guitar');

      expect(track.color).toBeDefined();
      expect(track.color.r).toBeDefined();
      expect(track.color.g).toBeDefined();
      expect(track.color.b).toBeDefined();
    });
  });

  describe('addMeasureToTrack', () => {
    it('should add a measure to a track', () => {
      let track = createTrack('Guitar');
      const measure = createMeasure();

      track = addMeasureToTrack(track, measure);

      expect(track.measures.length).toBe(1);
      expect(track.measures[0]).toEqual(measure);
    });

    it('should add multiple measures to a track', () => {
      let track = createTrack('Guitar');
      const measure1 = createMeasure();
      const measure2 = createMeasure();
      const measure3 = createMeasure();

      track = addMeasureToTrack(track, measure1);
      track = addMeasureToTrack(track, measure2);
      track = addMeasureToTrack(track, measure3);

      expect(track.measures.length).toBe(3);
    });

    it('should not mutate the original track', () => {
      const originalTrack = createTrack('Guitar');
      const measure = createMeasure();

      const newTrack = addMeasureToTrack(originalTrack, measure);

      expect(originalTrack.measures.length).toBe(0);
      expect(newTrack.measures.length).toBe(1);
    });
  });

  describe('setTuning', () => {
    it('should set custom tuning', () => {
      let track = createTrack('Guitar');
      const dropDTuning = [62, 59, 55, 50, 45, 40]; // Drop D

      track = setTuning(track, dropDTuning);

      expect(track.tuning.strings).toEqual(dropDTuning);
    });

    it('should set bass tuning', () => {
      let track = createTrack('Bass', 4);
      const bassTuning = [43, 38, 33, 28]; // Standard bass tuning

      track = setTuning(track, bassTuning);

      expect(track.tuning.strings).toEqual(bassTuning);
      expect(track.tuning.strings.length).toBe(4);
    });

    it('should not mutate the original track', () => {
      const originalTrack = createTrack('Guitar');
      const originalTuning = [...originalTrack.tuning.strings];
      const newTuning = [62, 59, 55, 50, 45, 40];

      const newTrack = setTuning(originalTrack, newTuning);

      expect(originalTrack.tuning.strings).toEqual(originalTuning);
      expect(newTrack.tuning.strings).toEqual(newTuning);
    });
  });

  describe('Track modifications', () => {
    it('should allow modifying MIDI settings', () => {
      const track = createTrack('Piano');
      track.midiChannel.instrument = 0; // Acoustic Grand Piano

      expect(track.midiChannel.instrument).toBe(0);
    });

    it('should allow modifying effects', () => {
      const track = createTrack('Guitar');
      track.reverb = 8;
      track.chorus = 5;

      expect(track.reverb).toBe(8);
      expect(track.chorus).toBe(5);
    });

    it('should allow setting capo position', () => {
      const track = createTrack('Guitar');
      track.offset = 2; // Capo on 2nd fret

      expect(track.offset).toBe(2);
    });
  });
});
