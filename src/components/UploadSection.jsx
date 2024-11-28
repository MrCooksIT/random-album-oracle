const handleAnalyze = async (event) => {
    const file = event.target.files[0];
    const text = await file.text();
    const analysis = analyzeGenres(text);
    console.table(analysis.genreCounts);
    console.log('Genre details:', analysis.genreArtists);
};