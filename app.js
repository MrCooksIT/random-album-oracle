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
  
  // Copy the entire MusicLibrary component from above here, but remove the imports
  
  ReactDOM.render(<MusicLibrary />, document.getElementById('root'));