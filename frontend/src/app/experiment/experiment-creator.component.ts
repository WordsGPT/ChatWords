import { Component, ViewChild } from '@angular/core';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { Experiment } from './experiment';
import { ExperimentService } from './experiment.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-experiment-creator',
  standalone: true,
  templateUrl: './experiment-creator.component.html',
  imports: [NgbCollapseModule, CommonModule, RouterModule],
  styleUrls: ['./experiment-creator.component.scss']
})
export class ExperimentCreatorComponent {
  public isCollapsed = true;

  experiments: Experiment[] = [];

  constructor(private experimentService: ExperimentService) { }

  @ViewChild('myForm') myForm: any;

  clearForm() {
    this.myForm.reset();
  }

  ngOnInit(): void {
    this.getExperiments();
  }

  getExperiments(): void {
    this.experimentService.getExperiments()
    .subscribe(experiments => this.experiments = experiments);
  }

  add(name: string, model: string, version: string, program: string, configurationTemperature: string ): void {
    name = name.trim();
    if (!name || !model || !version) { return; }
    const configuration = {"temperature": configurationTemperature}
    this.experimentService.addExperiment({ name, model, version, program, configuration } as Experiment)
      .subscribe(experiment => {
        this.experiments.push(experiment);
      });
  }

  delete(experiment: Experiment): void {
    this.experiments = this.experiments.filter(h => h !== experiment);
    this.experimentService.deleteExperiment(experiment.id).subscribe();
  }

}
