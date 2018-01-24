import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { RegisterComponent } from './components/register/register.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { HomeComponent } from './components/home/home.component';
import { GameComponent } from './components/game/game.component';
import { TopPlayersComponent } from './components/top-players/top-players.component';
import { AuthGuard } from './guards/auth-guard';
import { GameGuard } from './guards/game-guard';


const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'register', component: RegisterComponent},
  { path: 'signIn', component: SignInComponent},
  { path: 'top', component: TopPlayersComponent, canActivate: [AuthGuard]},
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  { path: 'game/:id', component: GameComponent, canActivate: [GameGuard, AuthGuard], canDeactivate: [GameGuard]},
  { path: '**', redirectTo: 'home'}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes/*, {initialNavigation: false}*/)],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
