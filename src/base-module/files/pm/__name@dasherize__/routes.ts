import { Routes } from '@angular/router';

// constants
import { ROUTES as APP_ROUTES } from './../../shared/constants';

// components
import { <%= classify(name_singular) %>ListComponent } from './<%= dasherize(name_singular) %>-list/<%= dasherize(name_singular) %>-list.component';
import { <%= classify(name_singular) %>DetailsComponent } from './<%= dasherize(name_singular) %>-details/<%= dasherize(name_singular) %>-details.component';

// services & helpers
import { UserResolverService } from 'src/app/shared/services/user-resolver.service';
import { <%= classify(name_singular) %>Resolver } from './router/resolver/<%= dasherize(name_singular) %>.resolver';

export const ROUTES: Routes = [
  {
    path: APP_ROUTES.HOME,
    component: <%= classify(name_singular) %>ListComponent,
    resolve: { user: UserResolverService }
  },
  {
    path: APP_ROUTES.<%= name_singular.toUpperCase() %>_DETAILS,
    component: <%= classify(name_singular) %>DetailsComponent,
    resolve: { user: UserResolverService, <%= camelize(name_singular) %>: <%= classify(name_singular) %>Resolver }
  }
];
