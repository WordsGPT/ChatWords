import { Component } from '@angular/core';
import { LoginService } from './login/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'words-gpt-tool';
  isLoggedIn: boolean = true;
  version!: string;

  constructor(private loginService: LoginService) {
    this.loginService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      this.version = require('../../package.json').version
    });
  }

  ngOnInit() {}
}
