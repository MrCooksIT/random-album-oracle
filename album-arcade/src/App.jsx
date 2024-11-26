import { useState, useEffect } from 'react'
import { db } from './firebase'
import { collection, getDocs, addDoc } from 'firebase/firestore'

function App() {
  const [connectionStatus, setConnectionStatus] = useState('Not tested')

  // Test connection function
  const testConnection = async () => {
    try {
      // Try to add a test document
      const testDoc = await addDoc(collection(db, 'albums'), {
        test: 'Connection Test',
        timestamp: new Date().toISOString()
      });

      // If successful, update status
      setConnectionStatus('Connected! Test ID: ' + testDoc.id)
      console.log('Firebase connection successful', testDoc.id)

      // Optional: Delete the test document
      // await deleteDoc(doc(db, 'albums', testDoc.id))
    } catch (error) {
      setConnectionStatus('Error: ' + error.message)
      console.error('Firebase connection error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Album Arcade</h1>

      <div className="space-y-4">
        <div className="p-4 bg-zinc-800 rounded-lg">
          <p>Connection Status: {connectionStatus}</p>
          <button
            onClick={testConnection}
            className="mt-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
          >
            Test Firebase Connection
          </button>
        </div>

        {/* Debug Info */}
        <div className="p-4 bg-zinc-800 rounded-lg">
          <h2 className="font-bold mb-2">Environment Variables:</h2>
          <pre className="text-xs">
            Project ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID || 'Not set'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default App