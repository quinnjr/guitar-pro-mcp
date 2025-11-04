import type { Track } from './Track.js';

/**
 * Song metadata
 */
export interface SongInfo {
  title: string;
  subtitle?: string;
  artist?: string;
  album?: string;
  author?: string; // tab author
  copyright?: string;
  writer?: string; // music writer
  instructions?: string;
  comments?: string[];
}

/**
 * Represents a complete Guitar Pro song
 */
export interface Song {
  info: SongInfo;
  tracks: Track[];
  tempo: number;
  key: number; // -7 to 7
  measureCount: number;
}

export function createSong(title: string, artist?: string): Song {
  return {
    info: {
      title,
      artist: artist || '',
      subtitle: '',
      album: '',
      author: '',
      copyright: '',
      writer: '',
      instructions: '',
      comments: [],
    },
    tracks: [],
    tempo: 120,
    key: 0,
    measureCount: 0,
  };
}

export function addTrackToSong(song: Song, track: Track): Song {
  return {
    ...song,
    tracks: [...song.tracks, track],
    measureCount: Math.max(song.measureCount, track.measures.length),
  };
}

export function setTempo(song: Song, tempo: number): Song {
  return {
    ...song,
    tempo,
  };
}
