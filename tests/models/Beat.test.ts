import { describe, it, expect } from 'vitest';
import { createBeat, addNoteToBeat, Duration } from '../../src/models/Beat';
import { createNote } from '../../src/models/Note';

describe('Beat', () => {
  describe('createBeat', () => {
    it('should create a beat with default quarter note duration', () => {
      const beat = createBeat();

      expect(beat.duration).toBe(Duration.QUARTER);
      expect(beat.notes).toEqual([]);
      expect(beat.dotted).toBe(false);
      expect(beat.tuplet).toBe(1);
      expect(beat.rest).toBe(false);
    });

    it('should create a beat with custom duration', () => {
      const beat = createBeat(Duration.EIGHTH);

      expect(beat.duration).toBe(Duration.EIGHTH);
    });

    it('should support all duration values', () => {
      expect(createBeat(Duration.WHOLE).duration).toBe(Duration.WHOLE);
      expect(createBeat(Duration.HALF).duration).toBe(Duration.HALF);
      expect(createBeat(Duration.QUARTER).duration).toBe(Duration.QUARTER);
      expect(createBeat(Duration.EIGHTH).duration).toBe(Duration.EIGHTH);
      expect(createBeat(Duration.SIXTEENTH).duration).toBe(Duration.SIXTEENTH);
      expect(createBeat(Duration.THIRTY_SECOND).duration).toBe(Duration.THIRTY_SECOND);
    });
  });

  describe('addNoteToBeat', () => {
    it('should add a note to a beat', () => {
      let beat = createBeat();
      const note = createNote(5, 1);

      beat = addNoteToBeat(beat, note);

      expect(beat.notes.length).toBe(1);
      expect(beat.notes[0]).toEqual(note);
    });

    it('should add multiple notes to a beat', () => {
      let beat = createBeat();
      const note1 = createNote(5, 1);
      const note2 = createNote(7, 2);
      const note3 = createNote(9, 3);

      beat = addNoteToBeat(beat, note1);
      beat = addNoteToBeat(beat, note2);
      beat = addNoteToBeat(beat, note3);

      expect(beat.notes.length).toBe(3);
      expect(beat.notes[0]).toEqual(note1);
      expect(beat.notes[1]).toEqual(note2);
      expect(beat.notes[2]).toEqual(note3);
    });

    it('should set rest to false when adding notes', () => {
      let beat = createBeat();
      beat.rest = true;

      const note = createNote(5, 1);
      beat = addNoteToBeat(beat, note);

      expect(beat.rest).toBe(false);
    });

    it('should preserve other beat properties when adding notes', () => {
      let beat = createBeat(Duration.EIGHTH);
      beat.dotted = true;
      beat.tuplet = 3;

      const note = createNote(5, 1);
      beat = addNoteToBeat(beat, note);

      expect(beat.duration).toBe(Duration.EIGHTH);
      expect(beat.dotted).toBe(true);
      expect(beat.tuplet).toBe(3);
    });

    it('should not mutate the original beat', () => {
      const originalBeat = createBeat();
      const note = createNote(5, 1);

      const newBeat = addNoteToBeat(originalBeat, note);

      expect(originalBeat.notes.length).toBe(0);
      expect(newBeat.notes.length).toBe(1);
    });
  });

  describe('Beat properties', () => {
    it('should allow dotted notes', () => {
      const beat = createBeat(Duration.QUARTER);
      beat.dotted = true;

      expect(beat.dotted).toBe(true);
    });

    it('should allow rest beats', () => {
      const beat = createBeat(Duration.QUARTER);
      beat.rest = true;

      expect(beat.rest).toBe(true);
    });

    it('should support triplets', () => {
      const beat = createBeat(Duration.EIGHTH);
      beat.tuplet = 3;

      expect(beat.tuplet).toBe(3);
    });

    it('should support text annotation', () => {
      const beat = createBeat();
      beat.text = 'Pick scrape';

      expect(beat.text).toBe('Pick scrape');
    });
  });
});
