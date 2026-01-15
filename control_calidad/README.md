# control_calidad

## Pruebas End-to-End con Cypress

Este directorio contiene la configuración y pruebas E2E automatizadas para el proyecto usando [Cypress](https://www.cypress.io/).

### Instalación

```bash
npm install
```

### Ejecutar pruebas

```bash
npx cypress open
```
O para modo headless:
```bash
npx cypress run
```

### Reporter

Se utiliza `cypress-mochawesome-reporter` para generar reportes visuales de las pruebas. Los reportes se guardan en la carpeta `cypress/reports`.

### Estructura
- `cypress/e2e/`: Pruebas E2E
- `cypress/fixtures/`: Datos de prueba
- `cypress/support/`: Comandos y configuración global
- `cypress.config.js`: Configuración de Cypress y reporter

### Entornos
- `localhost`: http://localhost:8081
