// src/utils/validaciones.js
export const validarTransferencia = (monto, saldoDisponible, emailDestino, emailUsuario) => {
  const montoNum = Number(monto);
  
  if (!monto || isNaN(montoNum) || montoNum <= 0) {
    return 'El monto debe ser un número mayor a 0';
  }
  if (montoNum > saldoDisponible) {
    return 'Saldo insuficiente';
  }
  if (!emailDestino || !emailDestino.includes('@')) {
    return 'Formato de email inválido';
  }
  if (emailDestino === emailUsuario) {
    return 'No puedes transferirte a ti mismo';
  }
  
  return null; // Null significa que pasó todas las validaciones
};