// src/utils/genres.js
export const GENRE_VIBES = {
  'Hip-Hop': [
    'hip-hop', 'rap', 'hip-hop/rap', 'alternative rap', 'underground rap',
    'east coast rap', 'old school rap', 'uk hip-hop', 'gangsta rap', 'dirty south', "[Hip-Hop/Rap/Electronic]"
  ],

  'Alternative/Indie': [
    'alternative', 'indie rock', 'indie pop', 'indie / alternative',
    'prog-rock/art rock', 'psychedelic', 'britpop', 'christian',
  ],

  'Electronic': [
    'electronic', 'electronica', 'idm/experimental', 'ambient', 'dance',
    'house', 'techno', 'downtempo', 'dubstep', 'trance', 'breakbeat',
    'jungle/drum\'n\'bass'
  ],

  'R&B/Soul': [
    'r&b/soul', 'soul', 'neo-soul', 'contemporary r&b', 'motown', 'funk'
  ],

  'Rock': [
    'rock', 'hard rock', 'punk', 'metal', 'death metal/black metal',
    'hardcore', 'soft rock', 'pop/rock', 'rock & roll', 'glam rock'
  ],


  'Afro': [
    'afrobeats', 'afro-pop', 'african', 'afro-beat', 'afro-fusion',
    'amapiano', 'afro-folk', 'afro house', 'afro soul', 'highlife', 'alte'
  ],

  'Jazz': [
    'jazz', 'contemporary jazz', 'avant-garde jazz', 'crossover jazz',
    'smooth jazz', 'vocal jazz', 'latin jazz', 'fusion', 'trad jazz'
  ],

  'Singer/Songwriter': [
    'singer/songwriter', 'contemporary singer/songwriter', 'folk',
    'alternative folk', 'traditional folk', 'contemporary folk',
    'americana', 'folk-rock', "vocal"
  ],

  'World': [
    'worldwide', 'latin', 'k-pop', 'j-pop', 'mpb', 'brazilian',
    'caribbean', 'arabic', 'indian', 'calypso', 'samba', 'bossa nova'
  ],

  'Classical': [
    'classical', 'classical crossover', 'modern era',
    'instrumental', 'new age', 'original score'
  ],
  'Soundtrack': [
    'soundtrack', 'tv soundtrack', 'movie soundtrack', 'musical',
    'video game', 'anime', 'disney', 'broadway', 'show tunes'
  ],
  'Spoken word': ['spoken word'

  ], 
  "Pop": ['pop']
};

// Skip podcast, soundtrack, comedy, spoken word, and holiday genres
export const SKIP_GENRES = new Set([
  'podcast', 'comedy', 'holiday',
  'christmas', 'tv soundtrack', 'children\'s music'
]);

export const normalizeGenreVibe = (genre) => {
  if (!genre || SKIP_GENRES.has(genre.toLowerCase())) return 'Other';

  const lowerGenre = genre.toLowerCase().trim();

  for (const [vibe, genres] of Object.entries(GENRE_VIBES)) {
    if (genres.some(g => lowerGenre.includes(g))) {
      return vibe;
    }
  }

  return 'Other';
};

export const ALL_VIBES = ['All Genres', ...Object.keys(GENRE_VIBES), 'Other'];