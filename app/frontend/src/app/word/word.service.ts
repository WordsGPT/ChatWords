import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Word } from './word';
import { MessageService } from '../message/message.service';
import { LoginService } from '../login/login.service';
import { environment } from 'src/environments/environment';


@Injectable({ providedIn: 'root' })
export class WordService {

  serverUrl = environment.BACKEND_URI
  private wordsUrl = `${this.serverUrl}/word`;  // URL to web api

  constructor(
    private http: HttpClient,
    private messageService: MessageService,
    private loginService: LoginService) { }


  getExperimentStatus2(words: Word[]): boolean {
    var res = false
    for (const word of words) {
      if (word.result == null) {
        res = true
        break
      }
    }
    return res
  }

  getWords(experimentId: number, withResult:string, page: number, pageSize:number): Observable<[Word[], number]> {
    const httpOptions = this.loginService.getHeadersHttpOptions(true)
    return this.http.get<[Word[], number]>(`${this.wordsUrl}?experimentId=${experimentId}
      &withResult=${withResult}&page=${page}&pageSize=${pageSize}`, httpOptions)
      .pipe(
        tap(_ => this.log('fetched words')),
        catchError(this.handleError<[Word[], number]>('getWords', [[], 0]))
      );
  }

  getWord(id: number): Observable<Word> {
    const httpOptions = this.loginService.getHeadersHttpOptions(true)
    const url = `${this.wordsUrl}/${id}`;
    return this.http.get<Word>(url, httpOptions).pipe(
      tap(_ => this.log(`fetched word id=${id}`)),
      catchError(this.handleError<Word>(`getWord id=${id}`))
    );
  }


  addWord(word: Word): Observable<Word> {
    const httpOptions = this.loginService.getHeadersHttpOptions(true)
    return this.http.post<Word>(this.wordsUrl, word, httpOptions).pipe(
      tap((newWord: Word) => this.log(`added word w/ id=${newWord?.id || "none"}`)),
      catchError(this.handleError<Word>('addWord'))
    );
  }

    /** POST: add a new word to the server */
  addWords(words: Word[]): Observable<Word[]> {
      const httpOptions = this.loginService.getHeadersHttpOptions(true)
      const url = `${this.wordsUrl}/multiple`;
      return this.http.post<Word[]>(url, words, httpOptions).pipe(
        tap(() => this.log(`added words`)),
        catchError(this.handleError<Word[]>('addWords'))
      );
    }
  

  deleteWord(id: number): Observable<Word> {
    const httpOptions = this.loginService.getHeadersHttpOptions(true)
    const url = `${this.wordsUrl}/${id}`;
    return this.http.delete<Word>(url, httpOptions).pipe(
      tap(_ => this.log(`deleted word id=${id}`)),
      catchError(this.handleError<Word>('deleteWord'))
    );
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      if (error.status === 401) {
        this.loginService.logout()
      }

      console.error(error);

      this.log(`${operation} failed: ${error.message}`);

      return of(result as T);
    };
  }

  private log(message: string) {
    this.messageService.add(`WordService: ${message}`);
  }
}