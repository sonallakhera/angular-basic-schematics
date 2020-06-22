import { Routes } from '@angular/router';

import { ROUTES as APP_ROUTES } from './../../shared/constants';

import { PackagesListComponent } from './packages-list/packages-list.component';
import { PackageDetailsComponent } from './package-details/package-details.component';

import { UserResolverService } from 'src/app/shared/services/user-resolver.service';

export const ROUTES: Routes = [
  {
    path: APP_ROUTES.HOME,
    component: PackagesListComponent,
    resolve: { user: UserResolverService }
  },
  {
    path: APP_ROUTES.PACKAGES_DETAILS,
    component: PackageDetailsComponent,
    resolve: { user: UserResolverService }
  }
];
