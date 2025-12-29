import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'access-denied',
  imports: [RouterLink],
  template: `
    <section class="access-denied">
      <h1>Sorry, you do not have access to this page.</h1>
      <p>Please return to the homepage to continue.</p>
      <a routerLink="/">Go to homepage</a>
    </section>
  `,
  styles: [
    `
      .access-denied {
        padding: 4rem 1.5rem;
        text-align: center;
      }

      h1 {
        margin-bottom: 1rem;
        font-size: 1.75rem;
      }

      p {
        margin-bottom: 1.5rem;
        color: #4a4a4a;
      }

      a {
        color: #0b72e7;
        text-decoration: none;
        font-weight: 600;
      }

      a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class AccessDeniedComponent {}
