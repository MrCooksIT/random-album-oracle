// src/App.jsx
import { useState } from 'react';
import { FilterSection } from './components/FilterSection';
import { RandomPicker } from './components/RandomPicker';
import { Library } from './components/Library';
import { UploadSection } from './components/UploadSection';
import { useFirestore } from './hooks/useFirestore';
import { useFilters } from './hooks/useFilters';

function App() {
  const [yearFilter, setYearFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [showLibrary, setShowLibrary] = useState(true);

  const { albums, loading } = useFirestore();
  const filteredAlbums = useFilters(albums, yearFilter, genreFilter);

  return (
    <div className="min-h-screen bg-black p-4">
      {/* Your app layout */}
    </div>
  );
}

export default App;