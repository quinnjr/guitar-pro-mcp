import type { Note } from './Note.js';

/**
 * Duration values for notes
 */
export enum Duration {
  WHOLE = 1,
  HALF = 2,
  QUARTER = 4,
  EIGHTH = 8,
  SIXTEENTH = 16,
  THIRTY_SECOND = 32,
}

/**
 * Represents a beat (a column of notes at a specific time)
 */
export interface Beat {
  notes: Note[];
  duration: Duration;
  dotted: boolean;
  tuplet: number; // 1 for normal, 3 for triplet, etc.
  rest: boolean;
  text?: string;
}

export function createBeat(duration: Duration = Duration.QUARTER): Beat {
  return {
    notes: [],
    duration,
    dotted: false,
    tuplet: 1,
    rest: false,
  };
}

export function addNoteToBeat(beat: Beat, note: Note): Beat {
  return {
    ...beat,
    notes: [...beat.notes, note],
    rest: false,
  };
}
