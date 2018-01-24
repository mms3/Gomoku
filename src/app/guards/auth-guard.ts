import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(public as: AuthService, public router: Router) {}
  canActivate() {
    return this.as.user.map((user: any) => {
      if (!user) {
        this.router.navigate(['']);
        return false;
      }
      if (!user.emailVerified && !user.isAnonymous) {
        window.alert('Please verify your email first.');
        this.router.navigate(['']);
        return false;
      }
      return true;
    });
  }
}
