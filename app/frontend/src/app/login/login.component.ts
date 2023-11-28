import { Component } from '@angular/core';
import { LoginService } from './login.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  imports: [FormsModule],
  styleUrls: ['./login.component.scss']
})


export class LoginComponent {
  isLoggedIn: boolean = true;
  username: string = '';
  password: string = '';

  constructor(private loginService: LoginService) {
    this.loginService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
    });
  }

  authenticate() {
    this.loginService.login(this.username, this.password).subscribe(token => {
      this.username = '';
      this.password = '';
    });
  }



}