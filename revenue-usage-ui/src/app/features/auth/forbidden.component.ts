import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  template: `
    <div class="login-page">
      <div class="login-card">
        <h2>{{ 'AUTH.FORBIDDEN_TITLE' | translate }}</h2>
        <p>{{ 'AUTH.FORBIDDEN_BODY' | translate }}</p>
        <a routerLink="/">{{ 'AUTH.BACK_HOME' | translate }}</a>
      </div>
    </div>
  `,
})
export class ForbiddenComponent {}
