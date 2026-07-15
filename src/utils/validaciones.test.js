// src/utils/validaciones.test.js
import { describe, it, expect } from 'vitest';
import { validarTransferencia } from './validaciones';

describe('validarTransferencia', () => {
  // Bonus: Test parametrizado con casos de error
  it.each([
    [-50000, 100000, 'destino@banco.cl', 'yo@banco.cl', 'El monto debe ser un número mayor a 0'],
    [0, 100000, 'destino@banco.cl', 'yo@banco.cl', 'El monto debe ser un número mayor a 0'],
    ['texto', 100000, 'destino@banco.cl', 'yo@banco.cl', 'El monto debe ser un número mayor a 0'],
    [200000, 100000, 'destino@banco.cl', 'yo@banco.cl', 'Saldo insuficiente'],
    [50000, 100000, 'destino', 'yo@banco.cl', 'Formato de email inválido'],
    [50000, 100000, 'yo@banco.cl', 'yo@banco.cl', 'No puedes transferirte a ti mismo'],
  ])('rechaza transferencia si monto=%s, saldo=%s, destino=%s, usuario=%s', 
    (monto, saldo, destino, usuario, errorEsperado) => {
      // Act
      const resultado = validarTransferencia(monto, saldo, destino, usuario);
      // Assert
      expect(resultado).toBe(errorEsperado);
  });

  it('acepta la transferencia cuando todos los datos son válidos', () => {
    // Arrange & Act
    const resultado = validarTransferencia(50000, 100000, 'destino@banco.cl', 'yo@banco.cl');
    // Assert
    expect(resultado).toBeNull();
  });
});