# Mini Banco Digital - React + Firebase

## Instalación y Ejecución
1. Clonar el repositorio.
2. Instalar dependencias: `npm install`
3. Crear un archivo `.env` basado en `.env.example` con las credenciales correspondientes.
4. Ejecutar el servidor: `npm run dev`

## Cuentas de Prueba
- **Usuario 1:** prueba1@banco.cl / pass1234
- **Usuario 2:** prueba2@banco.cl / pass1234

## Modelo de Datos (Firestore)
- `users/{uid}` -> `{ nombre, email, saldo }`
- `movimientos/{id}` -> `{ emisorUid, emisorNombre, receptorUid, receptorNombre, monto, fecha, tipo }`

## Uso de IA
Se utilizó IA para estructurar el modelo de datos de Firebase, la arquitectura modular de los componentes React (separando responsabilidades entre Auth, Dashboard y Config), y para optimizar las limpiezas de las suscripciones `onSnapshot` de la base de datos para prevenir fugas de memoria.