import { Routes } from '@angular/router';

import { ROUTES as APP_ROUTES } from './../../shared/constants';

import { <%= classify(name) %>ListComponent } from './<%= dasherize(name) %>-list/<%= dasherize(name) %>-list.component';
import { <%= classify(name) %>DetailsComponent } from './<%= dasherize(name) %>-details/<%= dasherize(name) %>-details.component';

import { UserResolverService } from 'src/app/shared/services/user-resolver.service';
import { <%= classify(name) %>Resolver } from './router/resolver/<%= dasherize(name) %>.resolver';

export const ROUTES: Routes = [
  {
    path: APP_ROUTES.HOME,
    component: <%= classify(name) %>ListComponent,
    resolve: { user: UserResolverService }
  },
  {
    path: APP_ROUTES.<%= name.toUpperCase() %>_DETAILS,
    component: <%= classify(name) %>DetailsComponent,
    resolve: { user: UserResolverService, <%= camelize(name) %>: <%= classify(name) %>Resolver }
  }
];
