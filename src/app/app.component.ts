import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import {Plugins, Capacitor} from '@capacitor/core'
import { AuthService } from './_services/auth.service';
import { Router } from '@angular/router';
import { from } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,

    private authService:AuthService,
    private router:Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
     if(Capacitor.isPluginAvailable('SplahScreen')){
       Plugins.SplashScreen.hide();
     }
    });
  }
  onLogout(){
    this.authService.logout();
    this.router.navigate(['/auth'])
  }
}
