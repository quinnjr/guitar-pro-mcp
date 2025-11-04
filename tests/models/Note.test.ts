import { describe, it, expect } from 'vitest';
import type { Note } from '../../src/models/Note';
import { createNote } from '../../src/models/Note';

describe('Note', () => {
  describe('createNote', () => {
    it('should create a basic note with default velocity', () => {
      const note = createNote(5, 1);

      expect(note.fret).toBe(5);
      expect(note.string).toBe(1);
      expect(note.velocity).toBe(95);
      expect(note.ghost).toBe(false);
      expect(note.accentuated).toBe(false);
    });

    it('should create a note with custom velocity', () => {
      const note = createNote(7, 2, 110);

      expect(note.fret).toBe(7);
      expect(note.string).toBe(2);
      expect(note.velocity).toBe(110);
    });

    it('should create a note with fret 0 (open string)', () => {
      const note = createNote(0, 6);

      expect(note.fret).toBe(0);
      expect(note.string).toBe(6);
    });

    it('should initialize all effect flags to false', () => {
      const note = createNote(3, 3);

      expect(note.ghost).toBe(false);
      expect(note.accentuated).toBe(false);
      expect(note.heavyAccentuated).toBe(false);
      expect(note.palmMute).toBe(false);
      expect(note.vibrato).toBe(false);
      expect(note.harmonic).toBe(false);
      expect(note.trill).toBe(false);
      expect(note.slide).toBe(false);
    });

    it('should allow manual modification of effect flags', () => {
      const note: Note = {
        ...createNote(12, 1),
        palmMute: true,
        vibrato: true,
        harmonic: true,
      };

      expect(note.palmMute).toBe(true);
      expect(note.vibrato).toBe(true);
      expect(note.harmonic).toBe(true);
      expect(note.ghost).toBe(false);
    });

    it('should handle high fret numbers', () => {
      const note = createNote(24, 1);

      expect(note.fret).toBe(24);
    });

    it('should handle all string positions', () => {
      for (let string = 1; string <= 6; string++) {
        const note = createNote(5, string);
        expect(note.string).toBe(string);
      }
    });

    it('should handle velocity range', () => {
      const quietNote = createNote(5, 1, 40);
      const loudNote = createNote(5, 1, 127);

      expect(quietNote.velocity).toBe(40);
      expect(loudNote.velocity).toBe(127);
    });
  });
});
