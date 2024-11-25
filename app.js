// Create the React component first
const MusicLibrary = () => {
  const [albums, setAlbums] = React.useState(() => {
    const saved = localStorage.getItem('albums');
    return saved ? JSON.parse(saved) : [];
  });
  const [newAlbum, setNewAlbum] = React.useState('');
  const [newArtist, setNewArtist] = React.useState('');
  const [selectedAlbum, setSelectedAlbum] = React.useState(null);

  React.useEffect(() => {
    localStorage.setItem('albums', JSON.stringify(albums));
  }, [albums]);

  const addAlbum = () => {
    if (newAlbum && newArtist) {
      setAlbums([...albums, { album: newAlbum, artist: newArtist }]);
      setNewAlbum('');
      setNewArtist('');
    }
  };

  const removeAlbum = (index) => {
    setAlbums(albums.filter((_, i) => i !== index));
  };

  const pickRandomAlbum = () => {
    if (albums.length > 0) {
      const randomIndex = Math.floor(Math.random() * albums.length);
      setSelectedAlbum(albums[randomIndex]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Random Album Picker</h1>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Album name"
              value={newAlbum}
              onChange={(e) => setNewAlbum(e.target.value)}
              className="px-4 py-2 border rounded flex-1"
            />
            <input
              type="text"
              placeholder="Artist"
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
              className="px-4 py-2 border rounded flex-1"
            />
            <button
              onClick={addAlbum}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {albums.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span>{item.album} - {item.artist}</span>
                <button
                  onClick={() => removeAlbum(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            onClick={pickRandomAlbum}
            className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            disabled={albums.length === 0}
          >
            Pick Random Album
          </button>

          {selectedAlbum && (
            <div className="mt-4 p-4 bg-blue-100 rounded-lg text-center">
              <h3 className="font-bold">Selected Album:</h3>
              <p>{selectedAlbum.album} - {selectedAlbum.artist}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(<MusicLibrary />);
});