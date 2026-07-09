import { useState } from 'react';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export default function Auth({ setUser }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que la página recargue
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
      } else {
        // Validar antes de Firebase
        if (!nombre.trim()) throw new Error("El nombre es obligatorio");
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Crear documento del usuario con saldo inicial
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          nombre: nombre,
          email: email,
          saldo: 100000
        });
        setUser(userCredential.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? 'Iniciar Sesión' : 'Registrarse'}</h2>
      <form onSubmit={handleSubmit}>
        {!isLogin && (
          <input 
            type="text" 
            placeholder="Tu Nombre" 
            value={nombre} 
            onChange={(e) => setNombre(e.target.value)} 
          />
        )}
        <input 
          type="email" 
          placeholder="Correo electrónico" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button disabled={loading}>
          {loading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Crear Cuenta')}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
      </button>
    </div>
  );
}