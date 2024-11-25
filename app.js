// UI Components
const Button = ({ children, onClick, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 ${className}`}
  >
    {children}
  </button>
);

const Input = ({ placeholder, value, onChange }) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className="px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
  />
);

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
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          Random Album Picker
        </h1>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Album name"
              value={newAlbum}
              onChange={(e) => setNewAlbum(e.target.value)}
            />
            <Input
              placeholder="Artist"
              value={newArtist}
              onChange={(e) => setNewArtist(e.target.value)}
            />
            <Button onClick={addAlbum}>
              Add
            </Button>
          </div>

          <div className="space-y-2">
            {albums.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                <span>{item.album} - {item.artist}</span>
                <Button onClick={() => removeAlbum(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <Button
            onClick={pickRandomAlbum}
            className="w-full"
            disabled={albums.length === 0}
          >
            Pick Random Album
          </Button>

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

ReactDOM.render(<MusicLibrary />, document.getElementById('root'));