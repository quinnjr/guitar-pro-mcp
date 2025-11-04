/**
 * Represents a musical note in Guitar Pro
 */
export interface Note {
  fret: number;
  string: number;
  velocity: number;
  ghost?: boolean;
  accentuated?: boolean;
  heavyAccentuated?: boolean;
  palmMute?: boolean;
  vibrato?: boolean;
  harmonic?: boolean;
  trill?: boolean;
  slide?: boolean;
}

export function createNote(fret: number, string: number, velocity: number = 95): Note {
  return {
    fret,
    string,
    velocity,
    ghost: false,
    accentuated: false,
    heavyAccentuated: false,
    palmMute: false,
    vibrato: false,
    harmonic: false,
    trill: false,
    slide: false,
  };
}
