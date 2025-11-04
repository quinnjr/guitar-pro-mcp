import { BinaryWriter } from '../utils/BinaryWriter.js';
import type { Song } from '../models/Song.js';
import type { Track } from '../models/Track.js';
import type { Measure } from '../models/Measure.js';
import type { Beat } from '../models/Beat.js';
import { Duration } from '../models/Beat.js';
import type { Note } from '../models/Note.js';

/**
 * Guitar Pro 6 file writer
 */
export class GP6Writer {
  private writer: BinaryWriter;

  constructor() {
    this.writer = new BinaryWriter();
  }

  /**
   * Write a complete Guitar Pro 6 file
   */
  write(song: Song): Buffer {
    this.writeHeader();
    this.writeSongInfo(song);
    this.writeTracks(song);
    this.writeMeasures(song);

    return this.writer.toBuffer();
  }

  /**
   * Write the GP6 file header
   */
  private writeHeader(): void {
    // GP6 magic number/identifier
    this.writer.writeFixedString('FICHIER GUITAR PRO v6', 31);
    this.writer.writeInt(6); // Version
  }

  /**
   * Write song information
   */
  private writeSongInfo(song: Song): void {
    this.writer.writeString(song.info.title);
    this.writer.writeString(song.info.subtitle || '');
    this.writer.writeString(song.info.artist || '');
    this.writer.writeString(song.info.album || '');
    this.writer.writeString(song.info.author || '');
    this.writer.writeString(song.info.copyright || '');
    this.writer.writeString(song.info.writer || '');
    this.writer.writeString(song.info.instructions || '');

    // Comments
    const comments = song.info.comments || [];
    this.writer.writeInt(comments.length);
    for (const comment of comments) {
      this.writer.writeString(comment);
    }
  }

  /**
   * Write track information
   */
  private writeTracks(song: Song): void {
    this.writer.writeInt(song.tracks.length);

    for (const track of song.tracks) {
      this.writeTrack(track);
    }
  }

  /**
   * Write a single track
   */
  private writeTrack(track: Track): void {
    // Track flags
    this.writer.writeByte(0); // Flags

    // Track name
    this.writer.writeString(track.name);

    // String count and tuning
    this.writer.writeInt(track.tuning.strings.length);
    for (const tuning of track.tuning.strings) {
      this.writer.writeInt(tuning);
    }

    // MIDI settings
    this.writer.writeInt(track.midiChannel.channel);
    this.writer.writeInt(track.midiChannel.effectChannel);
    this.writer.writeInt(track.midiChannel.instrument);

    // Volume and balance
    this.writer.writeInt(track.volume);
    this.writer.writeInt(track.balance);

    // Effects
    this.writer.writeInt(track.chorus);
    this.writer.writeInt(track.reverb);
    this.writer.writeInt(track.phaser);
    this.writer.writeInt(track.tremolo);

    // Color
    this.writer.writeColor(track.color.r, track.color.g, track.color.b);

    // Fret count and capo
    this.writer.writeInt(track.fretCount);
    this.writer.writeInt(track.offset);
  }

  /**
   * Write measure data for all tracks
   */
  private writeMeasures(song: Song): void {
    this.writer.writeInt(song.measureCount);

    // Write measures for each track
    for (const track of song.tracks) {
      this.writeTrackMeasures(track, song.measureCount);
    }
  }

  /**
   * Write measures for a single track
   */
  private writeTrackMeasures(track: Track, measureCount: number): void {
    for (let i = 0; i < measureCount; i++) {
      const measure = track.measures[i] || { beats: [] };
      this.writeMeasure(measure);
    }
  }

  /**
   * Write a single measure
   */
  private writeMeasure(measure: Measure): void {
    // Measure header flags
    let flags = 0;
    if (measure.timeSignature) {
      flags |= 0x01;
    }
    if (measure.keySignature) {
      flags |= 0x02;
    }
    if (measure.marker) {
      flags |= 0x04;
    }
    if (measure.repeatOpen) {
      flags |= 0x08;
    }
    if (measure.repeatClose) {
      flags |= 0x10;
    }
    if (measure.tempo) {
      flags |= 0x20;
    }

    this.writer.writeByte(flags);

    // Time signature
    if (measure.timeSignature) {
      this.writer.writeByte(measure.timeSignature.numerator);
      this.writer.writeByte(measure.timeSignature.denominator);
    }

    // Key signature
    if (measure.keySignature) {
      this.writer.writeSignedByte(measure.keySignature.value);
      this.writer.writeBoolean(measure.keySignature.minor);
    }

    // Marker
    if (measure.marker) {
      this.writer.writeString(measure.marker);
    }

    // Repeat close
    if (measure.repeatClose) {
      this.writer.writeByte(measure.repeatClose);
    }

    // Tempo
    if (measure.tempo) {
      this.writer.writeInt(measure.tempo);
    }

    // Beats
    this.writer.writeInt(measure.beats.length);
    for (const beat of measure.beats) {
      this.writeBeat(beat);
    }
  }

  /**
   * Write a single beat
   */
  private writeBeat(beat: Beat): void {
    // Beat flags
    let flags = 0;
    if (beat.dotted) {
      flags |= 0x01;
    }
    if (beat.rest) {
      flags |= 0x02;
    }
    if (beat.text) {
      flags |= 0x04;
    }

    this.writer.writeByte(flags);

    // Duration
    this.writer.writeByte(this.durationToValue(beat.duration));

    // Tuplet
    this.writer.writeInt(beat.tuplet);

    // Text
    if (beat.text) {
      this.writer.writeString(beat.text);
    }

    // Notes
    this.writer.writeInt(beat.notes.length);
    for (const note of beat.notes) {
      this.writeNote(note);
    }
  }

  /**
   * Write a single note
   */
  private writeNote(note: Note): void {
    // Note flags
    let flags = 0;
    if (note.ghost) {
      flags |= 0x01;
    }
    if (note.accentuated) {
      flags |= 0x02;
    }
    if (note.heavyAccentuated) {
      flags |= 0x04;
    }
    if (note.palmMute) {
      flags |= 0x08;
    }
    if (note.vibrato) {
      flags |= 0x10;
    }
    if (note.harmonic) {
      flags |= 0x20;
    }
    if (note.trill) {
      flags |= 0x40;
    }
    if (note.slide) {
      flags |= 0x80;
    }

    this.writer.writeByte(flags);

    // String and fret
    this.writer.writeByte(note.string);
    this.writer.writeByte(note.fret);

    // Velocity
    this.writer.writeByte(note.velocity);
  }

  /**
   * Convert duration enum to byte value
   */
  private durationToValue(duration: Duration): number {
    switch (duration) {
      case Duration.WHOLE:
        return 1;
      case Duration.HALF:
        return 2;
      case Duration.QUARTER:
        return 4;
      case Duration.EIGHTH:
        return 8;
      case Duration.SIXTEENTH:
        return 16;
      case Duration.THIRTY_SECOND:
        return 32;
      default:
        return 4;
    }
  }
}

/**
 * Convenience function to write a song to a buffer
 */
export function writeGP6File(song: Song): Buffer {
  const writer = new GP6Writer();
  return writer.write(song);
}
