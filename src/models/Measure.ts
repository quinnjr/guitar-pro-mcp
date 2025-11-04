import type { Beat } from './Beat.js';

/**
 * Time signature for a measure
 */
export interface TimeSignature {
  numerator: number;
  denominator: number;
}

/**
 * Key signature for a measure
 */
export interface KeySignature {
  value: number; // -7 to 7 (flats to sharps)
  minor: boolean;
}

/**
 * Represents a measure in a track
 */
export interface Measure {
  beats: Beat[];
  timeSignature?: TimeSignature;
  keySignature?: KeySignature;
  tempo?: number;
  marker?: string;
  repeatOpen?: boolean;
  repeatClose?: number; // repeat count
}

export function createMeasure(): Measure {
  return {
    beats: [],
  };
}

export function addBeatToMeasure(measure: Measure, beat: Beat): Measure {
  return {
    ...measure,
    beats: [...measure.beats, beat],
  };
}

export function setTimeSignature(
  measure: Measure,
  numerator: number,
  denominator: number
): Measure {
  return {
    ...measure,
    timeSignature: { numerator, denominator },
  };
}

export function setTempo(measure: Measure, tempo: number): Measure {
  return {
    ...measure,
    tempo,
  };
}
