import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavigationHeaderComponent } from './standard/navigation-header/navigation-header.component';
import { LocaleService } from './services/locale.service';
import { NavigationService } from '#services/navigation.service';
import { environment } from '#environments/environment.prod';
import { WaitDialogComponent } from "./ui/dialogs/wait-dialog/wait-dialog.component";
import { WaitService } from './ui/dialogs/wait-service/wait-service.component';
import { AuthService } from '#services/auth';
import { DbUserService } from '#services/db';
import { Profile } from './standard/user/models/profile';
import { FooterComponent } from './standard/footer/footer.component';


@Component({
  standalone: true,
    selector: 'app-root',
    imports: [RouterOutlet, 
      NavigationHeaderComponent, 
      FooterComponent, 
      WaitDialogComponent],
    templateUrl: './app.component.html',
})
export class AppComponent {

   wait = inject(WaitService);

  //the idea is to have better back support
  navigationService = inject(NavigationService)
  title = 'syndicai.fr';
  warningDialog = signal(false);
  localeService = inject(LocaleService);

  router = inject(Router)

  //for these to work we need a firebase application setup and a deployment
  /**/
  auth = inject(AuthService);
  user = computed(() => this.auth.user());
  private profileService = inject(DbUserService)
  profile: Profile;
  

  constructor(){
    /**
     * welcome and check the environment type
     */
    console.log('*****************************');
    console.log('** welcome to your app.    **');
    console.log('*****************************');

    /*
    //will be unlocked with maps
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.GOOGLE_MAPS}&libraries=places`;
      document.head.appendChild(script);
      */


    // init lang
    this.localeService.init();

    effect(() => {
      //anything to check like profile?
    })
  }

  showHeader(){
    return true;  
  }

  showFooter(){
    return false;  
  }
}
