# Caleuche Network

Pequeña aplicación demo en Ionic y Angular — funcionalidades tipo foro, autenticación y edición de perfiles.

## Tecnologías

- Angular (standalone components)
- Ionic Framework (Ionic Web Components)
- TypeScript
- Capacitor (project contains Capacitor config)
- ngx-lottie (Lottie animations)
- Ionicons

## Principales librerías usadas

- @angular/core, @angular/common, @angular/forms
- @ionic/angular (Ionic UI components)
- ngx-lottie (Lottie animation integration)
- ionicons (icons)

(Revisa `package.json` para el listado exacto y versiones.)

## Estructura del proyecto (resumen)

```
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── login/            
│   │   │   ├── signup/           
│   │   │   ├── profile/          
│   │   │   └── home/             
│   │   ├── services/             
│   │   └── shared/               
│   ├── assets/
│   └── theme/
├── angular.json
├── capacitor.config.ts
├── package.json
└── README.md
```

Archivos clave:
- `src/app/services/auth.service.ts` — gestiona usuarios, login, registro y persistencia en localStorage (`users`, `currentUser`).
- `src/app/pages/home/home.page.ts` — feed con persistencia en localStorage (`caleuche_posts_v1`).
- `src/app/shared/loader-overlay/` — componente overlay para mostrar un loader durante acciones asíncronas.

## Cómo ejecutar el proyecto (Windows PowerShell)

1. Instalar dependencias

```powershell
npm install
```

2. Ejecutar servidor de desarrollo (Ionic)

Si tienes Ionic CLI instalado globalmente:

```powershell
ionic serve
```

O usando npx (no requiere instalación global):

```powershell
npx ionic serve
```

El servidor por defecto abre en `http://localhost:8100`.

3. Construir para producción

```powershell
npm run build
# ó
ionic build
```

4. (Opcional) Capacitor — sincronizar y abrir plataforma Android/iOS

```powershell
npx cap sync android
npx cap open android
```

## Tests

El proyecto tiene configuración para Karma/Jasmine (ver `karma.conf.js`). Ejecuta:

```powershell
npm test
```

## Notas y recomendaciones

- Este es un proyecto demo que usa `localStorage` para persistencia; no es para producción. Para producción usa una API y almacenamiento servidor.