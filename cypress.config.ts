import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    fileServerFolder: 'www',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
