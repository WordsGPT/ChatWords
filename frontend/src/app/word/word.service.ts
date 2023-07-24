import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Word } from './word';
import { MessageService } from '../message/message.service';


@Injectable({ providedIn: 'root' })
export class WordService {

  private wordsUrl = 'http://localhost:3000/word';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  /** GET words from the server */
  getWords(experimentId: number): Observable<Word[]> {
    return this.http.get<Word[]>(`${this.wordsUrl}?experimentId=${experimentId}`)
      .pipe(
        tap(_ => this.log('fetched words')),
        catchError(this.handleError<Word[]>('getWords', []))
      );
  }

  /** GET word by id. */
  getWord(id: number): Observable<Word> {
    const url = `${this.wordsUrl}/${id}`;
    return this.http.get<Word>(url).pipe(
      tap(_ => this.log(`fetched word id=${id}`)),
      catchError(this.handleError<Word>(`getWord id=${id}`))
    );
  }


  /** POST: add a new word to the server */
  addWord(word: Word): Observable<Word> {
    return this.http.post<Word>(this.wordsUrl, word, this.httpOptions).pipe(
      tap((newWord: Word) => this.log(`added word w/ id=${newWord.id}`)),
      catchError(this.handleError<Word>('addWord'))
    );
  }

    /** POST: add a new word to the server */
  addWords(words: Word[]): Observable<Word[]> {
      const url = `${this.wordsUrl}/s`;
      return this.http.post<Word[]>(url, words, this.httpOptions).pipe(
        tap(() => this.log(`added words`)),
        catchError(this.handleError<Word[]>('addWords'))
      );
    }
  

  /** DELETE: delete the word from the server */
  deleteWord(id: number): Observable<Word> {
    const url = `${this.wordsUrl}/${id}`;

    return this.http.delete<Word>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted word id=${id}`)),
      catchError(this.handleError<Word>('deleteWord'))
    );
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error); // log to console instead

      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  /** Log a WordService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`WordService: ${message}`);
  }
}