import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { SharedModule } from 'src/app/shared/components/shared.module';
import { MaterialModule } from 'src/app/shared/components/material.module';
import {
  <%= classify(name) %>Module as <%= classify(name) %>SharedModule,
  SharedModule as CommonSharedModule
} from 'rise-shared-module-frontend/src';

// Services & Pipes
import { AssetUrlPipe } from 'src/app/shared/pipes/asset-url.pipe';
import { <%= classify(name) %>Service } from './store/<%= dasherize(name) %>.service';

// Constants
import { ROUTES } from './routes';

// Components
import { <%= classify(name) %>ListComponent } from './<%= dasherize(name) %>-list/<%= dasherize(name) %>-list.component';
import { <%= classify(name) %>DetailsComponent } from './<%= dasherize(name) %>-details/<%= dasherize(name) %>-details.component';

const internalComponents = [
  <%= classify(name) %>ListComponent,
  <%= classify(name) %>DetailsComponent
];

@NgModule({
  declarations: [
    ...internalComponents
  ],
  imports: [
    CommonModule,
    CommonSharedModule.forChild(),
    <%= classify(name) %>SharedModule.forChild(),
    RouterModule.forChild(ROUTES),
    SharedModule,
    MaterialModule
  ],
  providers: [
    AssetUrlPipe,
    <%= classify(name) %>Service
  ],
  entryComponents: [

  ]
})
export class <%= classify(name) %>Module { }
