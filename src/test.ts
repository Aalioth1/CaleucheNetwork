// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Cargar automáticamente todos los archivos *.spec.ts
// (Requerido por Karma para descubrir pruebas)
// Webpack 5: usar webpackContext en import.meta
const context = (import.meta as any).webpackContext('./', { recursive: true, regExp: /\.spec\.ts$/ });
context.keys().forEach((key: string) => context(key));
