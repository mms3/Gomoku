import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { AuthService } from './services/auth.service';
import { RegisterComponent } from './components/register/register.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { HomeComponent } from './components/home/home.component';
import { GameService } from './services/game.service';
import { GameComponent } from './components/game/game.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { AuthGuard } from './guards/auth-guard';
import { GameGuard } from './guards/game-guard';
import { ChatComponent } from './components/chat/chat.component';
import { ChatService } from './services/chat.service';
import { TopPlayersComponent } from './components/top-players/top-players.component';
import { StatsService } from './services/stats.service';
import { GameInfoComponent } from './components/game-info/game-info.component';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    WelcomeComponent,
    RegisterComponent,
    SignInComponent,
    HomeComponent,
    GameComponent,
    ChatComponent,
    TopPlayersComponent,
    GameInfoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    NgbModule.forRoot(),
    AngularFontAwesomeModule
  ],
  providers: [AuthService, GameService, ChatService, StatsService, AuthGuard, GameGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
