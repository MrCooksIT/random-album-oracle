export const normalizeGenre = (genre) => {
    if (!genre || genre === 'Unknown') return 'Unknown';

    const genreLower = genre.toLowerCase().trim();

    const genreMap = {
        'hip-hop': 'Hip-Hop',
        'hip hop': 'Hip-Hop',
        'rap': 'Hip-Hop',
        // Add more mappings
    };

    return genreMap[genreLower] || genre;
};