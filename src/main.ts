  import { bootstrapApplication } from '@angular/platform-browser';
  import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules, withRouterConfig } from '@angular/router';
  import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

  import { routes } from './app/app.routes';
  import { AppComponent } from './app/app.component';

  import { provideLottieOptions } from 'ngx-lottie';

  // -----------------------------
  //  Lottie player factory
  // -----------------------------
  export function playerFactory() {
    return import('lottie-web');
  }

  // -----------------------------
  //  Bootstrap y providers
  // -----------------------------
  bootstrapApplication(AppComponent, {
    providers: [
      { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
      provideIonicAngular(),
      provideRouter(
        routes,
        withPreloading(PreloadAllModules),
        withRouterConfig({ 
          onSameUrlNavigation: 'reload',
          urlUpdateStrategy: 'deferred'
        })
      ),
      provideLottieOptions({ player: playerFactory }),
    ],
  });

