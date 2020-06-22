import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Modules
import { SharedModule } from 'src/app/shared/components/shared.module';
import { MaterialModule } from 'src/app/shared/components/material.module';
import {
  PackagesModule as PackagesSharedModule,
  SharedModule as CommonSharedModule
} from 'rise-shared-module-frontend/src';

// Services & Pipes
import { AssetUrlPipe } from 'src/app/shared/pipes/asset-url.pipe';
import { PackagesService } from './store/__name@dasherize__.service';

// Constants
import { ROUTES } from './routes';

// Components
import { PackagesListComponent } from './packages-list/packages-list.component';
import { PackageDetailsComponent } from './package-details/package-details.component';

const internalComponents = [
  PackagesListComponent,
  PackageDetailsComponent
];

@NgModule({
  declarations: [
    ...internalComponents
  ],
  imports: [
    CommonModule,
    CommonSharedModule.forChild(),
    PackagesSharedModule.forChild(),
    RouterModule.forChild(ROUTES),
    SharedModule,
    MaterialModule
  ],
  providers: [
    AssetUrlPipe,
    PackagesService
  ],
  entryComponents: [

  ]
})
export class PackagesModule { }
