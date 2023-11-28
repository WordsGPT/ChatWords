import { Component, Input, ViewChild, inject } from '@angular/core';
import { NgbCollapseModule, NgbPaginationModule, NgbProgressbarModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Word } from './word';
import { WordService } from './word.service';
import { CommonModule, DecimalPipe, NgFor } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Experiment, Prompt } from '../experiment/experiment';
import { ExperimentService } from '../experiment/experiment.service';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-word-component',
  standalone: true,
  templateUrl: './word.component.html',
  imports: [NgbCollapseModule, CommonModule, RouterModule, 
    DecimalPipe, NgFor, FormsModule, NgbTypeaheadModule, NgbPaginationModule,
    NgbProgressbarModule],
  styleUrls: ['./word.component.scss']
})
export class WordComponent {
  public isCollapsedExperiment = true;
  public isCollapsedLoadWords = true;
  public isRunnable: boolean = false;

  public selectedFile!: File;
  public fileContent: string = "";

  public page: number = 1;
	public pageSize: number = 50;
	public collectionSize = 0;
  public wordsWithResultSize = 0;

  private isLoggedIn = true;

  @Input('experimentId') experimentId: number = -1;
  public words: Word[] = [];
  public experiment: Experiment = {
    id: 0,
    name: '',
    model: '',
    program: '',
    status: 0,
    configuration: {},
    prompts: [],
    promptsIds: [],
  };


  constructor(private wordService: WordService, private experimentService: ExperimentService, 
    private loginService: LoginService, private route:ActivatedRoute) {
      this.loginService.isLoggedIn$.subscribe((isLoggedIn) => {
        this.isLoggedIn = isLoggedIn;
      });
   }


  ngOnInit(): void {
    this.refreshExperiment()
    this.refreshWords()
    this.getWordsPeriodically()
  }

getWordsPeriodically(): void {
  if (this.experimentId && window.location.href.includes('/experiment/')){
    this.refreshExperiment()
    this.refreshWords()
      setTimeout(() => {
        this.getWordsPeriodically()
      }, 2000);
  }
}

getExperimentStatus(status: number): string {
  return this.experimentService.getExperimentStatus(status);
}

getChunksWords(words: Word[], chunkSize: number) {
  const chunks: Word[][] = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize));
  }
  return chunks;
}

  add(name: string): void {
    name = name.trim();
    this.wordService.addWord({name, experimentId: this.experimentId} as Word)
      .subscribe(word => {
        if(word){
          console.log("added word")
        }
      });
  }

  addWords(text: string): void {
    text = text.trim(); 
    const wordsToSave = this.getUniqueWords(text) as Word[];
    const chunkWordsToSave = this.getChunksWords(wordsToSave, 1000);
    chunkWordsToSave.forEach( chunkWords => {
      this.wordService.addWords(chunkWords)
      .subscribe(words => {
        console.log(`Added ${words.length} words`)
      });
    })  
  }

  delete(word: Word): void {
    this.words = this.words.filter(h => h !== word);
    this.wordService.deleteWord(word.id).subscribe();
  }

  runExperiment(): void {
    this.experimentService.runExperiment(this.experiment.id)
      .subscribe(experiment => this.experiment = experiment);
  }

  stopExperiment(): void {
    this.experimentService.stopExperiment(this.experiment.id)
      .subscribe(experiment => this.experiment = experiment);

  }

  generateExcel(): void {
    this.experimentService.generateExcel(this.experiment.id);
  }

  getUniqueWords(text: string): Word[] {
    const words = text.split(/\s+/);
    
    return words.map(w => {
      const wordCleaned = w.toLowerCase().replace(/[^a-zA-Z0-9áàâäéèêëíìîïóòôöúùûüñÁÀÂÄÉÈÊËÍÌÎÏÓÒÔÖÚÙÛÜÑ]/g, '')
      return {name: wordCleaned, experimentId: this.experimentId} as Word
    })
  }  

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
    if (this.selectedFile) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.fileContent = e.target.result;
      };

      reader.onerror = (e) => {
        console.error('Error reading file:', e);
      };

      reader.readAsText(this.selectedFile);
    }
  }

  refreshWords() {
    if(this.isLoggedIn){
      this.wordService.getWords(this.experimentId, "all", this.page, this.pageSize)
      .subscribe(result => {
        this.words = result[0],
        this.collectionSize = result[1]
      });
      this.wordService.getWords(this.experimentId, "true", 1, 1)
      .subscribe(result => {
        this.wordsWithResultSize = result[1]
      });
    }
	}

  refreshExperiment() {
    if(this.isLoggedIn){
      this.experimentService.getExperiment(this.experimentId)
      .subscribe(experiment => this.experiment = experiment)
      this.isRunnable = this.experimentService.getExperimentStatus2(this.experiment.status) && this.wordService.getExperimentStatus2(this.words)
    }
  }
}
