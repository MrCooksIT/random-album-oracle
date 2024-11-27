// src/hooks/useFilters.js
import { useMemo } from 'react';
import { normalizeYear, normalizeGenre } from '../utils/normalizers'; 

export const useFilters = (albums, yearFilter, genreFilter) => {
    return useMemo(() => {
        return albums.filter(album => {
            const normalizedYear = normalizeYear(album.year);
            const normalizedGenre = normalizeGenre(album.genre);

            const matchesYear = !yearFilter || normalizedYear === yearFilter;
            const matchesGenre = !genreFilter || normalizedGenre === genreFilter;

            return matchesYear && matchesGenre;
        });
    }, [albums, yearFilter, genreFilter]);
};