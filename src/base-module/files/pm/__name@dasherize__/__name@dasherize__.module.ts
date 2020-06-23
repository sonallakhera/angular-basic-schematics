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
import { <%= classify(name_singular) %>ListComponent } from './<%= dasherize(name_singular) %>-list/<%= dasherize(name_singular) %>-list.component';
import { <%= classify(name_singular) %>DetailsComponent } from './<%= dasherize(name_singular) %>-details/<%= dasherize(name_singular) %>-details.component';

const internalComponents = [
  <%= classify(name_singular) %>ListComponent,
  <%= classify(name_singular) %>DetailsComponent
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
