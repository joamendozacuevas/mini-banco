// src/components/Auth.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Auth from './Auth';
import * as auth from 'firebase/auth';

// RT5: Mockeamos la autenticación
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  getAuth: vi.fn()
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  setDoc: vi.fn(),
  getFirestore: vi.fn()
}));

vi.mock('../firebase/config', () => ({
  auth: {},
  db: {}
}));

describe('Auth Component (Login/Registro)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no llama al servicio de autenticación con campos vacíos', async () => {
    const user = userEvent.setup();
    render(<Auth setUser={vi.fn()} />);

    // Act: Clic directo en entrar sin llenar nada
    const btnEntrar = screen.getByRole('button', { name: /entrar/i });
    await user.click(btnEntrar);

    // Assert
    expect(auth.signInWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it('muestra mensaje de error si Firebase rechaza las credenciales', async () => {
    const user = userEvent.setup();
    
    // Simulamos que Firebase tira un error de credenciales
    auth.signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Firebase: Error (auth/invalid-credential).'));

    render(<Auth setUser={vi.fn()} />);

    // Arrange
    await user.type(screen.getByPlaceholderText('Correo electrónico'), 'prueba@banco.cl');
    await user.type(screen.getByPlaceholderText('Contraseña'), 'claveFalsa');
    
    // Act
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    // Assert: Verificamos que el error aparece en pantalla
    await waitFor(() => {
      expect(screen.getByText('Firebase: Error (auth/invalid-credential).')).toBeInTheDocument();
    });
  });
});