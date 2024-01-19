import { Component, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { Experiment, ExperimentStatus, Prompt, Models } from './experiment';
import { ExperimentService } from './experiment.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoginService } from '../login/login.service';

import { IMultiSelectOption, IMultiSelectTexts, IMultiSelectSettings } from 'ngx-bootstrap-multiselect';
import { NgxBootstrapMultiselectModule } from 'ngx-bootstrap-multiselect';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-experiment-creator',
  standalone: true,
  templateUrl: './experiment-creator.component.html',
  imports: [NgbCollapseModule, CommonModule, RouterModule, NgxBootstrapMultiselectModule, FormsModule],
  styleUrls: ['./experiment-creator.component.scss']
})
export class ExperimentCreatorComponent {
  public isCollapsed = true;
  private isLoggedIn = true;

  public isCollapsed2 = true;
  public isCollapsed3 = true;
  public isCollapsed4 = true;
  public isCollapsed5 = false;

  mySettings: IMultiSelectSettings = {
    pullRight: false,
    enableSearch: true,
    checkedStyle: 'checkboxes',
    buttonClasses: 'form-control',
    containerClasses: 'form-control',
    selectionLimit: 0,
    closeOnSelect: false,
    autoUnselect: false,
    showCheckAll: true,
    showUncheckAll: true,
    fixedTitle: false,
    dynamicTitleMaxItems: 0,
    maxHeight: '300px',
    isLazyLoad: false,
    loadViewDistance: 1,
    stopScrollPropagation: true,
    displayAllSelectedText: true
  };
  
  myTexts: IMultiSelectTexts = {
    checkAll: 'Select all',
    uncheckAll: 'Unselect all',
    checked: 'item selected',
    checkedPlural: 'items selected',
    searchPlaceholder: 'Find',
    searchEmptyResult: 'Loading...',
    searchNoRenderText: 'Type in search box to see results...',
    defaultTitle: 'Select',
    allSelected: 'All selected',
  };

  experiments: Experiment[] = [];
  prompts: Prompt[] = [];
  displayPrompts: { [key: number]: string } = {};
  optionsModel: number[] = [];
  myPrompts: IMultiSelectOption[] = [];
  availableIAs: { [key: string]: string[] } = {};
  availableCompanies: string[] = [];

  constructor(private experimentService: ExperimentService, private loginService: LoginService, private cdref: ChangeDetectorRef) { 

    this.loginService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.isLoggedIn = isLoggedIn;
      if (this.isLoggedIn) {
        this.getExperiments();
      }
    });
    
  }

  @ViewChild('myForm') myForm: any;

  clearForm() {
    this.myForm.reset();
  }

  ngOnInit(): void {
    this.getExperiments();
  }

  ngAfterContentChecked() {
    this.cdref.detectChanges();
  }

  switchPrograms(program: string): void {
    if (program == 'proxy') {
      this.getPrompts()
      this.getProxyAvailableIAs()
			this.isCollapsed2 = false
      this.isCollapsed3 = false
      this.isCollapsed5 = true
    }
    else {
      this.isCollapsed2 = true
      this.isCollapsed3 = true
      this.isCollapsed4 = true
      this.isCollapsed5 = false
    }
  }

  addPrompt(newPromptContent: string): void {
    const content = newPromptContent
    if (!content) {
      alert("Error message: New prompt is empty.");
      return
    }
    this.experimentService.addPrompt({ content } as Prompt)
      .subscribe(prompt => {
        this.prompts.push(prompt);
        this.promptsToOptions(this.prompts)
      });
  }

  deletePrompts(): void {
    const promptsIds = this.optionsModel
    if (promptsIds.length != 0) {
      const deletableprompts: string[] = []
      promptsIds.forEach((id) => {
        for (const prompt of this.prompts) {
          if (id === prompt.id) {
            deletableprompts.push(prompt.content + "\n")
          }
        }
      })
      if (confirm(`Are you sure that you want to delete the following prompts?\n${deletableprompts.join("")}`)) {
        this.optionsModel = []
        this.myPrompts = this.myPrompts.filter(item => !(promptsIds.includes(item.id)));
        this.experimentService.deletePrompts(promptsIds).subscribe();
      }
    }
    else {
      alert("Error message: You must select at least one prompt in order to delete");
    }
  }

  getPrompts(): boolean {
    this.experimentService.getPrompts()
    .subscribe(prompts => {
      this.prompts = prompts;
      this.promptsToOptions(prompts);
    });
    return true;
  }

  promptsToOptions(prompts: Prompt[]): void {
    this.myPrompts = [];
    prompts.forEach((item) => {
      this.myPrompts.push({id: item.id, name: item.content})
      this.displayPrompts[item.id] = item.content
    })
  }

  getProxyAvailableIAs(): boolean {
    this.experimentService.getProxyAvailableIAs()
    .subscribe(availableIAs => {
      this.availableIAs = availableIAs.models
      this.availableCompanies = []
      for (const key in this.availableIAs) {
        this.availableCompanies.push(key)
      }
    });
    return true;
  }

  getAvailableModels(company: string): string[] {
    return this.availableIAs[company]
  }
  
  getExperiments(): void {
    this.experimentService.getExperiments()
    .subscribe(experiments => this.experiments = experiments);
  }

  getExperimentStatus(status: number): string {
    return this.experimentService.getExperimentStatus(status);
  }

  add(name: string, model: string, program: string, configurationTemperature: string ): void {
    name = name.trim();
    if (!name) {
      alert("Error message: You must select a valid name for the Experiment to be created.");
      return
    }
    const configuration = {"temperature": configurationTemperature}
    const promptsIds = this.optionsModel
    if (program == "proxy" && promptsIds.length == 0) {
      alert("Error message: You must select at least one prompt for the Experiment to be created.");
      return
    }
    this.experimentService.addExperiment({ name, model, program, configuration, promptsIds } as Experiment)
      .subscribe(experiment => {
        this.experiments.unshift(experiment);
      });
  }

  delete(experiment: Experiment): void {
      if (confirm(`Are you sure that you want to delete the experiment ${experiment.name}?`)) {
        this.experiments = this.experiments.filter(exp => exp !== experiment);
        this.experimentService.deleteExperiment(experiment.id).subscribe();
    }
  }

}
