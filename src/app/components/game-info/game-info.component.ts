import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { isUndefined } from 'util';

@Component({
  selector: 'app-game-info',
  templateUrl: './game-info.component.html',
  styleUrls: ['./game-info.component.css']
})
export class GameInfoComponent {
  modalTitle: string;
  modalBody: string;
  modalClass: string;
  mrStart: NgbModalRef;
  mrFinish: NgbModalRef;
  mrRematch: NgbModalRef;
  @Input()  game: any;
  @Input() user: any;
  @Input()  playerNumber: number;
  @Output() suggestEvent = new EventEmitter();
  @Output() rematchEvent = new EventEmitter();
  @ViewChild('startInfo')  startInfo;
  @ViewChild('finishInfo')  finishInfo;
  @ViewChild('rematchInfo')  rematchInfo;
  @ViewChild('closeInfo')  closeInfo;
  constructor( public modalService: NgbModal) { }

  showStartInfo(game: any, playerNumber: number) {
    this.setModalTextAfterStart(game, playerNumber);
    this.mrStart = this.modalService.open(this.startInfo);
    setTimeout(() => {
      this.mrStart.close();
    }, 2000);
  }
  setModalTextAfterStart(game: any, playerNumber: number) {
    this.modalTitle = null;
    if (playerNumber === 0) {
      this.modalBody = game.turn === game.player1.player ?
        game.player1.displayName : game.player2.displayName;
      this.modalBody += ' starts the game!';
    } else if (playerNumber === game.turn) {
      this.modalBody = 'You start!';
    } else {
      this.modalBody = 'Your opponent starts.';
    }
  }
  showFinishInfo() {
    this.setModalTextAfterFinish();
    this.mrFinish = this.modalService.open(this.finishInfo, this.getCloseOptions());
  }
  setModalTextAfterFinish() {
    if (this.playerNumber === 0) {
      this.modalClass = 'alert alert-info';
      this.modalTitle = this.game.turn === this.game.player1.player ?
        this.game.player1.displayName : this.game.player2.displayName;
      this.modalTitle += ' has won the game!';
      this.modalBody = 'Press "Go back" to checkout other rooms.';
    } else if (this.playerNumber === this.game.turn) {
      this.modalClass = 'alert alert-success';
      this.modalTitle = 'Congratulations, you\'ve won the game!';
      this.modalBody = 'Ask your opponent to play again or press "Go back" to checkout other rooms.';
    } else {
      this.modalClass = 'alert alert-danger';
      this.modalTitle = 'Sorry, you\'ve lost the game.';
      this.modalBody = 'Ask your opponent to play again or press "Go back" to checkout other rooms.';
    }
  }
  getCloseOptions() {
    let ngbModalOptions: NgbModalOptions;
    ngbModalOptions = {
      backdrop : 'static',
      keyboard : false
    };
    return ngbModalOptions;
  }
  suggestRematch() {
    this.suggestEvent.emit();
  }
  acceptRematch() {
    this.rematchEvent.emit();
  }
  showRematchInfo(userUid) {
    this.setModalTextRematchInfo(userUid);
    this.mrFinish.close();
    this.mrRematch = this.modalService.open(this.rematchInfo, this.getCloseOptions());
  }
  setModalTextRematchInfo(userUid) {
    if (this.game.rematchUserId !== userUid) {
      this.modalTitle = 'Your opponent wants to play again.';
      this.modalBody = 'Play again or press "Go back" to checkout other rooms.';
    } else {
      this.modalTitle = 'Waiting for opponent\'s decision.';
      this.modalBody = 'Press "Go back" to checkout other rooms.';
    }
  }
  showOpponentQuitInfo() {
    if (!isUndefined(this.mrFinish)) {
      this.mrFinish.close();
    }
    if (!isUndefined(this.mrRematch)) {
      this.mrRematch.close();
    }
    this.modalTitle = 'Your opponent has left the game.';
    this.modalBody = 'Press "Go back" to checkout other games.';
    this.modalService.open(this.closeInfo, this.getCloseOptions());
  }
  showPlayerQuitInfo() {
    if (isUndefined(this.mrFinish)) {
      this.modalTitle = this.game.quitUserNumber === 1 ?
        this.game.player1.displayName + ' has left the game.' :
        this.game.player2.displayName + ' has left the game.';
      this.modalBody = 'Press "Go back" to checkout other games.';
      this.modalService.open(this.closeInfo, this.getCloseOptions());
    }
  }
  closeModals() {
    if (!isUndefined(this.mrStart)) {
      this.mrStart.close();
    }
    if (!isUndefined(this.mrFinish)) {
      this.mrFinish.close();
    }
    if (!isUndefined(this.mrRematch)) {
      this.mrRematch.close();
    }
  }
}
