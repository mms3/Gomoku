import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/map';
import { StatsService } from './stats.service';

@Injectable()
export class AuthService {
  uSub: Subscription;
  stats: any;
  userU: any;
  constructor(public afAuth: AngularFireAuth, public sts: StatsService) {
    this.uSub = this.user.subscribe((user: any) => {
      this.userU = user;
      this.sts.setStats(this.userU);
    });
  }
  get userUser() {
    return this.userU;
  }
  get user(): Observable<any> {
    return this.afAuth.authState;
  }
  get currentUser() {
    return this.afAuth.auth.currentUser;
  }
  signUp(email: string, password: string) {
    this.deleteIfAnonymous();
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }
  signIn(email: string, password: string) {
    this.deleteIfAnonymous();
    return this.afAuth.auth.signInWithEmailAndPassword(email, password);
  }
  signInWithGoogle() {
    this.deleteIfAnonymous();
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  signInWithFacebook() {
    this.deleteIfAnonymous();
    return this.afAuth.auth.signInWithPopup(new firebase.auth.FacebookAuthProvider());
  }
  signInWithGithub() {
    this.deleteIfAnonymous();
    return this.afAuth.auth.signInWithPopup(new firebase.auth.GithubAuthProvider);
  }
  signInAnon() {
    return this.afAuth.auth.signInAnonymously();
  }
  signOut() {
    this.sts.unsubscribe();
    return this.afAuth.auth.signOut();
  }
  deleteIfAnonymous() {
    if (this.afAuth.auth.currentUser && this.afAuth.auth.currentUser.isAnonymous) {
      this.sts.unsubscribe();
      this.afAuth.auth.currentUser.delete();
    }
  }
  saveUser() {
    this.sts.saveUser(this.userU);
  }
}

