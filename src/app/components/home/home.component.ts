import { Component, OnDestroy, OnInit } from '@angular/core';
import { GameService } from '../../services/game.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs/Subscription';
import * as firebase from 'firebase';
import { isUndefined } from 'util';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  games: Observable<any>;
  user: any;
  timeSub: Subscription;
  now: number;
  offset: any;
  constructor(public gs: GameService, public as: AuthService, public router: Router) {
    firebase.database().ref('.info/serverTimeOffset')
      .on('value', (snap) => {
        this.offset = snap.val();
        if (!isUndefined(this.offset)) {
          this.games = this.gs.getGames();
        }
      });
  }

  ngOnInit() {
    this.user = this.as.userUser;
    this.timeSub = Observable.timer(0, 1000).subscribe(() => {
      this.now = Date.now();
    });
  }
  ngOnDestroy() {
    if (this.timeSub != null) {
      this.timeSub.unsubscribe();
    }
  }
  newGame() {
    this.gs.create((error: Error, success: any) => {
      if (error) {
        window.alert('Error while creating game. Open the console to get more information');
        console.log(error.message);
      } else {
        this.router.navigate(['/', 'game', success.key]);
      }
    });
  }
  join(id: string) {
    this.gs.join(id, (error: Error, success: any) => {
      if (error) {
        window.alert('Error while joining game. Open the console to get more information');
        console.log(error.message);
      } else {
        this.router.navigate(['/', 'game', id]);
      }
    });
  }
  watch(id: string) {
    this.router.navigate(['/', 'game', id]);
  }
  continue(id: string) {
    this.router.navigate(['/', 'game', id]);
  }
}
