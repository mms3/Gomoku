import { Component, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { StatsService } from '../../services/stats.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @ViewChild('profile') profile;
  mr: NgbModalRef;
  isClicked = false;
  constructor(public as: AuthService, public sts: StatsService, public router: Router, public modalService: NgbModal) {}
  get user() {
    return this.as.user;
  }
  get stats() {
    return this.sts.userStats;
  }
  signOut() {
    this.as.signOut()
     .then(() => {
        this.router.navigate(['']);
        this.isClicked = true;
      }).catch((error) => {
        window.alert('An error occurred. Open the console to get more information');
        console.log('Error while signing out: ' + error);
    });
  }
  showProfile() {
    this.mr = this.modalService.open(this.profile);
    setTimeout(() => {
      this.mr.close();
    }, 8000);
  }
  showNavbar() {
    if (this.isClicked === true) {
      this.isClicked = false;
    }
  }
}
