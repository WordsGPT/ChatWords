import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter, withComponentInputBinding } from '@angular/router';
import { ExperimentCreatorComponent } from './experiment/experiment-creator.component';
import { WordComponent } from './word/word.component';

const routes: Routes = [ 
{path: '', component: ExperimentCreatorComponent},
{path: 'experiments', component: ExperimentCreatorComponent},
{path: 'experiment/:experimentId', component: WordComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes, withComponentInputBinding())
  ]
})
export class AppRoutingModule { }
