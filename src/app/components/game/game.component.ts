import { Component, HostListener, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameService } from '../../services/game.service';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../../services/auth.service';
import { ViewChild } from '@angular/core';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/takeWhile';
import { isUndefined} from 'util';
import { Subscription } from 'rxjs/Subscription';
import { GameInfoComponent } from '../game-info/game-info.component';
import * as firebase from 'firebase';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnDestroy {
  gameId: string;
  game: any;
  user: any;
  playerNumber: number;
  wasStartWindow = false;
  countDown: Observable<any>;
  moveTime = 61;
  timeLeft: number;
  offset: any;
  timeSubscribe: Subscription;
  gameSubscribe: Subscription;
  turnSubscribe: Subscription;
  userSubscribe: Subscription;
  @ViewChild(GameInfoComponent) gInfo: GameInfoComponent;
  constructor(public gs: GameService, public activeRoute: ActivatedRoute, public as: AuthService) {
    firebase.database().ref('.info/serverTimeOffset')
      .on('value', (snap) => {
        this.offset = snap.val();
      });
    this.gameId = this.activeRoute.snapshot.params['id'];
    this.subscribeToUser();
    this.subscribeToGame();
    this.subscribeToTurn();
  }
  ngOnDestroy() {
    this.unsubscribeAll();
  }
  subscribeToUser() {
    this.userSubscribe = this.as.user.subscribe((user) => {
      this.user = user;
    });
  }
  subscribeToGame() {
    this.gameSubscribe = this.gs.getGame(this.gameId).subscribe((game) => {
      this.game = game;
      if (this.game.status === 'ready' && !this.wasStartWindow) {
        this.setPlayerNumber();
        if (!isUndefined(this.game)) {
          this.gInfo.showStartInfo(this.game, this.playerNumber);
          this.wasStartWindow = true;
        }
      }
      this.setPlayerNumber();
      if (this.game.status === 'finished') {
        this.gInfo.showFinishInfo();
        if (this.timeSubscribe != null) {
          this.timeSubscribe.unsubscribe();
        }
      }
      if (this.game.status === 'rematch' && this.playerNumber !== 0) {
        this.gInfo.showRematchInfo(this.user.uid);
      }
      if (this.game.status === 'rematchAccepted') {
        this.playAgain();
      }
      if (this.game.status === 'closed' && this.game.quitUserNumber !== this.playerNumber) {
        if (this.playerNumber !== 0) {
          this.gInfo.showOpponentQuitInfo();
        } else {
          this.gInfo.showPlayerQuitInfo();
        }
      }
    });
  }
  subscribeToTurn() {
    this.turnSubscribe = this.gs.getTurn(this.gameId).subscribe((turn) => {
      if (turn != null) {
        if (this.timeSubscribe != null) {
          this.timeSubscribe.unsubscribe();
        }
        this.timeLeft = Math.floor((this.game.nextMoveTime - Date.now() - this.offset) / 1000);
        this.countDown = Observable.timer(0, 1000)
          .takeWhile(counter => counter <= this.moveTime + 4);
        this.timeSubscribe = this.countDown.subscribe(() => {
          this.checkTime();
        });
      }
    });
  }
  setPlayerNumber() {
    if (this.game.player1.uid === this.user.uid) {
      this.playerNumber = this.game.player1.player;
    } else if (this.game.player2.uid === this.user.uid) {
      this.playerNumber = this.game.player2.player;
    } else {
      this.playerNumber = 0;
    }
  }
  img (val: any) {
    if (val === 1) {
      return 'assets/circle.png';
    } else if (val === 2) {
      return 'assets/cross.png';
    } else {
      return 'assets/empty.png';
    }
  }
  checkTime() {
    this.timeLeft = Math.floor((this.game.nextMoveTime - Date.now() - this.offset) / 1000);
    if (this.timeLeft === 0 && this.playerNumber === this.game.turn) {
      this.gs.switchTurn(this.gameId, this.playerNumber);
      this.timeSubscribe.unsubscribe();
    }
    if (this.timeLeft < -4 && this.playerNumber !== this.game.turn && this.playerNumber !== 0
      && this.game.status !== 'closed' && this.game.status !== 'beforeClosed') {
      this.closeGame();
      this.timeSubscribe.unsubscribe();
    }
  }
  move (row: number, col: number) {
    console.log(this.game.board);
    this.gs.move(this.playerNumber, this.game, this.gameId, row, col);
  }
  suggestRematch() {
    this.gs.suggestRematch(this.user, this.gameId);
  }
  acceptRematch() {
    this.gs.acceptRematch(this.gameId);
  }
  playAgain() {
    this.gInfo.closeModals();
    this.wasStartWindow = false;
    if (this.game.rematchUserId === this.user.uid) {
      this.gs.playAgain(this.gameId, this.game.turn);
    }
  }
  closeGame() {
    if (this.playerNumber !== 0) {
      this.gs.quitGame(this.playerNumber === 1 ? 2 : 1, this.gameId, true)
        .catch((error) => {
          window.alert('Error while closing the game. Open the console to get more information.');
          console.log(error.message);
        });
    }
  }
  quitGame(beforeFinish: boolean) {
    this.gs.quitGame(this.playerNumber, this.gameId, beforeFinish)
      .then(() => {
        this.unsubscribeAll();
      }).catch((error) => {
        window.alert('Error while quitting game. Open the console to get more information.');
        console.log(error.message);
    });
  }
  unsubscribeAll() {
    if (this.timeSubscribe != null) {
      this.timeSubscribe.unsubscribe();
    }
    if (this.gameSubscribe != null) {
      this.gameSubscribe.unsubscribe();
    }
    if (this.turnSubscribe != null) {
      this.turnSubscribe.unsubscribe();
    }
    if (this.userSubscribe != null) {
      this.userSubscribe.unsubscribe();
    }
  }
  @HostListener('window:beforeunload')
  canDeactivate() {
    if (this.user === null) {
      this.unsubscribeAll();
      return true;
    } else {
      if (this.playerNumber === 0) {
        this.unsubscribeAll();
        return true;
      } else {
        if (this.game.status === 'closed' || this.game.status === 'beforeClosed') {
          this.gInfo.closeModals();
          this.unsubscribeAll();
          return true;
        } else if (this.game.status !== 'ready' && this.game.status !== 'inProgress'
          && this.game.status !== 'closed' && this.game.status !== 'beforeClosed') {
          this.quitGame(false);
          return true;
        } else {
          return false;
        }
      }
    }
  }
}
