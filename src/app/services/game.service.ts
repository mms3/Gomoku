import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from './auth.service';
import 'rxjs/add/operator/map';
import { StatsService } from './stats.service';
import * as firebase from 'firebase';

@Injectable()
export class GameService {
  offset: any;
  constructor(public db: AngularFireDatabase, public as: AuthService, public sts: StatsService) {
    firebase.database().ref('.info/serverTimeOffset')
      .on('value', (snap) => {
        this.offset = snap.val();
      });
  }
  create(callback?: any) {
    this.db.list('/games').push({
      board: board,
      createdOn: new Date().getTime() + this.offset,
      createdOnReversed: (new Date().getTime() + this.offset) * -1,
      player1: {
        displayName: this.as.userUser.displayName,
        photoURL: this.as.userUser.photoURL,
        uid: this.as.userUser.uid,
        player: 1,
        stats: this.sts.userStats
      },
      status: 'created',
    })
      .then((success: any) => {
          if (callback) {
            callback(null, success);
          }
        }, (error: Error) => {
          if (callback) {
            callback(error, null);
          }
        });
  }
  join(id, callback?: any) {
    this.db.object('/games/' + id)
      .update({
        player2: {
          displayName: this.as.userUser.displayName,
          photoURL: this.as.userUser.photoURL,
          uid: this.as.userUser.uid,
          player: 2,
          stats: this.sts.userStats
        },
        status: 'ready',
        turn: Math.floor(Math.random() * (2 - 1 + 1)) + 1,
        nextMoveTime: new Date().getTime() + this.offset + 61000,
      })
      .then((success: any) => {
        if (callback) {
          callback(null, success);
        }
      }, (error: Error) => {
        if (callback) {
          callback(error, null);
        }
      });
  }
  getGames() {
    return this.db.list('/games', ref => {
      return ref.endAt(0 - Date.now() - this.offset + 7200000).orderByChild('createdOnReversed');
    }).snapshotChanges();
  }
  getGame(id: string) {
    return this.db.object('/games/' + id).valueChanges();
  }
  getTurn(id: string) {
    return this.db.object('/games/' + id + /turn/).valueChanges();
  }
  switchTurn(id: string, lastPlayer: number) {
    this.db.object('/games/' + id).update({
      turn: lastPlayer === 1 ? 2 : 1,
      nextMoveTime: new Date().getTime() + this.offset + 61000,
    }).catch((error) => {
      window.alert('Error while changing turn. Open the console to get more information.');
      console.log(error.message);
    });
  }
  move(player: number, game: any, id: string, row: number, col: number) {
    if (game.board[row][col] === 0 && ((player === 1 && game.turn === 1) || (player === 2 && game.turn === 2))
      && (game.status === 'inProgress' || game.status === 'ready')) {
        game.board[row][col] = game.turn;
        this.db.object('/games/' + id).update({
          status: 'inProgress',
          board: game.board,
          lastMove: {
            row: row,
            col: col,
            player: player,
          }
        });
    }
  }
  suggestRematch(user: any, id: string) {
    this.db.object('/games/' + id).update({
      status: 'rematch',
      rematchUserId: user.uid,
    }).catch((error) => {
      window.alert('Error while suggesting rematch. Open the console to get more information');
      console.log(error.message);
    });
  }
  playAgain(id: string, turn: number) {
    this.db.object('/games/' + id).update({
      status: 'ready',
      board: board,
      lastMove: null,
      turn: turn === 1 ? 2 : 1,
      nextMoveTime: new Date().getTime() + this.offset + 61000,
    }).catch((error) => {
      window.alert('Error while creating rematch. Open the console to get more information.');
      console.log(error.message);
    });
  }
  acceptRematch(id: string) {
    this.db.object('/games/' + id).update({
      status: 'rematchAccepted',
    }).catch((error) => {
      window.alert('Error while accepting rematch. Open the console to get more information.');
      console.log(error.message);
    });
  }
  quitGame(playerNumber: number, id: string, before: boolean) {
    return this.db.object('/games/' + id).update({
      status: 'beforeClosed',
      quitUserNumber: playerNumber,
      quitBeforeFinish: before
    });
  }
}

export const board: number[][] = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
