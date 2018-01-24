import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent {
  constructor(public as: AuthService, public router: Router) {}

  get user() {
    return this.as.user;
  }
  startAsGuest() {
    this.as.signInAnon()
      .then(() => {
        if (this.as.currentUser) {
          this.as.currentUser.updateProfile({
            displayName: 'Anonymous',
            photoURL: 'https://cdn3.iconfinder.com/data/icons/gray-toolbar-3/512/user-512.png'
          }).then(() => {
            this.router.navigate(['/home']);
          }).catch(error => {
            console.log('Error while updating anonymous profile: ', error.message);
          });
        }
      })
      .catch(error => {
        window.alert('Can\'t start as guest. Open the console to get more information.');
        console.log('Error while signing in anonymously: ', error.message);
      });
  }
  sendEmail() {
    this.as.currentUser.sendEmailVerification()
      .catch((error) => {
        window.alert('Can\'t send verification email. Open the console to get more information.');
        console.log('Error while sending verfification email: ', error.message);
      });
  }
}
