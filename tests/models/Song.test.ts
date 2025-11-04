import { describe, it, expect } from 'vitest';
import { createSong, addTrackToSong, setTempo } from '../../src/models/Song';
import { createTrack, addMeasureToTrack } from '../../src/models/Track';
import { createMeasure } from '../../src/models/Measure';

describe('Song', () => {
  describe('createSong', () => {
    it('should create a song with title only', () => {
      const song = createSong('My Song');

      expect(song.info.title).toBe('My Song');
      expect(song.info.artist).toBe('');
      expect(song.tracks).toEqual([]);
      expect(song.tempo).toBe(120);
    });

    it('should create a song with title and artist', () => {
      const song = createSong('My Song', 'Artist Name');

      expect(song.info.title).toBe('My Song');
      expect(song.info.artist).toBe('Artist Name');
    });

    it('should initialize with default tempo', () => {
      const song = createSong('Song');

      expect(song.tempo).toBe(120);
    });

    it('should initialize with key of C', () => {
      const song = createSong('Song');

      expect(song.key).toBe(0);
    });

    it('should initialize with zero measures', () => {
      const song = createSong('Song');

      expect(song.measureCount).toBe(0);
    });

    it('should initialize all info fields', () => {
      const song = createSong('Song');

      expect(song.info.subtitle).toBe('');
      expect(song.info.album).toBe('');
      expect(song.info.author).toBe('');
      expect(song.info.copyright).toBe('');
      expect(song.info.writer).toBe('');
      expect(song.info.instructions).toBe('');
      expect(song.info.comments).toEqual([]);
    });
  });

  describe('addTrackToSong', () => {
    it('should add a track to a song', () => {
      let song = createSong('Song');
      const track = createTrack('Guitar');

      song = addTrackToSong(song, track);

      expect(song.tracks.length).toBe(1);
      expect(song.tracks[0]).toEqual(track);
    });

    it('should add multiple tracks to a song', () => {
      let song = createSong('Song');
      const guitar = createTrack('Guitar');
      const bass = createTrack('Bass');
      const drums = createTrack('Drums');

      song = addTrackToSong(song, guitar);
      song = addTrackToSong(song, bass);
      song = addTrackToSong(song, drums);

      expect(song.tracks.length).toBe(3);
      expect(song.tracks[0].name).toBe('Guitar');
      expect(song.tracks[1].name).toBe('Bass');
      expect(song.tracks[2].name).toBe('Drums');
    });

    it('should update measure count when adding tracks', () => {
      let song = createSong('Song');
      let track = createTrack('Guitar');

      // Add 3 measures to track
      track = addMeasureToTrack(track, createMeasure());
      track = addMeasureToTrack(track, createMeasure());
      track = addMeasureToTrack(track, createMeasure());

      song = addTrackToSong(song, track);

      expect(song.measureCount).toBe(3);
    });

    it('should update measure count to max of all tracks', () => {
      let song = createSong('Song');
      let track1 = createTrack('Guitar');
      let track2 = createTrack('Bass');

      // Track 1 has 2 measures
      track1 = addMeasureToTrack(track1, createMeasure());
      track1 = addMeasureToTrack(track1, createMeasure());

      // Track 2 has 4 measures
      track2 = addMeasureToTrack(track2, createMeasure());
      track2 = addMeasureToTrack(track2, createMeasure());
      track2 = addMeasureToTrack(track2, createMeasure());
      track2 = addMeasureToTrack(track2, createMeasure());

      song = addTrackToSong(song, track1);
      song = addTrackToSong(song, track2);

      expect(song.measureCount).toBe(4);
    });

    it('should not mutate the original song', () => {
      const originalSong = createSong('Song');
      const track = createTrack('Guitar');

      const newSong = addTrackToSong(originalSong, track);

      expect(originalSong.tracks.length).toBe(0);
      expect(newSong.tracks.length).toBe(1);
    });
  });

  describe('setTempo', () => {
    it('should set tempo', () => {
      let song = createSong('Song');
      song = setTempo(song, 140);

      expect(song.tempo).toBe(140);
    });

    it('should support various tempo values', () => {
      let slowSong = createSong('Slow');
      let fastSong = createSong('Fast');

      slowSong = setTempo(slowSong, 60);
      fastSong = setTempo(fastSong, 200);

      expect(slowSong.tempo).toBe(60);
      expect(fastSong.tempo).toBe(200);
    });

    it('should not mutate the original song', () => {
      const originalSong = createSong('Song');
      const newSong = setTempo(originalSong, 160);

      expect(originalSong.tempo).toBe(120);
      expect(newSong.tempo).toBe(160);
    });
  });

  describe('Song info', () => {
    it('should allow setting all metadata fields', () => {
      const song = createSong('Song');
      song.info.subtitle = 'A Great Tune';
      song.info.album = 'Greatest Hits';
      song.info.author = 'Tab Author';
      song.info.copyright = '2025';
      song.info.writer = 'Music Writer';
      song.info.instructions = 'Play with feeling';
      song.info.comments = ['Comment 1', 'Comment 2'];

      expect(song.info.subtitle).toBe('A Great Tune');
      expect(song.info.album).toBe('Greatest Hits');
      expect(song.info.author).toBe('Tab Author');
      expect(song.info.copyright).toBe('2025');
      expect(song.info.writer).toBe('Music Writer');
      expect(song.info.instructions).toBe('Play with feeling');
      expect(song.info.comments.length).toBe(2);
    });
  });
});
