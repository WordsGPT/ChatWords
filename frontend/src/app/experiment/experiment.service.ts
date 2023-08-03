import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Experiment, ExperimentStatus } from './experiment';
import { MessageService } from '../message/message.service';


@Injectable({ providedIn: 'root' })
export class ExperimentService {

  private serverUrl = 'http://localhost:3000'

  private experimentsUrl = `${this.serverUrl}/experiment`;  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService) { }

  getExperimentStatus(status: number): string {
    if (ExperimentStatus['running'] === status){
      return 'running'
    } else if (ExperimentStatus['stopped'] === status){
      return 'stopped'
    } else if (ExperimentStatus['error'] === status){
      return 'error'
    } else {
      return 'none'
    }
  
  }
  

  /** GET experiments from the server */
  getExperiments(): Observable<Experiment[]> {
    return this.http.get<Experiment[]>(this.experimentsUrl)
      .pipe(
        tap(_ => this.log('fetched experiments')),
        catchError(this.handleError<Experiment[]>('getExperiments', []))
      );
  }

  /** GET experiment by id. */
  getExperiment(id: number): Observable<Experiment> {
    const url = `${this.experimentsUrl}/${id}`;
    return this.http.get<Experiment>(url).pipe(
      tap(_ => this.log(`fetched experiment id=${id}`)),
      catchError(this.handleError<Experiment>(`getExperiment id=${id}`))
    );
  }


  /** POST: add a new experiment to the server */
  addExperiment(experiment: Experiment): Observable<Experiment> {
    return this.http.post<Experiment>(this.experimentsUrl, experiment, this.httpOptions).pipe(
      tap((newExperiment: Experiment) => this.log(`added experiment w/ id=${newExperiment.id}`)),
      catchError(this.handleError<Experiment>('addExperiment'))
    );
  }

  /** DELETE: delete the experiment from the server */
  deleteExperiment(id: number): Observable<Experiment> {
    const url = `${this.experimentsUrl}/${id}`;

    return this.http.delete<Experiment>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted experiment id=${id}`)),
      catchError(this.handleError<Experiment>('deleteExperiment'))
    );
  }

  runExperiment(id: number): Observable<Experiment> {
    const url = `${this.experimentsUrl}/run/${id}`;
    return this.http.post<Experiment>(url, undefined).pipe(
      tap(_ => this.log(`fetched experiment id=${id}`)),
      catchError(this.handleError<Experiment>(`getExperiment id=${id}`))
    );
  }

  stopExperiment(id: number): Observable<Experiment> {
    const url = `${this.experimentsUrl}/stop/${id}`;
    return this.http.post<Experiment>(url, undefined).pipe(
      tap(_ => this.log(`fetched experiment id=${id}`)),
      catchError(this.handleError<Experiment>(`getExperiment id=${id}`))
    );
  }

  generateExcel(id:number): void {
    const url = `${this.experimentsUrl}/generateExcel/${id}`;
    this.http.get<{'filename': string}>(url)
    .subscribe(experimentFileName => {window.open(`${this.serverUrl}/${experimentFileName.filename}`, '_blank')})
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

  /** Log a ExperimentService message with the MessageService */
  private log(message: string) {
    this.messageService.add(`ExperimentService: ${message}`);
  }
}