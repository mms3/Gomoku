import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class StatsService {
  user: any;
  stats: any;
  statsSub: Subscription;
  constructor(public db: AngularFireDatabase) {}
  setStats(user: any) {
    if (user && user.uid) {
      this.statsSub = this.db.object('/rankings/' + user.uid).valueChanges().subscribe((rank) => {
        this.stats = rank;
      });
    }
  }
  get userStats() {
    return this.stats;
  }
  topPlayers(x: number) {
    return this.db.list('/rankings', ref => {
      return ref.orderByChild('rank').limitToLast(x);
    }).valueChanges();
  }
  saveUser(user: any) {
    this.db.object('/rankings/' + user.uid)
      .set({
        rank: 0,
        played: 0,
        wins: 0,
        losses: 0,
        player: {
          name: user.displayName,
          photo: user.photoURL
        }
      })
      .catch((error) => console.log('Error while creating ranking in database: ' + error.message));
  }
  unsubscribe() {
    if (this.statsSub) {
      this.statsSub.unsubscribe();
    }
  }
}
