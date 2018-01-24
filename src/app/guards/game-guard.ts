import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GameService } from '../services/game.service';
import { GameComponent } from '../components/game/game.component';
import * as firebase from 'firebase';

@Injectable()
export class GameGuard implements CanActivate, CanDeactivate<GameComponent> {
  game: any;
  offset: any;
  constructor(public as: AuthService, public gs: GameService, public router: Router) {
    firebase.database().ref('.info/serverTimeOffset')
      .on('value', (snap) => {
        this.offset = snap.val();
      });
  }

  canActivate(route: ActivatedRouteSnapshot) {
    return this.gs.getGame(route.params.id)
      .map((game) => {
        this.game = game;
        if (game && (this.game.status === 'created' || this.game.status === 'ready' || this.game.status === 'inProgress') &&
           (!this.game.nextMoveTime || (this.game.nextMoveTime - Date.now() - this.offset) >= -5)) {
          return true;
        } else {
          this.router.navigate(['/home']);
          return false;
        }
      });
  }
  canDeactivate(component: GameComponent) {
    const res = component.canDeactivate();
    if (!res) {
      if (!this.as.userUser) {
        component.unsubscribeAll();
        return true;
      } else {
        const x = window.confirm('Are you sure you want to quit? Your opponent will win.');
        if (x) {
          component.quitGame(true);
          return true;
        } else {
          return false;
        }
      }
    } else {
      return res;
    }
  }
}
