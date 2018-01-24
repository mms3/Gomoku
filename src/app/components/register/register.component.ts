import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {
  error: any;
  signUpForm: FormGroup;
  userSub: Subscription;
  constructor(public as: AuthService, public router: Router, public fb: FormBuilder) {}
  ngOnInit() {
    this.signUpForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]]
    });
    this.error = null;
  }
  ngOnDestroy() {
    if (this.userSub != null) {
      this.userSub.unsubscribe();
    }
  }
  onSubmit(value) {
    this.as.signUp(value.email, value.password)
      .then(() => {
        this.userSub = this.as.user
          .subscribe((user: any) => {
               user.sendEmailVerification()
                 .then(() => {
                  user.updateProfile({
                    displayName: value.username,
                    photoURL: 'https://cdn3.iconfinder.com/data/icons/gray-toolbar-3/512/user-512.png'
                  })
                    .then(() => {
                      this.as.saveUser();
                      window.alert('Verification email has been send to you. Please click the link in the email to verify your account.');
                      this.router.navigate(['']);
                    })
                    .catch(error => {
                      this.error = error;
                      console.log('Error while saving user in database: ' + error.message);
                    });
                })
                .catch((error) => {
                  this.error = error;
                  console.log('Error while sending verification email: ' + error.message);
                });
          });
      })
      .catch((error) => {
        this.error = error;
        console.log('Error while registering: ' + error.message);
      });
  }
}
