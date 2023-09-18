import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root',
})
export class LoginService {

  serverUrl = environment.BACKEND_URI
  private loginUrl = `${this.serverUrl}/auth/login`

  public isLoggedInSubject = new BehaviorSubject<boolean>(true);
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();


  constructor(private http: HttpClient) 
    { }

  login(username: string, password: string): Observable<string> {
    const credentials = {username, password}
    return this.http.post<string>(this.loginUrl, credentials, this.getHeadersHttpOptions(false)).pipe(
      tap((token: string) => {
        this.createToken(token)
        this.setLoggedIn(true)
      }),
      catchError(this.handleError)
    );
  }
 
  logout() {
    this.deleteToken()
    this.setLoggedIn(false);
  }

  getToken() {
    return localStorage.getItem('chatwords')
  }

  createToken(token: any) {
    localStorage.setItem('chatwords', `${token?.access_token}`);
  }

  deleteToken () {
    localStorage.removeItem('chatwords')
  }

  setLoggedIn(value: boolean) {
    this.isLoggedInSubject.next(value);
  }

  getHeadersHttpOptions(authentication: Boolean) {
    const httpHeaders = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    if (authentication) {
      httpHeaders.headers = httpHeaders.headers.append('Authorization', `Bearer ${this.getToken()}`)
    }
    httpHeaders.headers.getAll('Content-type')
    httpHeaders.headers.getAll('Authorization')
    return httpHeaders
  }

  private handleError(error: HttpErrorResponse) {
    if (error.status === 401) {
      this.logout()
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return throwError(() => new Error('Something bad happened; please try again later.'));
  }
}
