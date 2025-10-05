import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { AppConfig } from './app/config';

fetch('/config.json')
  .then(res => res.json())
  .then((config: AppConfig) => {
    window.__env = config;
    
    bootstrapApplication(AppComponent, appConfig)
      .catch((err) => console.error(err));
  });

