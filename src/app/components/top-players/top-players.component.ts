import { Component, OnInit } from '@angular/core';
import { StatsService } from '../../services/stats.service';

@Component({
  selector: 'app-top-players',
  templateUrl: './top-players.component.html',
  styleUrls: ['./top-players.component.css']
})
export class TopPlayersComponent implements OnInit {
  topPlayers: any;
  number = 10;
  a: any;
  b: any;
  constructor(public sts: StatsService) {}

  ngOnInit() {
    this.setTopPlayers();
  }

  setTopPlayers() {
    this.topPlayers = this.sts.topPlayers(this.number)
      .map(users => users.sort((a, b) => {
        this.a = a;
        this.b = b;
        if (this.a.rank === this.b.rank) {
          if (this.a.wins === this.b.wins) {
            if (this.a.losses === this.b.losses) {
              return 0;
            } else {
              return this.a.losses < this.b.losses ? -1 : 1;
            }
          } else {
            return this.a.wins < this.b.wins ? 1 : -1;
          }
        } else {
          return this.a.rank < this.b.rank ? 1 : -1;
        }
      }));
  }
}
