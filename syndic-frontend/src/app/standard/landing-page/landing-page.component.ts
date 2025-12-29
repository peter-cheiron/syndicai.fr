import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  standalone: true,
  selector: 'landing-page',
  templateUrl: './landing-page.component.html',
  imports: [TranslatePipe]
})
export class LandingPageComponent {

  year = new Date().getFullYear()

  ngOnInit() {
  }

  // Smooth scroll helper
  scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

}
