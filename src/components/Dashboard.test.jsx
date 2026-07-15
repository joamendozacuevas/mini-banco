// src/components/Dashboard.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import * as firestore from 'firebase/firestore';

// RT5: MOCK DE SERVICIOS - Reemplazamos Firebase completo

// 1. Mockeamos la inicialización general
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn()
}));

// 2. Agregamos getFirestore al mock de base de datos
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(), // <-- Esta es la pieza que faltaba
  doc: vi.fn(),
  onSnapshot: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  addDoc: vi.fn(),
  orderBy: vi.fn(),
  deleteDoc: vi.fn()
}));

// 3. Agregamos getAuth al mock de autenticación
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  signOut: vi.fn()
}));

// Configuraciones iniciales del usuario mock
const mockUser = { uid: '123', email: 'yo@banco.cl' };
const mockUserData = { nombre: 'Joaquín Mendoza', saldo: 100000 };

describe('Dashboard Component', () => {
  let mockUnsubscribeUser;
  let mockUnsubscribeMovs;

  beforeEach(() => {
    vi.clearAllMocks(); // Limpiar historial de mocks entre tests

    // Configuramos onSnapshot para que simule que encontró los datos del usuario
    mockUnsubscribeUser = vi.fn();
    mockUnsubscribeMovs = vi.fn();

    firestore.onSnapshot.mockImplementation((ref, callback) => {
      // Simula el snapshot del usuario
      if (ref === 'userDocRef') {
        callback({ exists: () => true, data: () => mockUserData });
        return mockUnsubscribeUser;
      }
      // Simula el snapshot del historial vacío
      callback({ docs: [] });
      return mockUnsubscribeMovs;
    });

    // Pequeño truco para diferenciar los onSnapshot
    firestore.doc.mockReturnValue('userDocRef'); 
  });

  // RT3: Test de formulario con interacción
  it('muestra error y no llama a Firebase si el monto es inválido', async () => {
    const user = userEvent.setup();
    render(<Dashboard user={mockUser} setUser={vi.fn()} />);

    // Arrange: Llenar formulario con monto negativo
    const inputEmail = screen.getByPlaceholderText('Email del destinatario');
    const inputMonto = screen.getByPlaceholderText('Monto');
    const btnEnviar = screen.getByRole('button', { name: /enviar dinero/i });

    await user.type(inputEmail, 'amigo@banco.cl');
    await user.type(inputMonto, '-5000');
    
    // Act: Enviar formulario
    await user.click(btnEnviar);

    // Assert: Verificar mensaje y que no se llamó a getDocs ni updateDoc
    expect(await screen.findByText('El monto debe ser un número mayor a 0')).toBeInTheDocument();
    expect(firestore.getDocs).not.toHaveBeenCalled();
  });

  it('procesa la transferencia correctamente con datos válidos', async () => {
    const user = userEvent.setup();
    
    // Configurar mock para que la búsqueda del destinatario sea exitosa
    firestore.getDocs.mockResolvedValueOnce({
      empty: false,
      docs: [{ id: '456', data: () => ({ nombre: 'Amigo', saldo: 10000 }) }]
    });

    render(<Dashboard user={mockUser} setUser={vi.fn()} />);

    // Arrange
    await user.type(screen.getByPlaceholderText('Email del destinatario'), 'amigo@banco.cl');
    await user.type(screen.getByPlaceholderText('Monto'), '50000');
    
// Act
    await user.click(screen.getByRole('button', { name: /enviar dinero/i }));

    // Assert: Verificamos llamadas a Firebase y mensaje de éxito (RT5)
    // Envolvemos todo en waitFor porque estas actualizaciones dependen de promesas
    await waitFor(() => {
      expect(firestore.updateDoc).toHaveBeenCalledTimes(2); // Descuenta emisor y suma receptor
      expect(firestore.addDoc).toHaveBeenCalled(); // Registra historial
      // Buscamos el mensaje de éxito usando una expresión regular para que sea más flexible
      expect(screen.getByText(/¡Transferencia de \$50\.000 enviada con éxito!/i)).toBeInTheDocument();
    });
  });

    // Assert: Verificamos que el botón cambia a estado de carga
    expect(screen.getByRole('button', { name: /transfiriendo/i })).toBeDisabled();

    // Assert: Verificamos llamadas a Firebase (RT5)
    await waitFor(() => {
      expect(firestore.updateDoc).toHaveBeenCalledTimes(2); // Descuenta emisor y suma receptor
      expect(firestore.addDoc).toHaveBeenCalled(); // Registra historial
      expect(screen.getByText('¡Transferencia de $50.000 enviada con éxito!')).toBeInTheDocument();
    });
  });

  // BONUS: Test de limpieza de suscripciones (Memory Leaks)
  it('cancela las suscripciones (onSnapshot) al desmontar el componente', () => {
    const { unmount } = render(<Dashboard user={mockUser} setUser={vi.fn()} />);
    
    // Act: Desmontar el componente
    unmount();

    // Assert: Las funciones de limpieza se llamaron
    expect(mockUnsubscribeUser).toHaveBeenCalledTimes(1);
    expect(mockUnsubscribeMovs).toHaveBeenCalledTimes(1);
  });
});