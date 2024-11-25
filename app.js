// Basic test component
const App = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl">Hello World</h1>
    </div>
  );
};

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error('Root element not found');
    return;
  }

  try {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Render error:', error);
  }
});