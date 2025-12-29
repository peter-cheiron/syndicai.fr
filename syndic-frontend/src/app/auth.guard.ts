import { Injectable, inject } from "@angular/core";
import {
  CanActivate,
  Router,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from "@angular/router";

import { AuthService } from "#services/auth";
import { DbUserService } from "#services/db";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  private auth = inject(AuthService);
  private profileService = inject(DbUserService);
  private router = inject(Router);

  async canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    await this.auth.authStateReady();

    const user = await this.auth.user();
    const profile = user ? await this.profileService.getById(user.uid) : null;

    //TODO we will unlock this when we are demo ready ... or someone pays ;-)
    if (user && profile && profile.roles?.includes("DEMO_ACCESS")) return true;

    this.router.navigate(["access-denied"], {
      queryParamsHandling: "preserve",
      queryParams: { returnUrl: state.url },
    });

    return false;
  }
}
