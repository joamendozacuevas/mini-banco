# 🏦 XBank - Evaluación de Testing Unitario

![Testing Suite](https://github.com/joamendozacuevas/mini-banco/actions/workflows/test.yml/badge.svg)

Este proyecto es la implementación de pruebas unitarias sobre la plataforma XBank, utilizando **Vitest**, **React Testing Library** y **jsdom**. Se ha aislado por completo la capa de servicios (Firebase) cumpliendo estrictamente con el patrón Arrange-Act-Assert (AAA).

## 🚀 Cómo ejecutar las pruebas

Para levantar el entorno de pruebas localmente, ejecuta los siguientes comandos en la terminal:

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Ejecutar la suite de tests (12 pruebas en total):
   ```bash
   npm test
   ```
3. Generar el reporte de cobertura:
   ```bash
   npm run coverage
   ```

## 📊 Reporte de Cobertura (Coverage - RT6)

Se superó con creces el 70% de cobertura de líneas exigido. A continuación, el reporte generado en la última ejecución:

```text
 % Coverage report from v8
------------------|---------|----------|---------|---------|-----------------------------------
File              | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                 
------------------|---------|----------|---------|---------|-----------------------------------
All files         |   77.77 |     66.1 |    62.5 |   79.41 |                                   
 components       |   74.19 |    56.52 |   60.86 |   75.86 |                                   
  Auth.jsx        |   71.42 |       65 |   66.66 |   74.07 | 28-39,57,77                       
  Dashboard.jsx   |   75.38 |       50 |   58.82 |   76.66 | 38-39,47-48,52-58,111-115,162-172 
 firebase         |     100 |      100 |     100 |     100 |                                   
  config.js       |     100 |      100 |     100 |     100 |                                   
 utils            |     100 |      100 |     100 |     100 |                                   
  validaciones.js |     100 |      100 |     100 |     100 |                                   
------------------|---------|----------|---------|---------|-----------------------------------
```

## 🛠️ Refactorización para Testing (RT2)

Para lograr un código verdaderamente testeable, se aplicó la Separación de Responsabilidades (Separation of Concerns). 
Toda la lógica de validación de transferencias (verificación de saldos, montos negativos, validación de destinatario, etc.) estaba inicialmente acoplada a la interfaz gráfica dentro de `Dashboard.jsx`. 

Esta lógica fue extraída a una función pura llamada `validarTransferencia` en `src/utils/validaciones.js`. Esto permitió probar exhaustivamente todas las reglas de negocio (casos borde) sin necesidad de renderizar componentes de React ni lidiar con el DOM.

## 🤖 Uso de IA en el Desarrollo

Durante el desarrollo de esta evaluación, se utilizó IA como herramienta de apoyo con los siguientes propósitos:

1. **Configuración de Mocks:** Se le solicitó ayuda para estructurar los mocks completos de Firebase (`vi.mock('firebase/firestore')`) para aislar la capa de servicios y evitar conexiones reales a la base de datos (cumpliendo RT5).
2. **Tests Parametrizados:** La IA ayudó a estructurar la sintaxis de `it.each` para testear las validaciones puras, logrando probar 6 casos distintos de error en un solo bloque de código.
3. **Filtro y Corrección de Bugs (Ejemplo real):** Al implementar el test del componente `Auth.jsx`, se escribió una prueba que esperaba que la función de inicio de sesión de Firebase no fuera llamada si los campos estaban vacíos. El test falló, revelando un bug real en el código original. Gracias a esto, se refactorizó `Auth.jsx` para incluir validaciones preventivas antes de hacer el *submit*, y la prueba finalmente pasó en verde.