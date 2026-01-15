const { defineConfig } = require("cypress");
module.exports = defineConfig({
  experimentalStudio: true,
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    charts: true,
    reportPageTitle: "Reporte de Pruebas",
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  e2e: {
    pageLoadTimeout: 180000, // aumenta a 3 minutos
    video: true,
    videosFolder: "cypress/videos",
    screenshotOnRunFailure: true,
    screenshotsFolder: "cypress/screenshots",
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
    },
    env: {
      qa:
        "http://localhost:8081",
    },
  },
});
