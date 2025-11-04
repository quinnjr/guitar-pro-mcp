import { promises as fs } from 'fs';
import { homedir, platform } from 'os';
import { join } from 'path';
import { createSong, addTrackToSong, setTempo as setSongTempo } from '../models/Song.js';
import { createTrack, addMeasureToTrack, setTuning } from '../models/Track.js';
import { createMeasure, addBeatToMeasure, setTimeSignature } from '../models/Measure.js';
import { createBeat, addNoteToBeat, Duration } from '../models/Beat.js';
import { createNote } from '../models/Note.js';
import { writeGP6File } from '../writers/GP6Writer.js';

/**
 * Get the default output directory for Guitar Pro files
 * @returns The platform-appropriate Music directory path
 *
 * Platform-specific paths:
 * - Windows: %USERPROFILE%\Music (e.g., C:\Users\username\Music)
 * - macOS: ~/Music (e.g., /Users/username/Music)
 * - Linux: $XDG_MUSIC_DIR or ~/Music (e.g., /home/username/Music)
 */
export function getDefaultOutputDirectory(): string {
  const home = homedir();
  const currentPlatform = platform();

  // Linux: Check XDG_MUSIC_DIR environment variable first
  if (currentPlatform === 'linux') {
    const xdgMusicDir = process.env.XDG_MUSIC_DIR;
    if (xdgMusicDir) {
      return xdgMusicDir;
    }
  }

  // Windows, macOS, and Linux fallback: use ~/Music
  // Windows: C:\Users\<username>\Music
  // macOS: /Users/<username>/Music
  // Linux: /home/<username>/Music
  return join(home, 'Music');
}

export interface CreateGuitarProFileArgs {
  filename: string;
  outputDirectory?: string;
  title: string;
  artist?: string;
  tempo?: number;
  tracks: Array<{
    name: string;
    strings?: number;
    tuning?: number[];
    measures: Array<{
      timeSignature?: { numerator: number; denominator: number };
      beats?: Array<{
        duration?: number;
        dotted?: boolean;
        rest?: boolean;
        notes?: Array<{
          string: number;
          fret: number;
          velocity?: number;
        }>;
      }>;
    }>;
  }>;
}

/**
 * Create a Guitar Pro file with full control over tracks, measures, and notes
 */
export async function createGuitarProFile(
  args: CreateGuitarProFileArgs
): Promise<{ filepath: string; song: any }> {
  const { filename, outputDirectory, title, artist, tempo = 120, tracks: tracksData } = args;

  // Determine output directory
  const dir = outputDirectory || getDefaultOutputDirectory();

  // Ensure filename has .gp6 extension
  const finalFilename = filename.endsWith('.gp6') ? filename : `${filename}.gp6`;
  const filepath = join(dir, finalFilename);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Create song
  let song = createSong(title, artist);
  song = setSongTempo(song, tempo);

  // Add tracks
  for (const trackData of tracksData) {
    let track = createTrack(trackData.name, trackData.strings || 6);

    // Set custom tuning if provided
    if (trackData.tuning && Array.isArray(trackData.tuning)) {
      track = setTuning(track, trackData.tuning);
    }

    // Add measures
    for (const measureData of trackData.measures) {
      let measure = createMeasure();

      // Set time signature if provided
      if (measureData.timeSignature) {
        measure = setTimeSignature(
          measure,
          measureData.timeSignature.numerator,
          measureData.timeSignature.denominator
        );
      }

      // Add beats
      if (measureData.beats && Array.isArray(measureData.beats)) {
        for (const beatData of measureData.beats) {
          let beat = createBeat(beatData.duration || Duration.QUARTER);

          if (beatData.dotted) {
            beat.dotted = true;
          }

          if (beatData.rest) {
            beat.rest = true;
          }

          // Add notes
          if (beatData.notes && Array.isArray(beatData.notes)) {
            for (const noteData of beatData.notes) {
              const note = createNote(noteData.fret, noteData.string, noteData.velocity || 95);
              beat = addNoteToBeat(beat, note);
            }
          }

          measure = addBeatToMeasure(measure, beat);
        }
      }

      track = addMeasureToTrack(track, measure);
    }

    song = addTrackToSong(song, track);
  }

  // Write file
  const buffer = writeGP6File(song);
  await fs.writeFile(filepath, buffer);

  return { filepath, song };
}

export interface CreateSimpleGuitarProFileArgs {
  filename: string;
  outputDirectory?: string;
  title: string;
  artist?: string;
  tempo?: number;
  tablature: string[];
}

/**
 * Create a simple Guitar Pro file with basic tablature notation
 */
export async function createSimpleGuitarProFile(
  args: CreateSimpleGuitarProFileArgs
): Promise<{ filepath: string; song: any }> {
  const { filename, outputDirectory, title, artist, tempo = 120, tablature } = args;

  // Determine output directory
  const dir = outputDirectory || getDefaultOutputDirectory();

  // Ensure filename has .gp6 extension
  const finalFilename = filename.endsWith('.gp6') ? filename : `${filename}.gp6`;
  const filepath = join(dir, finalFilename);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Create song
  let song = createSong(title, artist);
  song = setSongTempo(song, tempo);

  // Create a single track
  let track = createTrack('Guitar', 6);

  // Parse tablature
  for (const tabString of tablature) {
    let measure = createMeasure();

    // Parse frets (e.g., "0-2-2")
    const frets = tabString.split('-').map((f: string) => parseInt(f, 10));

    for (const fret of frets) {
      let beat = createBeat(Duration.QUARTER);
      const note = createNote(fret, 1, 95); // String 1
      beat = addNoteToBeat(beat, note);
      measure = addBeatToMeasure(measure, beat);
    }

    track = addMeasureToTrack(track, measure);
  }

  song = addTrackToSong(song, track);

  // Write file
  const buffer = writeGP6File(song);
  await fs.writeFile(filepath, buffer);

  return { filepath, song };
}
