import { Component, Input, ViewChild, inject } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { Word } from './word';
import { WordService } from './word.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Experiment } from '../experiment/experiment';
import { ExperimentService } from '../experiment/experiment.service';

@Component({
  selector: 'app-word-component',
  standalone: true,
  templateUrl: './word.component.html',
  imports: [NgbCollapseModule, CommonModule, RouterModule],
  styleUrls: ['./word.component.scss']
})
export class WordComponent {
  public isCollapsedExperiment = true;
  public isCollapsedLoadWords = true;

  @Input('experimentId') experimentId?: number;
  words: Word[] = [];
  experiment: Experiment = {
    id: 0,
    name: '',
    model: '',
    version: '',
    program: '',
    configuration: {}
  };


  constructor(private wordService: WordService, private experimentService: ExperimentService) {

   }


  ngOnInit(): void {
    if (this.experimentId){
      this.experimentService.getExperiment(this.experimentId)
      .subscribe(experiment => this.experiment = experiment)
      this.getWords(this.experimentId);

      setInterval(() => {
        if (this.experimentId){
          return this.getWords(this.experimentId);
        }
      }, 5000);
    }
    
  }

  getWords(experimentId:number): void {
    this.wordService.getWords(experimentId)
    .subscribe(words => this.words = words);
  }

  add(name: string): void {
    name = name.trim();
    this.wordService.addWord({name, experimentId: this.experimentId} as Word)
      .subscribe(word => {
        this.words.push(word);
      });
  }

  addWords(text: string): void {
    text = text.trim(); 
    const wordsToSave = this.getUniqueWords(text) as Word[];  
    this.wordService.addWords(wordsToSave)
      .subscribe(words => {
        this.words.push(...words as Word[]);
      });
  }

  delete(word: Word): void {
    this.words = this.words.filter(h => h !== word);
    this.wordService.deleteWord(word.id).subscribe();
  }

  runExperiment(): void {
    this.experimentService.runExperiment(this.experiment.id)

  }

  getUniqueWords(text: string): Word[] {
    const words = text.split(/\s+/);
    
    return words.map(w => {
      const wordCleaned = w.toLowerCase().replace(/[^a-zA-Z0-9áàâäéèêëíìîïóòôöúùûüñÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜÑ]/g, '')
      return {name: wordCleaned, experimentId: this.experimentId} as Word
    })
  }  

}
