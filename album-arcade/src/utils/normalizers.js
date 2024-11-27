
export const normalizeYear = (year) => {
    if (!year || year === 'Unknown') return 'Unknown';
    const numYear = parseInt(year);
    if (isNaN(numYear)) return 'Unknown';
    if (numYear < 1970) return 'Pre-70s';
    if (numYear < 1980) return "70's";
    if (numYear < 1990) return "80's";
    if (numYear < 2000) return "90's";
    return year.toString(); // Keep actual year for 2000+
};

export const normalizeGenre = (genre) => {
    if (!genre || genre === 'Unknown') return 'Unknown';
    const genreLower = genre.toLowerCase().trim();

    // Main genre groupings
    const genreMap = {
        // Hip-Hop family
        'hip-hop': 'Hip-Hop',
        'hip hop': 'Hip-Hop',
        'rap': 'Hip-Hop',
        'alternative rap': 'Hip-Hop',
        'underground rap': 'Hip-Hop',

        // Rock family
        'rock': 'Rock',
        'alternative rock': 'Rock',
        'indie rock': 'Rock',
        'hard rock': 'Rock',
        'prog rock': 'Rock',

        // Electronic family
        'electronic': 'Electronic',
        'edm': 'Electronic',
        'house': 'Electronic',
        'techno': 'Electronic',

        // Add more mappings
    };

    return genreMap[genreLower] || genre;
};