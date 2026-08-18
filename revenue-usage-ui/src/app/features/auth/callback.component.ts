import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [TranslatePipe],
  template: `<div class="login-page"><p>{{ 'AUTH.VERIFYING' | translate }}</p></div>`,
})
export class CallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  async ngOnInit(): Promise<void> {
    await this.auth.configure();
    if (this.auth.isLoggedIn()) {
      void this.router.navigateByUrl(this.auth.defaultPath());
    } else {
      void this.router.navigate(['/login']);
    }
  }
}

@Component({
  selector: 'app-home-redirect',
  standalone: true,
  template: '',
})
export class HomeRedirectComponent {}

