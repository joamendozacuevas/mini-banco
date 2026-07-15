import { useState, useEffect } from 'react';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, getDocs, updateDoc, addDoc, orderBy, deleteDoc } from 'firebase/firestore';
import { validarTransferencia } from '../utils/validaciones'; // <-- NUEVO: Importamos la lógica pura

export default function Dashboard({ user, setUser }) {
  const [userData, setUserData] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  
  // Estado del formulario
  const [emailDestino, setEmailDestino] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState(''); 
  
  // Efecto para Saldo en tiempo real (Suscripción 1)
  useEffect(() => {
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });
    
    return () => unsubscribeUser();
  }, [user.uid]);

  // Efecto para Historial en tiempo real (Suscripción 2)
  useEffect(() => {
    const q = query(
      collection(db, 'movimientos'),
      orderBy('fecha', 'desc')
    );

    const unsubscribeMovs = onSnapshot(q, (snapshot) => {
      const movs = snapshot.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(m => m.emisorUid === user.uid || m.receptorUid === user.uid);
      setMovimientos(movs);
    });

    return () => unsubscribeMovs();
  }, [user.uid]);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const eliminarMovimiento = async (id) => {
    const seguro = window.confirm("¿Eliminar este registro del historial?");
    if (!seguro) return;

    try {
      await deleteDoc(doc(db, 'movimientos', id));
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // NUEVO: Validaciones extraídas antes de tocar Firestore (Cumple RT2)
    const errorValidacion = validarTransferencia(monto, userData.saldo, emailDestino, user.email);
    if (errorValidacion) {
      return setError(errorValidacion);
    }

    const montoNum = Number(monto);
    setLoading(true);

    try {
      // 1. Verificar destinatario
      const qDest = query(collection(db, 'users'), where('email', '==', emailDestino));
      const destSnapshot = await getDocs(qDest);
      
      if (destSnapshot.empty) throw new Error('El destinatario no existe');
      
      const destDoc = destSnapshot.docs[0];
      const destData = destDoc.data();

      // 2. Actualizar saldos
      await updateDoc(doc(db, 'users', user.uid), {
        saldo: userData.saldo - montoNum
      });
      await updateDoc(doc(db, 'users', destDoc.id), {
        saldo: destData.saldo + montoNum
      });

      // 3. Registrar movimiento
      await addDoc(collection(db, 'movimientos'), {
        emisorUid: user.uid,
        emisorNombre: userData.nombre,
        receptorUid: destDoc.id,
        receptorNombre: destData.nombre,
        monto: montoNum,
        fecha: new Date().toISOString(),
        tipo: 'transferencia'
      });

      // Limpiamos el formulario
      setMonto('');
      setEmailDestino('');
      
      // Mostramos el mensaje de éxito y lo borramos a los 3 segundos
      setExito(`¡Transferencia de $${montoNum.toLocaleString('es-CL')} enviada con éxito!`);
      setTimeout(() => {
        setExito('');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <p>Cargando datos del banco...</p>;

  return (
    <div className="dashboard">
      <header>
        <h2>Hola, {userData.nombre}</h2>
        <button onClick={handleLogout} className="logout-btn">Cerrar Sesión</button>
      </header>

      <section className="balance-card">
        <h3>Saldo Actual</h3>
        <p className="saldo">${userData.saldo.toLocaleString('es-CL')}</p>
      </section>

      <section className="transfer-section">
        <h3>Transferir Dinero</h3>
        <form onSubmit={handleTransferSubmit}>
          <input 
            type="email" 
            placeholder="Email del destinatario" 
            value={emailDestino}
            onChange={(e) => setEmailDestino(e.target.value)}
          />
          <input 
            type="number" 
            placeholder="Monto" 
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <button disabled={loading}>
            {loading ? 'Transfiriendo...' : 'Enviar Dinero'}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="history-section">
        <h3>Historial de Movimientos</h3>
        {movimientos.length === 0 ? <p>No hay movimientos aún.</p> : (
          <ul>
            {movimientos.map(mov => {
              const esEnvio = mov.emisorUid === user.uid;
              return (
                <li key={mov.id} className={esEnvio ? 'envio' : 'recepcion'}>
                  <div>
                    <strong>{esEnvio ? `Para: ${mov.receptorNombre}` : `De: ${mov.emisorNombre}`}</strong>
                    <br/><small>{new Date(mov.fecha).toLocaleString()}</small>
                  </div>
                  <span className="monto">
                    {esEnvio ? '-' : '+'}${mov.monto.toLocaleString('es-CL')}
                  </span>
                  <button onClick={() => eliminarMovimiento(mov.id)} style={{marginLeft: '10px', background: 'transparent', border: 'none', cursor: 'pointer'}}>
                    🗑️
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Notificación flotante de éxito */}
      {exito && (
        <div className="toast-exito">
          ✓ {exito}
        </div>
      )}
    </div>
  );
}