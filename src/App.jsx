import { useState, useEffect } from 'react';
import { auth } from './firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mantiene la sesión activa si se recarga la página
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="loading">Cargando aplicación...</div>;

  return (
    <main className="app-container">
      <h1>🏦 XBank</h1>
      {user ? (
        <Dashboard user={user} setUser={setUser} />
      ) : (
        <Auth setUser={setUser} />
      )}
    </main>
  );
}

export default App;