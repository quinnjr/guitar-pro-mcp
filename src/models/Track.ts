import type { Measure } from './Measure.js';

/**
 * MIDI channel configuration
 */
export interface MidiChannel {
  channel: number; // 0-15
  effectChannel: number; // 0-15
  instrument: number; // 0-127 (General MIDI instrument)
}

/**
 * String tuning for the track
 */
export interface Tuning {
  strings: number[]; // MIDI note values for each string
}

/**
 * Represents a track (instrument part) in the song
 */
export interface Track {
  name: string;
  measures: Measure[];
  tuning: Tuning;
  midiChannel: MidiChannel;
  color: { r: number; g: number; b: number };
  fretCount: number;
  offset: number; // capo position
  volume: number; // 0-16
  balance: number; // -64 to 63
  chorus: number; // 0-16
  reverb: number; // 0-16
  phaser: number; // 0-16
  tremolo: number; // 0-16
}

export function createTrack(name: string, stringCount: number = 6): Track {
  // Standard guitar tuning (E A D G B E)
  const standardTuning = [64, 59, 55, 50, 45, 40];

  return {
    name,
    measures: [],
    tuning: {
      strings: standardTuning.slice(0, stringCount),
    },
    midiChannel: {
      channel: 0,
      effectChannel: 1,
      instrument: 25, // Acoustic Guitar (steel)
    },
    color: { r: 255, g: 0, b: 0 },
    fretCount: 24,
    offset: 0,
    volume: 13,
    balance: 0,
    chorus: 0,
    reverb: 0,
    phaser: 0,
    tremolo: 0,
  };
}

export function addMeasureToTrack(track: Track, measure: Measure): Track {
  return {
    ...track,
    measures: [...track.measures, measure],
  };
}

export function setTuning(track: Track, tuning: number[]): Track {
  return {
    ...track,
    tuning: { strings: tuning },
  };
}
