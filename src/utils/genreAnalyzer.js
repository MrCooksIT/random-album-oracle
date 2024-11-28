// src/utils/genreAnalyzer.js
const analyzeGenres = (xmlContent) => {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlContent, "text/xml");
  const tracks = xml.getElementsByTagName("dict")[0].getElementsByTagName("dict");

  const genreCounts = new Map();
  const genreArtists = new Map();

  for (let track of tracks) {
    let genre = "";
    let artist = "";
    const keys = track.getElementsByTagName("key");

    for (let i = 0; i < keys.length; i++) {
      if (keys[i].textContent === "Genre") {
        genre = keys[i].nextElementSibling.textContent.toLowerCase();
      }
      if (keys[i].textContent === "Artist") {
        artist = keys[i].nextElementSibling.textContent;
      }
    }

    if (genre) {
      genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      if (!genreArtists.has(genre)) {
        genreArtists.set(genre, new Set());
      }
      genreArtists.get(genre).add(artist);
    }
  }

  return {
    genreCounts: Object.fromEntries([...genreCounts].sort((a, b) => b[1] - a[1])),
    genreArtists: Object.fromEntries([...genreArtists].map(([genre, artists]) =>
      [genre, Array.from(artists)]
    ))
  };
};

export { analyzeGenres };