// src/components/AlbumPickerContainer.jsx
import { useState } from 'react';
import { useAlbums } from '../hooks/useAlbums';
import { RandomPicker } from './RandomPicker';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';

export default function AlbumPickerContainer({ userId }) {
    const { albums, loading, error, updateAlbumStats } = useAlbums(userId);
    const [selectedAlbum, setSelectedAlbum] = useState(null);

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    const handlePickRandom = () => {
        if (albums.length > 0) {
            const randomIndex = Math.floor(Math.random() * albums.length);
            setSelectedAlbum(albums[randomIndex]);
        }
    };

    const handleListen = async (album) => {
        await updateAlbumStats(album.id, 'listens');
        setSelectedAlbum(null);
    };

    const handleSkip = async (album) => {
        await updateAlbumStats(album.id, 'skips');
        setSelectedAlbum(null);
    };

    return (
        <RandomPicker
            filteredAlbums={albums}
            selectedAlbum={selectedAlbum}
            onPick={handlePickRandom}
            onListen={handleListen}
            onSkip={handleSkip}
        />
    );
}