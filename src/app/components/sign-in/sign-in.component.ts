import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent {
  error: any;
  socialError: any;
  constructor(public as: AuthService, public router: Router) { }

  onSubmit(value) {
    this.as.signIn(value.email, value.password)
      .then(() => {
        this.router.navigate(['/home']);
      })
      .catch(error => {
        this.error = error;
        console.log('Error while signing in: ', error.message);
      });
  }
  signInWithGoogle() {
    this.as.signInWithGoogle()
    .then(() => {
      this.router.navigate(['/home']);
    })
    .catch(error => {
      this.socialError = error;
      console.log('Error while signing in with Google: ', error.message);
    });
  }
  signInWithFacebook() {
    this.as.signInWithFacebook()
      .then(() => {
        if (!this.as.currentUser.emailVerified) {
          this.as.currentUser.sendEmailVerification()
            .then(() => {
              window.alert('Verification email has been send to you. Please click the link in the email to verify your account.');
              this.router.navigate(['']);
            })
            .catch((error) => {
              this.socialError = error;
              console.log('Error while sending verification email: ', error.message);
            });
        } else {
          this.router.navigate(['/home']);
        }
      })
      .catch(error => {
        this.error = error;
        console.log('Error while signing in with Facebook: ', error.message);
      });
  }
  signInWithGithub() {
    this.as.signInWithGithub()
      .then(() => {
        if (!this.as.currentUser.emailVerified) {
          this.as.currentUser.sendEmailVerification()
            .then(() => {
              window.alert('Verification email has been send to you. Please click the link in the email to verify your account.');
              this.router.navigate(['']);
            })
            .catch((error) => {
              this.socialError = error;
              console.log('Error while sending verification email: ', error.message);
            });
        } else {
          this.router.navigate(['/home']);
        }
      })
      .catch(error => {
        this.socialError = error;
        console.log('Error while signing in with Github: ', error.message);
      });
  }
}
