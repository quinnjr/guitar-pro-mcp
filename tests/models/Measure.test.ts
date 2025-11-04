import { describe, it, expect } from 'vitest';
import {
  createMeasure,
  addBeatToMeasure,
  setTimeSignature,
  setTempo,
} from '../../src/models/Measure';
import { createBeat, Duration } from '../../src/models/Beat';

describe('Measure', () => {
  describe('createMeasure', () => {
    it('should create an empty measure', () => {
      const measure = createMeasure();

      expect(measure.beats).toEqual([]);
      expect(measure.timeSignature).toBeUndefined();
      expect(measure.keySignature).toBeUndefined();
      expect(measure.tempo).toBeUndefined();
      expect(measure.marker).toBeUndefined();
    });
  });

  describe('addBeatToMeasure', () => {
    it('should add a beat to a measure', () => {
      let measure = createMeasure();
      const beat = createBeat();

      measure = addBeatToMeasure(measure, beat);

      expect(measure.beats.length).toBe(1);
      expect(measure.beats[0]).toEqual(beat);
    });

    it('should add multiple beats to a measure', () => {
      let measure = createMeasure();
      const beat1 = createBeat(Duration.QUARTER);
      const beat2 = createBeat(Duration.EIGHTH);
      const beat3 = createBeat(Duration.SIXTEENTH);

      measure = addBeatToMeasure(measure, beat1);
      measure = addBeatToMeasure(measure, beat2);
      measure = addBeatToMeasure(measure, beat3);

      expect(measure.beats.length).toBe(3);
    });

    it('should not mutate the original measure', () => {
      const originalMeasure = createMeasure();
      const beat = createBeat();

      const newMeasure = addBeatToMeasure(originalMeasure, beat);

      expect(originalMeasure.beats.length).toBe(0);
      expect(newMeasure.beats.length).toBe(1);
    });
  });

  describe('setTimeSignature', () => {
    it('should set time signature to 4/4', () => {
      let measure = createMeasure();
      measure = setTimeSignature(measure, 4, 4);

      expect(measure.timeSignature).toBeDefined();
      expect(measure.timeSignature?.numerator).toBe(4);
      expect(measure.timeSignature?.denominator).toBe(4);
    });

    it('should set time signature to 3/4', () => {
      let measure = createMeasure();
      measure = setTimeSignature(measure, 3, 4);

      expect(measure.timeSignature?.numerator).toBe(3);
      expect(measure.timeSignature?.denominator).toBe(4);
    });

    it('should set time signature to 6/8', () => {
      let measure = createMeasure();
      measure = setTimeSignature(measure, 6, 8);

      expect(measure.timeSignature?.numerator).toBe(6);
      expect(measure.timeSignature?.denominator).toBe(8);
    });

    it('should support odd time signatures', () => {
      let measure = createMeasure();
      measure = setTimeSignature(measure, 7, 8);

      expect(measure.timeSignature?.numerator).toBe(7);
      expect(measure.timeSignature?.denominator).toBe(8);
    });

    it('should not mutate the original measure', () => {
      const originalMeasure = createMeasure();
      const newMeasure = setTimeSignature(originalMeasure, 4, 4);

      expect(originalMeasure.timeSignature).toBeUndefined();
      expect(newMeasure.timeSignature).toBeDefined();
    });
  });

  describe('setTempo', () => {
    it('should set tempo', () => {
      let measure = createMeasure();
      measure = setTempo(measure, 120);

      expect(measure.tempo).toBe(120);
    });

    it('should support different tempo values', () => {
      let measure1 = createMeasure();
      let measure2 = createMeasure();
      let measure3 = createMeasure();

      measure1 = setTempo(measure1, 60);
      measure2 = setTempo(measure2, 180);
      measure3 = setTempo(measure3, 200);

      expect(measure1.tempo).toBe(60);
      expect(measure2.tempo).toBe(180);
      expect(measure3.tempo).toBe(200);
    });

    it('should not mutate the original measure', () => {
      const originalMeasure = createMeasure();
      const newMeasure = setTempo(originalMeasure, 140);

      expect(originalMeasure.tempo).toBeUndefined();
      expect(newMeasure.tempo).toBe(140);
    });
  });

  describe('Measure properties', () => {
    it('should support key signatures', () => {
      const measure = createMeasure();
      measure.keySignature = { value: 2, minor: false }; // D major

      expect(measure.keySignature.value).toBe(2);
      expect(measure.keySignature.minor).toBe(false);
    });

    it('should support markers', () => {
      const measure = createMeasure();
      measure.marker = 'Verse';

      expect(measure.marker).toBe('Verse');
    });

    it('should support repeat markers', () => {
      const measure = createMeasure();
      measure.repeatOpen = true;
      measure.repeatClose = 2;

      expect(measure.repeatOpen).toBe(true);
      expect(measure.repeatClose).toBe(2);
    });
  });
});
